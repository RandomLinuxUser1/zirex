// player.js - Game player page logic

document.addEventListener('DOMContentLoaded', function() {
    initializePlayer();
    setupControls();
});

function initializePlayer() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gameSrc = urlParams.get('src');
    const gameName = urlParams.get('name');
    const gameIcon = urlParams.get('icon');
    
    // Update page title and game name
    if (gameName) {
        document.getElementById('gameTitle').textContent = gameName + ' - Zirex';
        document.getElementById('gameName').textContent = gameName;
    }
    
    // Update favicon if icon provided
    if (gameIcon) {
        updateFavicon(gameIcon);
    }
    
    // Load game in iframe
    if (gameSrc) {
        loadGame(gameSrc);
    } else {
        showError('No game specified');
    }
}

function loadGame(src) {
    const iframe = document.getElementById('gameFrame');
    const loader = document.getElementById('loader');
    
    // Show loader
    loader.style.display = 'flex';
    
    // Set iframe source
    iframe.src = src;
    
    // Hide loader when iframe loads
    iframe.onload = function() {
        loader.style.display = 'none';
        iframe.style.display = 'block';
    };
    
    // Handle iframe load error
    iframe.onerror = function() {
        showError('Failed to load game');
    };
}

function showError(message) {
    const loader = document.getElementById('loader');
    loader.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        <button onclick="goHome()" class="control-btn">Go Home</button>
    `;
    loader.style.display = 'flex';
}

function setupControls() {
    const homeBtn = document.getElementById('homeBtn');
    const reloadBtn = document.getElementById('reloadBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // Home button
    if (homeBtn) {
        homeBtn.addEventListener('click', goHome);
    }
    
    // Reload button
    if (reloadBtn) {
        reloadBtn.addEventListener('click', function() {
            const iframe = document.getElementById('gameFrame');
            const loader = document.getElementById('loader');
            
            loader.style.display = 'flex';
            iframe.style.display = 'none';
            
            iframe.src = iframe.src;
        });
    }
    
    // Fullscreen button
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
}

function goHome() {
    window.location.href = 'index.html';
}

function toggleFullscreen() {
    const container = document.getElementById('gameContainer');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
        // Enter fullscreen
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function updateFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const icon = fullscreenBtn.querySelector('i');
    const span = fullscreenBtn.querySelector('span');
    
    if (document.fullscreenElement || document.webkitFullscreenElement || 
        document.mozFullScreenElement || document.msFullscreenElement) {
        // In fullscreen mode
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
        span.textContent = 'Exit Fullscreen';
    } else {
        // Not in fullscreen mode
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
        span.textContent = 'Fullscreen';
    }
}

function updateFavicon(iconUrl) {
    // Remove existing favicons
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());
    
    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = iconUrl;
    document.head.appendChild(link);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // F11 for fullscreen
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
    
    // Escape to go home
    if (e.key === 'Escape' && !document.fullscreenElement) {
        goHome();
    }
    
    // F5 or Ctrl+R to reload
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        document.getElementById('reloadBtn').click();
    }
});