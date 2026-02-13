const API_FAVORITES_URL = 'http://localhost:3000/api/favorites';
const IMAGES_BASE_URL = 'http://localhost:3000/images';

document.addEventListener('DOMContentLoaded', () => {
    const user = checkUserSession();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    fetchFavorites(user.id);
});

function checkUserSession() {
    const userString = localStorage.getItem('gft_user');
    const container = document.getElementById('user-profile-container');

    if (!userString) return null;

    const user = JSON.parse(userString);

    if (container) {
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
    return user;
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('gft_user');
        window.location.href = 'index.html';
    }
}

async function fetchFavorites(userId) {
    const grid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('empty-list');

    try {
        const response = await fetch(`${API_FAVORITES_URL}/${userId}`);
        const movies = await response.json();

        if (movies.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }

        renderMovies(movies);

    } catch (error) {
        console.error('Error fetching favorites:', error);
        grid.innerHTML = '<p class="error">Error al cargar tu lista.</p>';
    }
}

function renderMovies(movies) {
    const grid = document.getElementById('favorites-grid');
    grid.innerHTML = '';

    movies.forEach(movie => {
        const card = createMovieCard(movie);
        grid.appendChild(card);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

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
