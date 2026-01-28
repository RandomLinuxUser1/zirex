
let gamsList = [];

async function loadGames() {
    try {
        const response = await fetch('../app/games.json');
        if (!response.ok) {
            throw new Error('Failed to load games.json');
        }
        const games = await response.json();

        gamsList = games.map(game => ({
            name: game.title,
            img: game.img,
            href: game.path
        }));
        
        return gamsList;
    } catch (error) {
        console.error('Error loading games:', error);
        return [];
    }
}

loadGames();