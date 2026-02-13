const API_URL = 'http://localhost:3000/api/movies';
const IMAGES_BASE_URL = 'http://localhost:3000/images';

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    fetchMovies();
    fetchUniverses();
});

async function fetchUniverses() {
    const container = document.getElementById('universes-container');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:3000/api/universes');
        const universes = await response.json();

        container.innerHTML = universes.map(universe => `
            <div class="universe-card" onclick="window.location.href='movies.html?universe=${encodeURIComponent(universe.name)}'">
                <img src="${universe.image_url}" alt="${universe.name}">
                <div class="universe-hover"></div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error fetching universes:', error);
    }
}

function checkUserSession() {
    const user = JSON.parse(localStorage.getItem('gft_user'));
    const container = document.getElementById('user-profile-container');

    if (user) {
        container.innerHTML = `
            <div class="user-info-nav">
                <div class="user-details">
                    <span class="nav-welcome">Hola,</span>
                    <span class="nav-username">${user.name.split(' ')[0]}</span>
                </div>
                <div class="avatar">
                    <img src="https://ui-avatars.com/api/?name=${user.name}&background=0E5AFF&color=fff" alt="${user.name}">
                </div>
                <button onclick="logout()" class="btn-logout" title="Cerrar Sesión">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        `;
    }
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('gft_user');
        window.location.reload();
    }
}

async function fetchMovies() {
    const container = document.getElementById('home-sections-container');

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const movies = await response.json();

        // Clear loading spinner or old content
        container.innerHTML = '';

        if (movies.length === 0) {
            container.innerHTML = '<p class="error-msg">No se encontraron películas.</p>';
            return;
        }

        // Mostrar solo las primeras 8 películas como "Tendencias"
        const trendingMovies = movies.slice(0, 8);

        const section = document.createElement('section');
        section.className = 'movies-container trending-section';

        section.innerHTML = `
            <h2 class="genre-title">Tendencias</h2>
            <div class="grid trending-grid"></div>
        `;

        const grid = section.querySelector('.trending-grid');
        trendingMovies.forEach(movie => {
            const card = createMovieCard(movie);
            grid.appendChild(card);
        });

        container.appendChild(section);

    } catch (error) {
        console.error('Error fetching movies:', error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Error cargando películas. Verifica que el backend esté corriendo.</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    // Construct image URL
    const imageUrl = `${IMAGES_BASE_URL}/${movie.name_slug}.png`;

    card.innerHTML = `
        <img src="${imageUrl}" alt="${movie.title}" class="movie-poster" onerror="this.onerror=null; this.src='${movie.photo_url || 'https://placehold.co/400x600/1a1c24/FFF?text=No+Image'}'">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span>${movie.year}</span>
                <span>${movie.genres ? movie.genres.split(',')[0] : 'Cine'}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        window.location.href = `movie.html?slug=${movie.name_slug}`;
    });

    return card;
}
