// Plinko Game JavaScript
class PlinkoGame {
    constructor() {
        this.canvas = document.getElementById('plinkoCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Load balance from localStorage or use default
        const savedBalance = localStorage.getItem('plinkoBalance');
        this.balance = savedBalance ? parseFloat(savedBalance) : 1000.00;
        
        this.betAmount = 1.00;
        this.isAutoMode = false;
        this.isDropping = false;
        this.balls = [];
        this.pegs = [];
        this.slots = [];
        this.rows = 16;
        this.difficulty = 'high';
        this.ballImage = new Image();
        this.ballImage.src = 'plinkoball.png.png';
        
        // Provably Fair System
        this.clientSeed = this.generateSeed();
        this.serverSeed = this.generateSeed();
        this.nonce = 0;
        this.gameHash = this.generateGameHash();
        
        this.multipliers = {
            high: ['1000x', '130x', '26x', '9x', '4x', '2x', '0.5x', '0.2x', '0.2x', '0.2x', '0.2x', '0.2x', '0.5x', '2x', '4x', '9x', '26x', '130x', '1000x'],
            medium: ['100x', '50x', '25x', '15x', '10x', '7x', '3x', '1.5x', '1x', '0.7x', '0.5x', '0.5x', '0.7x', '1.5x', '3x', '7x', '25x', '50x', '100x'],
            low: ['10x', '5x', '3x', '2x', '1.5x', '1.2x', '1.1x', '1x', '1x', '1x', '1.2x', '1.5x', '2x', '3x', '5x', '10x', '15x', '20x', '50x']
        };
        
        this.init();
    }
    
    // Provably Fair Functions
    generateSeed() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    // Provably Fair System with SHA-256
    async sha256(message) {
        // Encode as UTF-8
        const msgBuffer = new TextEncoder().encode(message);
        // Hash the message
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        // Convert to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    async generateGameHash() {
        const combined = this.clientSeed + this.serverSeed + this.nonce;
        return await this.sha256(combined);
    }
    
    // Generate result from hash (provably fair)
    async getProvablyFairResult() {
        const hash = await this.generateGameHash();
        // Take first 8 characters of hash and convert to number
        const result = parseInt(hash.substring(0, 8), 16);
        // Normalize to 0-100 range
        return (result % 10000) / 100;
    }
    
    showProvablyFairInfo() {
        const info = `
            Provably Fair Information:
            Client Seed: ${this.clientSeed}
            Server Seed: ${this.serverSeed}
            Nonce: ${this.nonce}
            Game Hash: ${this.gameHash}
        `;
        console.log(info);
        this.showNotification('Provably Fair info logged to console', 'info');
    }
    
    async rotateSeeds() {
        // Generate new seeds
        this.clientSeed = this.generateSeed();
        this.serverSeed = this.generateSeed();
        this.nonce = 0;
        this.gameHash = await this.generateGameHash();
        
        // Update display
        this.updateProvablyFairDisplay();
        
        this.showNotification('Seeds rotated! New game session started.', 'success');
    }
    
    updateProvablyFairDisplay() {
        document.getElementById('clientSeed').value = this.clientSeed;
        document.getElementById('serverSeed').value = this.serverSeed.substring(0, 20) + '...';
        document.getElementById('nonce').value = this.nonce;
        const gameHashInput = document.getElementById('gameHash');
        if (gameHashInput && this.gameHash) {
            gameHashInput.value = this.gameHash.substring(0, 32) + '...';
        }
    }
    
    async init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createPegs();
        this.createSlots();
        this.gameHash = await this.generateGameHash();
        this.updateProvablyFairDisplay();
        this.animate();
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = Math.min(rect.width - 40, 800);
        this.canvas.height = Math.min(rect.height - 40, 600);
    }
    
    setupEventListeners() {
        // Bet amount controls
        const betInput = document.getElementById('betAmount');
        const betUsd = document.getElementById('betUsd');
        
        betInput.addEventListener('input', (e) => {
            this.betAmount = parseFloat(e.target.value) || 0;
        });
        
        document.querySelector('.bet-btn-half').addEventListener('click', () => {
            this.betAmount = Math.max(0.01, this.betAmount / 2);
            betInput.value = this.betAmount.toFixed(2);
        });
        
        document.querySelector('.bet-btn-double').addEventListener('click', () => {
            this.betAmount = Math.min(1000, this.betAmount * 2);
            betInput.value = this.betAmount.toFixed(2);
        });
        
        // Difficulty and rows
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.createSlots();
        });
        
        // Bet button
        document.getElementById('betButton').addEventListener('click', () => {
            this.placeBet();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.createPegs();
            this.createSlots();
        });
    }
    
    createPegs() {
        this.pegs = [];
        const pegRadius = 4;
        const startY = 80;
        const spacing = this.canvas.width / (this.rows + 2);
        
        for (let row = 0; row < this.rows; row++) {
            const pegsInRow = row + 1;
            const rowWidth = pegsInRow * spacing;
            const startX = (this.canvas.width - rowWidth) / 2 + spacing / 2;
            
            for (let col = 0; col < pegsInRow; col++) {
                this.pegs.push({
                    x: startX + col * spacing,
                    y: startY + row * 30,
                    radius: pegRadius,
                    row: row,
                    col: col
                });
            }
        }
    }
    
    createSlots() {
        this.slots = [];
        const slotWidth = this.canvas.width / 19;
        const slotY = this.canvas.height - 60;
        const multipliers = this.multipliers[this.difficulty];
        
        for (let i = 0; i < 19; i++) {
            const multiplier = multipliers[i];
            let color;
            
            // Color coding based on multiplier value
            const multValue = parseFloat(multiplier.replace('x', ''));
            if (multValue >= 100) {
                color = '#ff4757'; // Red for 100x+
            } else if (multValue >= 50) {
                color = '#ff6348'; // Orange-red for 50x+
            } else if (multValue >= 20) {
                color = '#ff9f43'; // Orange for 20x+
            } else if (multValue >= 10) {
                color = '#feca57'; // Yellow for 10x+
            } else if (multValue >= 5) {
                color = '#48dbfb'; // Light blue for 5x+
            } else if (multValue >= 2) {
                color = '#0abde3'; // Blue for 2x+
            } else if (multValue >= 1) {
                color = '#10ac84'; // Green for 1x+
            } else {
                color = '#00d258'; // Bright green for <1x
            }
            
            this.slots.push({
                x: i * slotWidth + slotWidth / 2,
                y: slotY,
                width: slotWidth - 2, // Small gap between slots
                height: 45,
                multiplier: multiplier,
                color: color
            });
        }
    }
    
    async placeBet() {
        const totalBet = this.betAmount;
        
        if (totalBet > this.balance) {
            this.showNotification('Insufficient balance!', 'error');
            return;
        }
        
        if (this.betAmount <= 0) {
            this.showNotification('Please enter a bet amount!', 'error');
            return;
        }
        
        this.balance -= totalBet;
        this.updateBalanceDisplay();
        
        // Drop single ball
        await this.dropBall();
    }
    
    async dropBall() {
        // Get provably fair result FIRST using SHA-256 hash
        const rollResult = await this.getProvablyFairResult();
        
        // Map result to slot based on difficulty
        let targetSlot;
        if (this.difficulty === 'high') {
            if (rollResult < 0.1) targetSlot = 0;
            else if (rollResult < 0.4) targetSlot = 1;
            else if (rollResult < 1.2) targetSlot = 2;
            else if (rollResult < 2.7) targetSlot = 3;
            else if (rollResult < 5.2) targetSlot = 4;
            else if (rollResult < 9.2) targetSlot = 5;
            else if (rollResult < 15.2) targetSlot = 6;
            else if (rollResult < 86.2) targetSlot = 7 + Math.floor(((rollResult - 15.2) / 71) * 5);
            else if (rollResult < 92.2) targetSlot = 12;
            else if (rollResult < 96.2) targetSlot = 13;
            else if (rollResult < 98.7) targetSlot = 14;
            else if (rollResult < 99.5) targetSlot = 15;
            else if (rollResult < 99.8) targetSlot = 16;
            else if (rollResult < 99.9) targetSlot = 17;
            else targetSlot = 18;
        } else if (this.difficulty === 'medium') {
            // Weighted distribution for medium - make 100x and 50x rare
            if (rollResult < 0.3) targetSlot = 0;           // 100x - 0.3%
            else if (rollResult < 0.6) targetSlot = 1;      // 50x - 0.3%
            else if (rollResult < 1.2) targetSlot = 2;      // 25x - 0.6%
            else if (rollResult < 2.0) targetSlot = 3;      // 15x - 0.8%
            else if (rollResult < 3.5) targetSlot = 4;      // 10x - 1.5%
            else if (rollResult < 5.5) targetSlot = 5;      // 7x - 2.0%
            else if (rollResult < 8.5) targetSlot = 6;      // 3x - 3.0%
            else if (rollResult < 12.5) targetSlot = 7;     // 1.5x - 4.0%
            else if (rollResult < 18.5) targetSlot = 8;     // 1x - 6.0%
            else if (rollResult < 81.5) targetSlot = 9 + Math.floor(((rollResult - 18.5) / 63) * 2);  // 0.7x, 0.5x - 63%
            else if (rollResult < 87.5) targetSlot = 11;    // 0.5x - 6.0%
            else if (rollResult < 91.5) targetSlot = 12;    // 0.7x - 4.0%
            else if (rollResult < 95.5) targetSlot = 13;    // 1.5x - 4.0%
            else if (rollResult < 98.5) targetSlot = 14;    // 3x - 3.0%
            else if (rollResult < 99.3) targetSlot = 15;    // 7x - 0.8%
            else if (rollResult < 99.7) targetSlot = 16;   // 25x - 0.4%
            else if (rollResult < 99.85) targetSlot = 17;  // 50x - 0.15%
            else targetSlot = 18;                          // 100x - 0.15%
        } else {
            // Low difficulty - weighted toward center, extreme multipliers very rare
            if (rollResult < 0.1) targetSlot = 0;         // 10x - 0.1%
            else if (rollResult < 0.3) targetSlot = 1;      // 5x - 0.2%
            else if (rollResult < 0.7) targetSlot = 2;      // 3x - 0.4%
            else if (rollResult < 1.5) targetSlot = 3;      // 2x - 0.8%
            else if (rollResult < 3.0) targetSlot = 4;      // 1.5x - 1.5%
            else if (rollResult < 5.5) targetSlot = 5;      // 1.2x - 2.5%
            else if (rollResult < 9.0) targetSlot = 6;      // 1.1x - 3.5%
            else if (rollResult < 15.0) targetSlot = 7;     // 1x - 6.0%
            else if (rollResult < 85.0) targetSlot = 8 + Math.floor(((rollResult - 15.0) / 70) * 4);  // 1x, 1.2x - 70%
            else if (rollResult < 91.0) targetSlot = 12;    // 1.5x - 6.0%
            else if (rollResult < 94.5) targetSlot = 13;    // 2x - 3.5%
            else if (rollResult < 97.0) targetSlot = 14;    // 3x - 2.5%
            else if (rollResult < 98.5) targetSlot = 15;    // 5x - 1.5%
            else if (rollResult < 99.3) targetSlot = 16;    // 10x - 0.8%
            else if (rollResult < 99.7) targetSlot = 17;    // 20x - 0.4%
            else targetSlot = 18;                          // 50x - 0.3%
        }
        
        const targetX = this.slots[targetSlot].x;
        
        // Create ball that will go to the correct slot
        const ball = {
            x: this.canvas.width / 2,
            y: 30,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0.5,
            radius: 12,
            gravity: 0.15,
            damping: 0.98,
            bounce: 0.6,
            targetSlot: targetSlot,
            targetX: targetX,
            pegHits: 0,
            physicsEnabled: true,
            maxAge: 1000
        };
        
        this.balls.push(ball);
        this.nonce++;
        this.gameHash = await this.generateGameHash();
        this.updateProvablyFairDisplay();
    }
    
    updateBalls() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            // Remove old balls to prevent sticking
            ball.maxAge--;
            if (ball.maxAge <= 0) {
                this.balls.splice(i, 1);
                console.log('Removed old ball to prevent sticking');
                continue;
            }
            
            // Apply basic physics
            ball.vy += ball.gravity;
            ball.vx *= ball.damping;
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // GUIDE BALL TO TARGET SLOT - Add steering force
            if (ball.physicsEnabled && ball.y > 100) {
                const dx = ball.targetX - ball.x;
                const steeringForce = dx * 0.002; // Gentle steering
                ball.vx += steeringForce;
                
                // Limit horizontal velocity
                ball.vx = Math.max(-3, Math.min(3, ball.vx));
            }
            
            // Check collision with pegs (still realistic but guided)
            for (const peg of this.pegs) {
                const dx = ball.x - peg.x;
                const dy = ball.y - peg.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < ball.radius + peg.radius) {
                    // Collision detected
                    const angle = Math.atan2(dy, dx);
                    const targetX = peg.x + Math.cos(angle) * (ball.radius + peg.radius);
                    const targetY = peg.y + Math.sin(angle) * (ball.radius + peg.radius);
                    
                    ball.x = targetX;
                    ball.y = targetY;
                    
                    // Bounce with slight bias toward target
                    const randomFactor = 0.8 + Math.random() * 0.4;
                    const targetBias = (ball.targetX - ball.x) * 0.01; // Bias toward target
                    ball.vx = Math.cos(angle) * 2 * randomFactor + targetBias;
                    ball.vy = Math.abs(Math.sin(angle)) * 1.5 * randomFactor;
                    ball.pegHits++;
                }
            }
            
            // Check if ball reached bottom
            if (ball.y > this.canvas.height - 80) {
                // Find which slot the ball actually landed in
                let landedSlot = -1;
                for (let j = 0; j < this.slots.length; j++) {
                    const slot = this.slots[j];
                    if (Math.abs(ball.x - slot.x) < slot.width / 2) {
                        landedSlot = j;
                        break;
                    }
                }
                
                // Use the provably fair result regardless of where it landed
                const slot = this.slots[ball.targetSlot];
                
                console.log(`Ball completed! Using provably fair slot ${ball.targetSlot} (${slot.multiplier})`);
                
                if (slot) {
                    this.handleWin(slot.multiplier);
                }
                
                this.balls.splice(i, 1);
            }
            
            // Remove balls that go off screen
            if (ball.x < 0 || ball.x > this.canvas.width || ball.y > this.canvas.height) {
                this.balls.splice(i, 1);
            }
        }
    }
    
    handleWin(multiplier) {
        let winAmount = 0;
        const multValue = parseFloat(multiplier.replace('x', ''));
        winAmount = this.betAmount * multValue;
        
        this.balance += winAmount;
        this.updateBalanceDisplay();
        
        // Show realistic win messages
        if (multValue >= 100) {
            this.showNotification(`🎯 INSANE ${multiplier}! +$${winAmount.toFixed(2)} 🎯`, 'success');
        } else if (multValue >= 10) {
            this.showNotification(`🔥 ${multiplier}! +$${winAmount.toFixed(2)}`, 'success');
        } else if (multValue >= 2) {
            this.showNotification(`� ${multiplier}! +$${winAmount.toFixed(2)}`, 'success');
        } else if (multValue >= 1) {
            this.showNotification(`${multiplier}! +$${winAmount.toFixed(2)}`, 'success');
        } else {
            this.showNotification(`${multiplier}! +$${winAmount.toFixed(2)}`, 'info');
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f212e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pegs with better styling
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 5;
        for (const peg of this.pegs) {
            this.ctx.beginPath();
            this.ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;
        
        // Draw slots with rounded corners and better styling
        for (const slot of this.slots) {
            // Draw slot background with rounded corners
            this.ctx.fillStyle = slot.color;
            this.ctx.beginPath();
            const x = slot.x - slot.width/2;
            const y = slot.y;
            const w = slot.width;
            const h = slot.height;
            const r = 6; // corner radius
            
            this.ctx.moveTo(x + r, y);
            this.ctx.lineTo(x + w - r, y);
            this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            this.ctx.lineTo(x + w, y + h - r);
            this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.ctx.lineTo(x + r, y + h);
            this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            this.ctx.lineTo(x, y + r);
            this.ctx.quadraticCurveTo(x, y, x + r, y);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Add border
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw slot text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(slot.multiplier, slot.x, slot.y + slot.height/2);
        }
        
        // Draw balls
        for (const ball of this.balls) {
            // Save context state
            this.ctx.save();
            
            // Create circular clipping path
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.clip();
            
            // Draw the uploaded ball image within the circle
            if (this.ballImage.complete) {
                this.ctx.drawImage(
                    this.ballImage, 
                    ball.x - ball.radius, 
                    ball.y - ball.radius, 
                    ball.radius * 2, 
                    ball.radius * 2
                );
            } else {
                // Fallback gradient circle if image not loaded
                const gradient = this.ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
                gradient.addColorStop(0, '#ff6b6b');
                gradient.addColorStop(0.7, '#ee5a52');
                gradient.addColorStop(1, '#c4443c');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
            }
            
            // Restore context state
            this.ctx.restore();
            
            // Add subtle border for definition
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    animate() {
        this.updateBalls();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    updateBalanceDisplay() {
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `$${this.balance.toFixed(2)}`;
        }
        // Save to localStorage
        localStorage.setItem('plinkoBalance', this.balance.toString());
        
        // Also update main page balance if it exists
        const mainBalance = document.getElementById('balance');
        if (mainBalance && window.location.pathname.includes('plinko.html')) {
            // Sync with main page balance
            localStorage.setItem('mainBalance', this.balance.toString());
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `message ${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '80px';
        notification.style.right = '20px';
        notification.style.zIndex = '3000';
        notification.style.minWidth = '250px';
        notification.style.padding = '12px 16px';
        notification.style.borderRadius = '4px';
        notification.style.fontSize = '14px';
        notification.style.fontWeight = '500';
        
        // Set colors based on type
        switch(type) {
            case 'success':
                notification.style.background = '#00d258';
                notification.style.color = '#fff';
                break;
            case 'error':
                notification.style.background = '#ff4757';
                notification.style.color = '#fff';
                break;
            default:
                notification.style.background = '#1a2c38';
                notification.style.color = '#fff';
                notification.style.border = '1px solid rgba(255,255,255,0.2)';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new PlinkoGame();
});
