// Khudro Casino - Stake-like Interface JavaScript

// Global Variables
let currentUser = null;
let userBalance = 0;
let currentGame = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    initializeVideoBackground();
    updatePlayerCounts();
    
    // Load balance from localStorage or use demo balance
    const savedBalance = localStorage.getItem('mainBalance') || localStorage.getItem('plinkoBalance');
    currentUser = { username: 'Demo Player', balance: savedBalance ? parseFloat(savedBalance) : 1000 };
    userBalance = currentUser.balance;
    updateBalanceDisplay();
}

// Video Background Setup
function initializeVideoBackground() {
    const video = document.getElementById('bgVideo');
    if (video) {
        video.play().catch(e => console.log('Video autoplay failed:', e));
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Header Navigation
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });

    // Sidebar Navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', handleSidebarNavigation);
    });

    // Game Tabs
    document.querySelectorAll('.game-tab').forEach(btn => {
        btn.addEventListener('click', handleGameTab);
    });

    // User Actions
    document.getElementById('loginBtn')?.addEventListener('click', showLoginModal);
    document.getElementById('registerBtn')?.addEventListener('click', showRegisterModal);

    // Promotion Buttons
    document.querySelectorAll('.promo-btn').forEach(btn => {
        btn.addEventListener('click', handlePromotionClick);
    });

    // Search Bar
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Modal
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// Header Navigation Handler
function handleNavigation(e) {
    // Update active state
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
}

// Sidebar Navigation Handler
function handleSidebarNavigation(e) {
    const item = e.currentTarget;
    
    // Prevent interaction with disabled items
    if (item.classList.contains('disabled')) {
        return;
    }
    
    // Update active state
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Handle different sidebar actions
    const itemText = item.querySelector('span').textContent;
    
    if (itemText === 'News') {
        showNewsSection();
    } else if (itemText === 'Khudrobet Orgnals') {
        showGamesSection();
    } else if (itemText === 'Pennis') {
        showPennisSection();
    }
}

// Game Tab Handler
function handleGameTab(e) {
    // Update active state
    document.querySelectorAll('.game-tab').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Get all games grids
    const gamesGrids = document.querySelectorAll('.games-grid');
    
    // Hide all games grids
    gamesGrids.forEach(grid => grid.style.display = 'none');
    
    // Show appropriate grid based on active tab
    if (e.target.textContent === 'Khudrobetorginals') {
        gamesGrids[0].style.display = 'grid'; // Originals games
    } else if (e.target.textContent === 'Pennis') {
        gamesGrids[1].style.display = 'grid'; // Pennis sports (empty)
    }
}

// Game Click Handler
function handleGameClick(e) {
    const card = e.currentTarget;
    
    // Prevent interaction with disabled cards
    if (card.classList.contains('disabled')) {
        return;
    }
    
    const gameName = card.dataset.game;
    launchGame(gameName);
}

// Search Handler
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const gameName = card.dataset.game;
        const gameTitle = card.querySelector('h4').textContent.toLowerCase();
        
        if (gameName.includes(searchTerm) || gameTitle.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Promotion Click Handler
function handlePromotionClick(e) {
    // No notifications
}

// Game Interface Functions
function getMinesInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">💣 MINES</h3>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 1rem;">
                ${Array(25).fill().map((_, i) => `<button class="mine-tile" onclick="revealMine(${i})" style="width: 50px; height: 50px; background: #1a2c38; border: 1px solid #00d258; color: white; cursor: pointer;">?</button>`).join('')}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="cta-button primary" onclick="placeMinesBet()">PLACE BET</button>
                <button class="cta-button secondary" onclick="closeModal()">EXIT</button>
            </div>
            <div class="message info">Click tiles to reveal - avoid the mines!</div>
        </div>
    `;
}

function getDiceInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">🎲 DICE</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎲</div>
                <p style="margin-bottom: 1rem;">Roll over or under target number</p>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1rem;">
                    <button class="bet-btn" onclick="diceBet('under')">UNDER 50</button>
                    <button class="bet-btn" onclick="diceBet('over')">OVER 50</button>
                </div>
            </div>
            <div class="message success">Multiplier: Up to 900x</div>
        </div>
    `;
}

function getCrashInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">💥 CRASH</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem; color: #00d258;" id="crashMultiplier">1.00x</div>
                <p style="margin-bottom: 1rem;">Cash out before it crashes!</p>
                <button class="cta-button primary" onclick="cashOut()">CASH OUT</button>
            </div>
            <div class="message info">Multiplier increases until crash - cash out to win!</div>
        </div>
    `;
}

function getPlinkoInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">🎯 PLINKO</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                <p style="margin-bottom: 1rem;">Drop the ball and watch it bounce!</p>
                <button class="cta-button primary" onclick="dropPlinkoBall()">DROP BALL</button>
            </div>
            <div class="message success">Multiplier: Up to 1000x</div>
        </div>
    `;
}

function getLimboInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">🚀 LIMBO</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem; color: #00d258;" id="limboTarget">2.00x</div>
                <p style="margin-bottom: 1rem;">Bet on multiplier beating target</p>
                <button class="cta-button primary" onclick="placeLimboBet()">PLACE BET</button>
            </div>
            <div class="message info">Simple and fast - win if multiplier beats target!</div>
        </div>
    `;
}

function getBlackjackInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">♠️ BLACKJACK</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <p style="margin-bottom: 1rem;">Dealer: A♠️ 8♦️ = 19</p>
                <p style="margin-bottom: 1rem;">You: K♥️ 5♠️ = 15</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="bet-btn" onclick="blackjackAction('hit')">HIT</button>
                    <button class="bet-btn" onclick="blackjackAction('stand')">STAND</button>
                </div>
            </div>
            <div class="message info">Get closer to 21 than dealer without going over!</div>
        </div>
    `;
}

function getRouletteInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">🎡 ROULETTE</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🎡</div>
                <p style="margin-bottom: 1rem;">Place your bets on numbers or colors</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="bet-btn" onclick="rouletteBet('red')">RED</button>
                    <button class="bet-btn" onclick="rouletteBet('black')">BLACK</button>
                    <button class="bet-btn" onclick="rouletteBet('green')">GREEN</button>
                </div>
            </div>
            <div class="message info">Classic casino roulette!</div>
        </div>
    `;
}

function getBaccaratInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">👑 BACCARAT</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <p style="margin-bottom: 1rem;">Player: 9</p>
                <p style="margin-bottom: 1rem;">Banker: 7</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="bet-btn" onclick="baccaratBet('player')">PLAYER</button>
                    <button class="bet-btn" onclick="baccaratBet('banker')">BANKER</button>
                    <button class="bet-btn" onclick="baccaratBet('tie')">TIE</button>
                </div>
            </div>
            <div class="message info">Elegant card game - bet on player, banker, or tie!</div>
        </div>
    `;
}

function getChickenInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">🐔 CHICKEN</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🐔</div>
                <p style="margin-bottom: 1rem;">Watch the chicken cross the road!</p>
                <button class="cta-button primary" onclick="startChickenRace()">START RACE</button>
            </div>
            <div class="message success">Multiplier: Up to 100x</div>
        </div>
    `;
}

function getKenoInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">🎰 KENO</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px; margin-bottom: 1rem;">
                    ${Array(80).fill().map((_, i) => `<button class="keno-number" onclick="selectKenoNumber(${i+1})" style="width: 30px; height: 30px; background: #1a2c38; border: 1px solid #00d258; color: white; cursor: pointer; font-size: 12px;">${i+1}</button>`).join('')}
                </div>
                <button class="cta-button primary" onclick="placeKenoBet()">PLACE BET</button>
            </div>
            <div class="message info">Select numbers and watch the draw!</div>
        </div>
    `;
}

function getHiLoInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">📈 HILO</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">7</div>
                <p style="margin-bottom: 1rem;">Will next card be higher or lower?</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="bet-btn" onclick="hiloBet('higher')">HIGHER</button>
                    <button class="bet-btn" onclick="hiloBet('lower')">LOWER</button>
                </div>
            </div>
            <div class="message success">Multiplier: Up to 50x</div>
        </div>
    `;
}

function getWheelInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #00d258; margin-bottom: 1rem;">⭕ WHEEL</h3>
            <div style="background: #1a2c38; padding: 2rem; border-radius: 10px; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⭕</div>
                <p style="margin-bottom: 1rem;">Spin the wheel of fortune!</p>
                <button class="cta-button primary" onclick="spinWheel()">SPIN WHEEL</button>
            </div>
            <div class="message success">Multiplier: Up to 30x</div>
        </div>
    `;
}

// Game Action Functions
function revealMine(index) {
    const tiles = document.querySelectorAll('.mine-tile');
    tiles[index].textContent = Math.random() > 0.2 ? '💎' : '💣';
    tiles[index].disabled = true;
}

function placeMinesBet() {
    showNotification('Bet placed on Mines!', 'success');
}

function diceBet(type) {
    showNotification(`Bet placed on ${type.toUpperCase()} 50`, 'info');
    setTimeout(() => {
        const roll = Math.floor(Math.random() * 100) + 1;
        showNotification(`Dice rolled: ${roll}`, 'info');
    }, 1500);
}

function cashOut() {
    const multiplier = (Math.random() * 5 + 1).toFixed(2);
    showNotification(`Cashed out at ${multiplier}x!`, 'success');
}

function dropPlinkoBall() {
    showNotification('Ball dropped! Watch it bounce...', 'info');
    setTimeout(() => {
        const multiplier = Math.floor(Math.random() * 1000) + 1;
        showNotification(`Won ${multiplier}x!`, 'success');
    }, 2000);
}

function placeLimboBet() {
    showNotification('Bet placed on Limbo!', 'info');
    setTimeout(() => {
        const result = (Math.random() * 10).toFixed(2);
        showNotification(`Result: ${result}x`, 'info');
    }, 1500);
}

function blackjackAction(action) {
    showNotification(`Blackjack: ${action.toUpperCase()}`, 'info');
}

function rouletteBet(color) {
    showNotification(`Bet placed on ${color.toUpperCase()}`, 'info');
    setTimeout(() => {
        const number = Math.floor(Math.random() * 37);
        showNotification(`Ball landed on ${number}`, 'info');
    }, 2000);
}

function baccaratBet(betType) {
    showNotification(`Bet on ${betType.toUpperCase()}`, 'info');
}

function startChickenRace() {
    showNotification('Chicken race started!', 'info');
}

function selectKenoNumber(number) {
    showNotification(`Selected number ${number}`, 'info');
}

function placeKenoBet() {
    showNotification('Keno bet placed!', 'info');
}

function hiloBet(direction) {
    showNotification(`Bet on ${direction.toUpperCase()}`, 'info');
}

function spinWheel() {
    showNotification('Wheel spinning...', 'info');
    setTimeout(() => {
        const multiplier = Math.floor(Math.random() * 30) + 1;
        showNotification(`Won ${multiplier}x!`, 'success');
    }, 3000);
}

// Update Player Counts
function updatePlayerCounts() {
    setInterval(() => {
        document.querySelectorAll('.players-count').forEach(element => {
            const currentCount = parseInt(element.textContent.replace(/[^\d]/g, ''));
            const change = Math.floor(Math.random() * 20) - 10;
            const newCount = Math.max(100, currentCount + change);
            element.textContent = `${newCount.toLocaleString()} in the game`;
        });
    }, 5000);
}

// User Authentication
function showLoginModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'LOGIN TO KHUDRO';
    modalBody.innerHTML = `
        <form onsubmit="handleLogin(event)">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Username/Email</label>
                <input type="text" id="loginUsername" style="width: 100%; padding: 0.5rem; background: #1a2c38; border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Password</label>
                <input type="password" id="loginPassword" style="width: 100%; padding: 0.5rem; background: #1a2c38; border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" id="rememberMe">
                    <span>Remember me</span>
                </label>
            </div>
            <button type="submit" class="cta-button primary" style="width: 100%;">LOGIN</button>
            <div style="text-align: center; margin-top: 1rem;">
                <a href="#" onclick="showRegisterModal(); return false;" style="color: #00d258;">Don't have an account? Register</a>
            </div>
        </form>
    `;
    
    openModal();
}

function showRegisterModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'REGISTER AT KHUDRO';
    modalBody.innerHTML = `
        <form onsubmit="handleRegister(event)">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Username</label>
                <input type="text" id="regUsername" style="width: 100%; padding: 0.5rem; background: #1a2c38; border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Email</label>
                <input type="email" id="regEmail" style="width: 100%; padding: 0.5rem; background: #1a2c38; border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Password</label>
                <input type="password" id="regPassword" style="width: 100%; padding: 0.5rem; background: #1a2c38; border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" id="agreeTerms" required>
                    <span>I agree to the terms and conditions</span>
                </label>
            </div>
            <button type="submit" class="cta-button primary" style="width: 100%;">REGISTER</button>
            <div style="text-align: center; margin-top: 1rem;">
                <a href="#" onclick="showLoginModal(); return false;" style="color: #00d258;">Already have an account? Login</a>
            </div>
        </form>
    `;
    
    openModal();
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    
    currentUser = { username, balance: 1000 };
    showNotification(`Welcome back, ${username}!`, 'success');
    closeModal();
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    
    currentUser = { username, balance: 500 };
    showNotification(`Welcome to Khudro, ${username}! $500 bonus added!`, 'success');
    closeModal();
}

// Modal Functions
function openModal() {
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `message ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Section Display Functions
function showNewsSection() {
    // Hide all other sections
    document.getElementById('casinoContent').style.display = 'none';
    document.getElementById('pennisSection').style.display = 'none';
    document.getElementById('rewardsSectionContainer').style.display = 'none';
    
    // Show news container
    const newsContainer = document.getElementById('newsSectionContainer');
    newsContainer.style.display = 'block';
    newsContainer.innerHTML = `
        <div class="news-section">
            <h2 style="color: #ffd700; margin-bottom: 2rem; font-size: 2.5rem; text-align: center;">📰 KHUDRO NEWS 📰</h2>
            
            <div class="news-grid">
                <div class="news-card">
                    <div class="news-date">Feb 6, 2026</div>
                    <h3>🎨 UI Improvement</h3>
                    <p>UI improvment</p>
                </div>
                <div class="news-card">
                    <div class="news-date">Feb 6, 2026</div>
                    <h3>🏓 Pennis Added</h3>
                    <p>added pennis</p>
                </div>
            </div>
        </div>
    `;
}

function showRewardsSection() {
    // Hide all other sections
    document.getElementById('casinoContent').style.display = 'none';
    document.getElementById('pennisSection').style.display = 'none';
    document.getElementById('newsSectionContainer').style.display = 'none';
    
    // Show rewards container
    const rewardsContainer = document.getElementById('rewardsSectionContainer');
    rewardsContainer.style.display = 'block';
    rewardsContainer.innerHTML = `
        <div class="rewards-section">
            <h2 style="color: #ffd700; margin-bottom: 2rem; font-size: 2.5rem; text-align: center;">🎁 REWARDS 🎁</h2>
            
            <div class="rewards-grid">
                <div class="reward-card active">
                    <div class="reward-icon">💰</div>
                    <h3>1% Rakeback</h3>
                    <p>Get 1% of your total wagered amount back every week</p>
                    <div class="reward-status">Active</div>
                </div>
                
                <div class="reward-card soon">
                    <div class="reward-icon">📅</div>
                    <h3>Monthly Bonus</h3>
                    <p>Exclusive monthly bonus based on your activity</p>
                    <div class="reward-status">Coming Soon</div>
                </div>
                
                <div class="reward-card soon">
                    <div class="reward-icon">🗓️</div>
                    <h3>Weekly Bonus</h3>
                    <p>Claim your weekly bonus every 7 days</p>
                    <div class="reward-status">Coming Soon</div>
                </div>
            </div>
            
            <div class="rewards-info">
                <h3 style="color: #00d258; margin-bottom: 1rem;">How it works</h3>
                <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">
                    Play games and earn rewards automatically. The more you play, the more you earn!
                    Rakeback is calculated weekly and credited to your account every Monday.
                </p>
            </div>
        </div>
    `;
}

function showGamesSection() {
    // Hide all other sections
    document.getElementById('pennisSection').style.display = 'none';
    document.getElementById('newsSectionContainer').style.display = 'none';
    document.getElementById('rewardsSectionContainer').style.display = 'none';
    
    // Show casino content
    document.getElementById('casinoContent').style.display = 'block';
}

function showPennisSection() {
    // Hide all other sections
    document.getElementById('casinoContent').style.display = 'none';
    document.getElementById('newsSectionContainer').style.display = 'none';
    document.getElementById('rewardsSectionContainer').style.display = 'none';
    
    // Show pennis section
    document.getElementById('pennisSection').style.display = 'block';
}

// Launch Game - Direct interface like Stake.com
function launchGame(gameName) {
    // Check if game is disabled
    const gameCard = document.querySelector(`[data-game="${gameName}"]`);
    if (gameCard && gameCard.classList.contains('disabled')) {
        return;
    }
    
    currentGame = gameName;
    
    // Show game interface directly - no loading
    showGameInterface(gameName);
}

// Show Game Interface
function showGameInterface(gameName) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = gameName.toUpperCase();
    
    let gameHTML = '';
    
    switch(gameName) {
        case 'dice':
            gameHTML = getDiceInterface();
            break;
        case 'blackjack':
            gameHTML = getBlackjackInterface();
            break;
        case 'roulette':
            gameHTML = getRouletteInterface();
            break;
        case 'craps':
            gameHTML = getCrapsInterface();
            break;
        case 'baccarat':
            gameHTML = getBaccaratInterface();
            break;
        case 'wheel':
            gameHTML = getWheelInterface();
            break;
        case 'poker':
            gameHTML = getPokerInterface();
            break;
        default:
            gameHTML = '<p>Game not available</p>';
    }
    
    modalBody.innerHTML = gameHTML;
    openModal();
}

// Game Interfaces
function getBlackjackInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #ffd700; margin-bottom: 1rem;">♠️ BLACKJACK PRO ♠️</h3>
            <div style="background: rgba(0,100,0,0.3); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                <p>Dealer: A♠️ 8♦️ = 19</p>
                <p>You: K♥️ 5♠️ = 15</p>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1rem;">
                <button class="cta-button primary" onclick="blackjackAction('hit')">HIT</button>
                <button class="cta-button secondary" onclick="blackjackAction('stand')">STAND</button>
                <button class="cta-button secondary" onclick="blackjackAction('double')">DOUBLE</button>
            </div>
            <div class="message info">Current Bet: $50.00</div>
        </div>
    `;
}

function getRouletteInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #ffd700; margin-bottom: 1rem;">🎰 ROULETTE ROYALE 🎰</h3>
            <div style="background: radial-gradient(circle, #8B0000, #000); padding: 2rem; border-radius: 50%; margin-bottom: 1rem; width: 150px; height: 150px; margin: 0 auto 1rem;">
                <div style="color: #fff; font-size: 2rem; margin-top: 60px;">27</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; max-width: 200px; margin: 0 auto 1rem;">
                <button class="bet-btn" onclick="placeBet('red')">RED</button>
                <button class="bet-btn" onclick="placeBet('black')">BLACK</button>
                <button class="bet-btn" onclick="placeBet('green')">GREEN</button>
            </div>
            <div class="message info">Place your bets!</div>
        </div>
    `;
}

function getCrapsInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #ffd700; margin-bottom: 1rem;">🎲 CRAPS MASTERY 🎲</h3>
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚀⚁</div>
            <p style="margin-bottom: 1rem;">Roll: 7 - Natural Win!</p>
            <button class="cta-button primary" onclick="rollDice()">ROLL DICE</button>
            <div class="message success">You won $100.00!</div>
        </div>
    `;
}

function getBaccaratInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #ffd700; margin-bottom: 1rem;">👑 BACCARAT ELITE 👑</h3>
            <div style="display: flex; justify-content: space-around; margin-bottom: 1rem;">
                <div>
                    <p>Player</p>
                    <p style="font-size: 1.5rem;">9</p>
                </div>
                <div>
                    <p>Banker</p>
                    <p style="font-size: 1.5rem;">7</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="bet-btn" onclick="baccaratBet('player')">PLAYER</button>
                <button class="bet-btn" onclick="baccaratBet('banker')">BANKER</button>
                <button class="bet-btn" onclick="baccaratBet('tie')">TIE</button>
            </div>
        </div>
    `;
}

function getWheelInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #ffd700; margin-bottom: 1rem;">💰 MONEY WHEEL 💰</h3>
            <div style="background: conic-gradient(from 0deg, #ff0000, #ffd700, #00ff00, #0000ff, #ff0000); width: 150px; height: 150px; border-radius: 50%; margin: 0 auto 1rem; animation: spin 3s linear infinite;"></div>
            <button class="cta-button primary" onclick="spinWheel()">SPIN THE WHEEL</button>
            <div class="message info">Multipliers up to 50x!</div>
        </div>
    `;
}

function getPokerInterface() {
    return `
        <div style="text-align: center;">
            <h3 style="color: #ffd700; margin-bottom: 1rem;">♦️ POKER PRO ♦️</h3>
            <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="font-size: 2rem;">A♠️</span>
                <span style="font-size: 2rem;">K♥️</span>
                <span style="font-size: 2rem;">Q♦️</span>
                <span style="font-size: 2rem;">J♣️</span>
                <span style="font-size: 2rem;">10♠️</span>
            </div>
            <p style="margin-bottom: 1rem;">Royal Flush! You win!</p>
            <button class="cta-button primary" onclick="newPokerHand()">NEW HAND</button>
            <div class="message success">Jackpot! $10,000.00</div>
        </div>
    `;
}

// Game Actions
function blackjackAction(action) {
    showNotification(`Blackjack: ${action.toUpperCase()}`, 'info');
    // Simulate game logic
    setTimeout(() => {
        const result = Math.random() > 0.5 ? 'win' : 'lose';
        if (result === 'win') {
            showNotification('You won $100!', 'success');
            updateBalance(100);
        } else {
            showNotification('You lost $50', 'error');
            updateBalance(-50);
        }
    }, 1000);
}

function placeBet(betType) {
    showNotification(`Bet placed on ${betType.toUpperCase()}`, 'info');
    setTimeout(() => {
        const number = Math.floor(Math.random() * 37);
        showNotification(`Ball landed on ${number}`, 'info');
    }, 2000);
}

function rollDice() {
    showNotification('Rolling dice...', 'info');
    setTimeout(() => {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;
        showNotification(`Rolled ${dice1} + ${dice2} = ${total}`, 'info');
    }, 1500);
}

function baccaratBet(betType) {
    showNotification(`Bet on ${betType.toUpperCase()}`, 'info');
    setTimeout(() => {
        const winner = ['player', 'banker', 'tie'][Math.floor(Math.random() * 3)];
        showNotification(`Winner: ${winner.toUpperCase()}`, 'info');
    }, 2000);
}

function spinWheel() {
    showNotification('Wheel spinning...', 'info');
    setTimeout(() => {
        const multiplier = Math.floor(Math.random() * 50) + 1;
        showNotification(`You won ${multiplier}x!`, 'success');
    }, 3000);
}

function newPokerHand() {
    showNotification('Dealing new hand...', 'info');
    setTimeout(() => {
        showNotification('New hand dealt', 'success');
    }, 1500);
}

// User Authentication
function showLoginModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'LOGIN TO KHUDROORGINALS';
    modalBody.innerHTML = `
        <form onsubmit="handleLogin(event)">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Username/Email</label>
                <input type="text" id="loginUsername" style="width: 100%; padding: 0.5rem; background: rgba(255,255,255,0.1); border: 1px solid #ffd700; color: #fff; border-radius: 5px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Password</label>
                <input type="password" id="loginPassword" style="width: 100%; padding: 0.5rem; background: rgba(255,255,255,0.1); border: 1px solid #ffd700; color: #fff; border-radius: 5px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" id="rememberMe">
                    <span>Remember me</span>
                </label>
            </div>
            <button type="submit" class="cta-button primary" style="width: 100%;">LOGIN</button>
            <div style="text-align: center; margin-top: 1rem;">
                <a href="#" onclick="showRegisterModal(); return false;" style="color: #ffd700;">Don't have an account? Register</a>
            </div>
        </form>
    `;
    
    openModal();
}

function showRegisterModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'REGISTER AT KHUDROORGINALS';
    modalBody.innerHTML = `
        <form onsubmit="handleRegister(event)">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Username</label>
                <input type="text" id="regUsername" style="width: 100%; padding: 0.5rem; background: rgba(255,255,255,0.1); border: 1px solid #ffd700; color: #fff; border-radius: 5px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Email</label>
                <input type="email" id="regEmail" style="width: 100%; padding: 0.5rem; background: rgba(255,255,255,0.1); border: 1px solid #ffd700; color: #fff; border-radius: 5px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem;">Password</label>
                <input type="password" id="regPassword" style="width: 100%; padding: 0.5rem; background: rgba(255,255,255,0.1); border: 1px solid #ffd700; color: #fff; border-radius: 5px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" id="agreeTerms" required>
                    <span>I agree to the terms and conditions</span>
                </label>
            </div>
            <button type="submit" class="cta-button primary" style="width: 100%;">REGISTER</button>
            <div style="text-align: center; margin-top: 1rem;">
                <a href="#" onclick="showLoginModal(); return false;" style="color: #ffd700;">Already have an account? Login</a>
            </div>
        </form>
    `;
    
    openModal();
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate login
    currentUser = { username, balance: 1000 };
    userBalance = 1000;
    
    updateBalanceDisplay();
    showNotification(`Welcome back, ${username}!`, 'success');
    closeModal();
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    // Simulate registration
    currentUser = { username, email, balance: 500 };
    userBalance = 500;
    
    updateBalanceDisplay();
    showNotification(`Welcome to KhudroOrginals, ${username}! $500 bonus added!`, 'success');
    closeModal();
}

// Play Now and Demo
function handlePlayNow() {
    if (!currentUser) {
        showLoginModal();
    } else {
        scrollToSection('.games-section');
    }
}

function handleDemoPlay() {
    showNotification('Demo mode activated! No real money required.', 'info');
    currentUser = { username: 'Demo Player', balance: 10000 };
    userBalance = 10000;
    updateBalanceDisplay();
    scrollToSection('.games-section');
}

// Promotion Handlers
function handlePromotionClaim(e) {
    const promo = e.target.dataset.promo;
    
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    switch(promo) {
        case 'fatpig':
            showNotification('🐷 VILX FAT PIG bonus activated! 500% bonus added!', 'success');
            updateBalance(2500);
            break;
        case 'cashback':
            showNotification('Daily cashback activated!', 'success');
            break;
        case 'loyalty':
            showVipModal();
            break;
    }
}

// VIP Modal
function showVipModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = '👑 VIP PROGRAM';
    modalBody.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #ffd700; margin-bottom: 1rem;">Become a VIP Member</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div class="vip-level">
                    <h4 style="color: #bronze;">BRONZE</h4>
                    <p>5% Cashback</p>
                </div>
                <div class="vip-level">
                    <h4 style="color: #silver;">SILVER</h4>
                    <p>10% Cashback</p>
                </div>
                <div class="vip-level">
                    <h4 style="color: #gold;">GOLD</h4>
                    <p>15% Cashback</p>
                </div>
            </div>
            <button class="cta-button primary" onclick="joinVip()">JOIN VIP NOW</button>
        </div>
    `;
    
    openModal();
}

function joinVip() {
    showNotification('Welcome to VIP! Exclusive benefits activated!', 'success');
    closeModal();
}

// Support Modal
function showSupportModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'SUPPORT CENTER';
    modalBody.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #ffd700; margin-bottom: 1rem;">How can we help you?</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <button class="cta-button secondary" onclick="contactSupport('livechat')">💬 Live Chat</button>
                <button class="cta-button secondary" onclick="contactSupport('email')">📧 Email Support</button>
                <button class="cta-button secondary" onclick="contactSupport('faq')">❓ FAQ</button>
            </div>
            <div class="message info">24/7 Support Available</div>
        </div>
    `;
    
    openModal();
}

function contactSupport(method) {
    showNotification(`${method.toUpperCase()} support opening...`, 'info');
    closeModal();
}

// Modal Functions
function openModal() {
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Alert Banner Functions
function closeAlertBanner() {
    document.getElementById('alertBanner').style.display = 'none';
}

function rotateAlertMessages() {
    let currentIndex = 0;
    setInterval(() => {
        currentIndex = (currentIndex + 1) % alertMessages.length;
        const alertText = document.getElementById('alertText');
        if (alertText) {
            alertText.style.opacity = '0';
            setTimeout(() => {
                alertText.textContent = alertMessages[currentIndex];
                alertText.style.opacity = '1';
            }, 500);
        }
    }, 5000);
}

// Update Functions
function updateBalance(amount) {
    userBalance += amount;
    updateBalanceDisplay();
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = `$${userBalance.toFixed(2)}`;
    }
    // Save to localStorage for synchronization
    localStorage.setItem('mainBalance', userBalance.toString());
}

function updateStats() {
    // Update player count
    setInterval(() => {
        playerCount += Math.floor(Math.random() * 10) - 5;
        if (playerCount < 10000) playerCount = 12847;
        const playerElement = document.getElementById('playerCount');
        if (playerElement) {
            playerElement.textContent = playerCount.toLocaleString();
        }
    }, 5000);

    // Update jackpot
    setInterval(() => {
        jackpotAmount += Math.random() * 100;
        const jackpotElement = document.getElementById('megaJackpot');
        if (jackpotElement) {
            jackpotElement.textContent = `$${jackpotAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        }
        const jackpotElement2 = document.getElementById('jackpot');
        if (jackpotElement2) {
            jackpotElement2.textContent = `$${Math.floor(jackpotAmount).toLocaleString()}`;
        }
    }, 3000);

    // Update total winnings
    setInterval(() => {
        totalWinnings += Math.random() * 1000;
        const winningsElement = document.getElementById('totalWinnings');
        if (winningsElement) {
            winningsElement.textContent = `$${(totalWinnings / 1000000).toFixed(1)}M`;
        }
    }, 8000);

    // Countdown timer
    let countdownSeconds = 9045; // 2:34:15 in seconds
    setInterval(() => {
        countdownSeconds--;
        if (countdownSeconds < 0) countdownSeconds = 9045;
        
        const hours = Math.floor(countdownSeconds / 3600);
        const minutes = Math.floor((countdownSeconds % 3600) / 60);
        const seconds = countdownSeconds % 60;
        
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }, 1000);
}

// Animation Functions
function startAnimations() {
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Utility Functions
function scrollToSection(selector) {
    const section = document.querySelector(selector);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `message ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '3000';
    notification.style.minWidth = '250px';
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS for bet buttons
const style = document.createElement('style');
style.textContent = `
    .bet-btn {
        background: rgba(255,215,0,0.2);
        border: 2px solid #ffd700;
        color: #ffd700;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: bold;
    }
    .bet-btn:hover {
        background: #ffd700;
        color: #000;
        transform: scale(1.05);
    }
    .vip-level {
        background: rgba(255,255,255,0.1);
        padding: 1rem;
        border-radius: 10px;
        border: 1px solid rgba(255,215,0,0.3);
    }
`;
// Global variables for current bet
let currentBetGame = null;
let currentBetOption = null;
let currentBetMultiplier = 1;

// Initialize betting system
function initBettingSystem() {
    loadBetsFromStorage();
    startCountdownTimers();
    updateBettingPools();
    checkGameResults();
}

// Load bets from localStorage
function loadBetsFromStorage() {
    const bets = JSON.parse(localStorage.getItem('khudroBets') || '{}');
    
    // Update UI for each game
    Object.keys(bets).forEach(gameId => {
        const gameBets = bets[gameId];
        updateUserBetDisplay(gameId, gameBets);
    });
}

// Start countdown timers for all games
function startCountdownTimers() {
    updateTimers();
    setInterval(updateTimers, 1000);
}

// Update all countdown timers
function updateTimers() {
    const now = new Date().getTime();
    
    document.querySelectorAll('.countdown').forEach(timer => {
        let endTime;
        
        if (timer.dataset.end) {
            // Fixed end date (Game 1)
            endTime = new Date(timer.dataset.end).getTime();
        } else if (timer.dataset.hours) {
            // Hours from page load (Game 2) - stored in localStorage for persistence
            const gameStart = localStorage.getItem('game2StartTime');
            if (!gameStart) {
                localStorage.setItem('game2StartTime', now.toString());
                endTime = now + (6 * 60 * 60 * 1000);
            } else {
                endTime = parseInt(gameStart) + (6 * 60 * 60 * 1000);
            }
        }
        
        const distance = endTime - now;
        
        if (distance < 0) {
            timer.textContent = 'ENDED';
            timer.style.color = '#ff4757';
            const gameCard = timer.closest('.betting-game');
            if (gameCard) {
                const status = gameCard.querySelector('.betting-game-status');
                if (status) {
                    status.textContent = 'ENDED';
                    status.classList.remove('live');
                    status.classList.add('ended');
                }
            }
        } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            if (days > 0) {
                timer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            } else {
                timer.textContent = `${hours}h ${minutes}m ${seconds}s`;
            }
        }
    });
}

// Place bet function
function placeBet(gameId, option, multiplier) {
    console.log('placeBet called:', gameId, option, multiplier);
    
    try {
        // Check if user already bet on this game
        const bets = JSON.parse(localStorage.getItem('khudroBets') || '{}');
        console.log('Existing bets:', bets);
        
        if (bets[gameId]) {
            showNotification('You already placed a bet on this game!', 'error');
            return;
        }
        
        // Get game question from the match-teams div
        const gameCard = document.getElementById(gameId);
        console.log('Game card found:', gameCard);
        
        if (!gameCard) {
            showNotification('Game not found!', 'error');
            return;
        }
        
        const matchTeams = gameCard.querySelector('.match-teams');
        console.log('Match teams element:', matchTeams);
        
        if (!matchTeams) {
            showNotification('Match info not found!', 'error');
            return;
        }
        
        const question = matchTeams.textContent;
        console.log('Question:', question);
        
        // Set current bet details
        currentBetGame = gameId;
        currentBetOption = option;
        currentBetMultiplier = multiplier;
        
        // Update modal
        const modalQuestion = document.getElementById('betModalQuestion');
        const modalSelection = document.getElementById('betSelection');
        const modalOverlay = document.getElementById('betModalOverlay');
        
        console.log('Modal elements:', { modalQuestion, modalSelection, modalOverlay });
        
        if (modalQuestion) modalQuestion.textContent = question;
        if (modalSelection) modalSelection.value = option.toUpperCase();
        
        const betInput = document.getElementById('betAmountInput');
        if (betInput) betInput.value = '10';
        
        updatePotentialWin();
        
        // Show modal
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            console.log('Modal shown');
        } else {
            showNotification('Modal not found!', 'error');
        }
    } catch (error) {
        console.error('Error in placeBet:', error);
        showNotification('Error placing bet: ' + error.message, 'error');
    }
}

// Update potential win amount
function updatePotentialWin() {
    const amount = parseFloat(document.getElementById('betAmountInput').value) || 0;
    const win = amount * currentBetMultiplier;
    document.getElementById('potentialWin').textContent = `$${win.toFixed(2)}`;
}

// Close bet modal
function closeBetModal() {
    document.getElementById('betModalOverlay').classList.remove('active');
    currentBetGame = null;
    currentBetOption = null;
    currentBetMultiplier = 1;
}

// Confirm bet
function confirmBet() {
    const amount = parseFloat(document.getElementById('betAmountInput').value);
    
    if (!amount || amount <= 0) {
        showNotification('Please enter a valid bet amount!', 'error');
        return;
    }
    
    // Check balance
    const currentBalance = parseFloat(localStorage.getItem('mainBalance') || '1000');
    if (amount > currentBalance) {
        showNotification('Insufficient balance!', 'error');
        return;
    }
    
    // Deduct from balance
    const newBalance = currentBalance - amount;
    localStorage.setItem('mainBalance', newBalance.toString());
    localStorage.setItem('plinkoBalance', newBalance.toString());
    
    // Update balance display
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = `$${newBalance.toFixed(2)}`;
    }
    
    // Save bet to localStorage
    const bets = JSON.parse(localStorage.getItem('khudroBets') || '{}');
    bets[currentBetGame] = {
        option: currentBetOption,
        amount: amount,
        multiplier: currentBetMultiplier,
        potentialWin: amount * currentBetMultiplier,
        placedAt: new Date().toISOString(),
        settled: false
    };
    localStorage.setItem('khudroBets', JSON.stringify(bets));
    
    // Update pool
    updatePool(currentBetGame, amount);
    
    // Update UI
    updateUserBetDisplay(currentBetGame, bets[currentBetGame]);
    
    showNotification(`Bet placed! $${amount.toFixed(2)} on ${currentBetOption.toUpperCase()}`, 'success');
    closeBetModal();
}

// Update betting pool display
function updatePool(gameId, amount) {
    const poolElement = document.getElementById(`pool-${gameId}`);
    if (poolElement) {
        const currentPool = parseFloat(poolElement.textContent) || 0;
        const newPool = currentPool + amount;
        poolElement.textContent = newPool.toFixed(2);
        
        // Save pool to localStorage
        const pools = JSON.parse(localStorage.getItem('khudroPools') || '{}');
        pools[gameId] = newPool;
        localStorage.setItem('khudroPools', JSON.stringify(pools));
    }
}

// Update all betting pools on load
function updateBettingPools() {
    const pools = JSON.parse(localStorage.getItem('khudroPools') || '{}');
    Object.keys(pools).forEach(gameId => {
        const poolElement = document.getElementById(`pool-${gameId}`);
        if (poolElement) {
            poolElement.textContent = pools[gameId].toFixed(2);
        }
    });
}

// Update user bet display
function updateUserBetDisplay(gameId, betData) {
    const container = document.getElementById(`user-bet-${gameId}`);
    if (container && betData) {
        if (betData.settled) {
            if (betData.won) {
                container.innerHTML = `<div class="bet-won">✅ WON! +$${betData.winnings.toFixed(2)}</div>`;
            } else {
                container.innerHTML = `<div class="bet-lost">❌ LOST -$${betData.amount.toFixed(2)}</div>`;
            }
        } else {
            container.innerHTML = `<div class="bet-placed">💰 Bet: $${betData.amount.toFixed(2)} on ${betData.option.toUpperCase()} (${betData.multiplier}x)</div>`;
        }
    }
}

// Filter bets function
function filterBets(filter) {
    // Update active filter button
    document.querySelectorAll('.pennis-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const bets = JSON.parse(localStorage.getItem('khudroBets') || '{}');
    const games = ['game1', 'game2'];
    
    games.forEach(gameId => {
        const gameCard = document.getElementById(gameId);
        const betData = bets[gameId];
        
        if (!betData) {
            // No bet placed - show only in 'all' filter
            if (filter === 'all') {
                gameCard.style.display = 'flex';
            } else {
                gameCard.style.display = 'none';
            }
            return;
        }
        
        let show = false;
        if (filter === 'all') {
            show = true;
        } else if (filter === 'active' && !betData.settled) {
            show = true;
        } else if (filter === 'won' && betData.settled && betData.won) {
            show = true;
        } else if (filter === 'lost' && betData.settled && !betData.won) {
            show = true;
        }
        
        gameCard.style.display = show ? 'flex' : 'none';
    });
}
function checkGameResults() {
    const now = new Date().getTime();
    const bets = JSON.parse(localStorage.getItem('khudroBets') || '{}');
    
    // Game 1: Ends 31.12.2026, Winner: NO
    const game1End = new Date('2026-12-31T23:59:59').getTime();
    if (now > game1End && bets['game1'] && !bets['game1'].settled) {
        settleBet('game1', 'no');
    }
    
    // Game 2: Ends 6 hours from start, Winner: YES
    const game2Start = localStorage.getItem('game2StartTime');
    if (game2Start) {
        const game2End = parseInt(game2Start) + (6 * 60 * 60 * 1000);
        if (now > game2End && bets['game2'] && !bets['game2'].settled) {
            settleBet('game2', 'yes');
        }
    }
    
    // Check periodically
    setTimeout(checkGameResults, 5000);
}

// Settle a bet
function settleBet(gameId, winningOption) {
    const bets = JSON.parse(localStorage.getItem('khudroBets') || '{}');
    const bet = bets[gameId];
    
    if (!bet || bet.settled) return;
    
    bet.settled = true;
    
    if (bet.option === winningOption) {
        // Winner!
        bet.won = true;
        bet.winnings = bet.amount * bet.multiplier;
        
        // Add winnings to balance
        const currentBalance = parseFloat(localStorage.getItem('mainBalance') || '1000');
        const newBalance = currentBalance + bet.winnings;
        localStorage.setItem('mainBalance', newBalance.toString());
        localStorage.setItem('plinkoBalance', newBalance.toString());
        
        // Update balance display
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = `$${newBalance.toFixed(2)}`;
        }
        
        showNotification(`🎉 Bet WON! You won $${bet.winnings.toFixed(2)}!`, 'success');
    } else {
        // Loser
        bet.won = false;
        showNotification('Bet lost. Better luck next time!', 'info');
    }
    
    // Save updated bet
    bets[gameId] = bet;
    localStorage.setItem('khudroBets', JSON.stringify(bets));
}

// Event listener for bet amount input
document.addEventListener('DOMContentLoaded', function() {
    const betAmountInput = document.getElementById('betAmountInput');
    if (betAmountInput) {
        betAmountInput.addEventListener('input', updatePotentialWin);
    }
    
    // Initialize betting system
    initBettingSystem();
});

