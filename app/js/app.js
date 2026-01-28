// app.js - Main application logic for games page

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for games to load from JSON
    await loadGames();
    
    // Initialize all components
    initializeGames();
    setupSearch();
    setupButtons();
});

function initializeGames() {
    const container = document.getElementById('gamesContainer');
    if (!container) return;

    // Clear container first
    container.innerHTML = '';
    
    // Create game cards for each game in the list
    gamsList.forEach(game => {
        if (game.name) {
            const gameCard = createGameCard(game);
            container.appendChild(gameCard);
        }
    });
}

function createGameCard(game) {
    const card = document.createElement('a');
    card.className = 'game-card';
    
    // Use the image path from JSON
    const imgSrc = game.img || '../img/default-game.png';
    
    // Use the href/path from JSON
    const href = game.href || '#';
    
    card.href = href;
    
    // Prevent default link behavior and open in player
    card.addEventListener('click', function(e) {
        e.preventDefault();
        openGame(href, game.name, imgSrc);
    });
    
    // Create image element
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = game.name;
    img.onerror = function() {
        this.src = '../img/default-game.png';
    };
    
    // Create name element
    const name = document.createElement('p');
    name.className = 'game-name';
    name.textContent = game.name;
    
    card.appendChild(img);
    card.appendChild(name);
    
    return card;
}

function openGame(href, name, icon) {
    // Navigate to player page with game info
    const playerUrl = `player.html?src=${encodeURIComponent(href)}&name=${encodeURIComponent(name)}&icon=${encodeURIComponent(icon)}`;
    window.location.href = playerUrl;
}

function setupSearch() {
    const searchInput = document.getElementById('searchQuery');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const filter = this.value.toUpperCase();
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            const gameName = card.querySelector('.game-name').textContent;
            
            if (gameName.toUpperCase().indexOf(filter) > -1) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function setupButtons() {
    const dashBtn = document.getElementById('dash');
    const abtBlankBtn = document.getElementById('abtblank');
    
    if (dashBtn) {
        dashBtn.addEventListener('click', function() {
            const password = prompt('Enter dashboard password:');
            if (password === 'Swaylio1') {
                window.location.href = '../dashboard/index.html';
            } else if (password !== null) {
                alert('Incorrect password!');
            }
        });
    }
    
    if (abtBlankBtn) {
        abtBlankBtn.addEventListener('click', function() {
            openAboutBlank();
        });
    }
}

function openAboutBlank() {
    const win = window.open('about:blank', '_blank');
    const iframe = win.document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;margin:0;padding:0;';
    iframe.src = window.location.href;
    win.document.body.appendChild(iframe);
    win.document.body.style.margin = '0';
}