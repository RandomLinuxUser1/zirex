document.addEventListener('DOMContentLoaded', () => {
    setupControls();
});

function openPlayer(src, name, icon) {
    const overlay = document.getElementById('playerOverlay');
    const iframe = document.getElementById('gameFrame');
    const loader = document.getElementById('loader');
    const title = document.getElementById('gameName');

    overlay.style.display = 'flex';
    loader.style.display = 'flex';
    iframe.style.display = 'none';

    title.textContent = name || 'Loading...';
    document.title = (name || 'Game') + ' - Zirex';

    if (icon) updateFavicon(icon);

    iframe.src = src;

    iframe.onload = () => {
        loader.style.display = 'none';
        iframe.style.display = 'block';
    };

    iframe.onerror = () => {
        loader.innerHTML = '<p>Failed to load game</p>';
    };
}

function closePlayer() {
    const overlay = document.getElementById('playerOverlay');
    const iframe = document.getElementById('gameFrame');
    iframe.src = '';
    overlay.style.display = 'none';
    document.title = 'Zirex - Games';
}

function setupControls() {
    const homeBtn = document.getElementById('homeBtn2');
    const reloadBtn = document.getElementById('reloadBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    if (homeBtn) homeBtn.addEventListener('click', closePlayer);

    if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
            const iframe = document.getElementById('gameFrame');
            const loader = document.getElementById('loader');
            loader.style.display = 'flex';
            iframe.style.display = 'none';
            iframe.src = iframe.src;
        });
    }

    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    document.addEventListener('fullscreenchange', updateFullscreenButton);
}

function toggleFullscreen() {
    const container = document.getElementById('gameContainer');
    if (!document.fullscreenElement) {
        container.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function updateFullscreenButton() {
    const btn = document.getElementById('fullscreenBtn');
    const icon = btn.querySelector('i');
    const span = btn.querySelector('span');

    if (document.fullscreenElement) {
        icon.classList.replace('fa-expand', 'fa-compress');
        span.textContent = 'Exit Fullscreen';
    } else {
        icon.classList.replace('fa-compress', 'fa-expand');
        span.textContent = 'Fullscreen';
    }
}

function updateFavicon(url) {
    document.querySelectorAll('link[rel*="icon"]').forEach(i => i.remove());
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.fullscreenElement) closePlayer();
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
});
