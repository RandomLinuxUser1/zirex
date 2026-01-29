let gamsList = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadGames();
    initializeGames();
    setupSearch();
    setupButtons();
});

async function loadGames() {
    try {
        const response = await fetch('../../games/games.json');

        if (!response.ok) throw new Error();
        const games = await response.json();

        gamsList = games.map(game => ({
            name: game.title,
            img: game.img,
            href: game.path
        }));
    } catch {
        gamsList = [];
    }
}

function initializeGames() {
    const container = document.getElementById('gamesContainer');
    if (!container) return;

    container.innerHTML = '';

    gamsList.forEach(game => {
        if (!game.name) return;

        const card = document.createElement('a');
        card.className = 'game-card';
        card.href = '#';

        card.addEventListener('click', e => {
            e.preventDefault();
            openPlayer(game.href, game.name, game.img);
        });

        if (game.img) {
            const img = document.createElement('img');
            img.src = game.img;
            img.alt = game.name;
            img.onerror = () => {
                img.remove();
                const txt = document.createElement('div');
                txt.textContent = 'hi';
                card.prepend(txt);
            };
            card.appendChild(img);
        } else {
            const txt = document.createElement('div');
            txt.textContent = 'hi';
            card.appendChild(txt);
        }

        const name = document.createElement('p');
        name.className = 'game-name';
        name.textContent = game.name;

        card.appendChild(name);
        container.appendChild(card);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchQuery');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const filter = this.value.toUpperCase();
        document.querySelectorAll('.game-card').forEach(card => {
            const name = card.querySelector('.game-name');
            card.style.display =
                name && name.textContent.toUpperCase().includes(filter)
                    ? ''
                    : 'none';
        });
    });
}

function setupButtons() {
    const homeBtn = document.getElementById('home');
    const abtBlankBtn = document.getElementById('abtblank');
    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "/home/";
        });
    }

    if (abtBlankBtn) {
        abtBlankBtn.addEventListener('click', openAboutBlank);
    }
}

function openAboutBlank() {
    const win = window.open('about:blank', '_blank');
    const iframe = win.document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;';
    iframe.src = window.location.href;
    win.document.body.style.margin = '0';
    win.document.body.appendChild(iframe);
}
