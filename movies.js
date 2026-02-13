const API_URL = 'http://localhost:3000/api/movies';
const IMAGES_BASE_URL = 'http://localhost:3000/images';

let allMovies = [];
let currentGenre = 'all';
let currentUniverse = null;

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    fetchMovies();
});

function checkUserSession() {
    const user = JSON.parse(localStorage.getItem('gft_user'));
    const container = document.getElementById('user-profile-container');

    if (user && container) {
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
    const container = document.getElementById('movies-grid-container');

    try {
        let url = API_URL;
        // Si hay filtro de universo, traemos todo y filtramos en cliente (o podríamos filtrar en backend si soportara ambos)
        // Por consistencia con la petición original del usuario "solo series en series.html", haremos "solo películas en movies.html"
        // Salvo que el backend soporte filtros combinados, lo cual parece que sí.

        // Pero movies.router.ts tiene lógica simple. Vamos a pedir type=movie por defecto si no es una búsqueda global.
        // Sin embargo, fetchMovies() en movies.js maneja filtrado por universo en frontend.
        // Mejor pedimos type=movie siempre para la página de películas.
        url += '?type=movie';

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allMovies = await response.json();

        // Obtener filtro de universo de la URL (heredado de la funcionalidad anterior)
        const urlParams = new URLSearchParams(window.location.search);
        const universeFilter = urlParams.get('universe');
        currentUniverse = universeFilter;

        let displayMovies = [...allMovies];

        if (universeFilter) {
            displayMovies = displayMovies.filter(m => m.universe === universeFilter);
            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle) heroTitle.innerText = `Universo: ${universeFilter}`;
        }

        renderMovies(displayMovies);
        setupGenreFilter();

    } catch (error) {
        console.error('Error fetching movies:', error);
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <p>Error cargando el catálogo.</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
}

function renderMovies(movies) {
    const grid = document.getElementById('movies-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (movies.length === 0) {
        grid.innerHTML = '<p class="error-msg">No se encontraron películas para este criterio.</p>';
        return;
    }

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

function setupGenreFilter() {
    const genreList = document.getElementById('genres-list');
    if (!genreList) return;

    // Extraer géneros únicos
    const genresSet = new Set();
    allMovies.forEach(movie => {
        if (movie.genres) {
            movie.genres.split(',').forEach(g => genresSet.add(g.trim()));
        }
    });

    const sortedGenres = Array.from(genresSet).sort();

    genreList.innerHTML = `<span class="genre-item active" onclick="filterByGenre('all', this)">Todos</span>`;
    sortedGenres.forEach(genre => {
        genreList.innerHTML += `<span class="genre-item" onclick="filterByGenre('${genre}', this)">${genre}</span>`;
    });
}

function filterByGenre(genre, element) {
    currentGenre = genre;
    // UI update
    document.querySelectorAll('.genre-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    if (genre === 'all') {
        renderMovies(allMovies);
    } else {
        const filtered = allMovies.filter(m => m.genres && m.genres.includes(genre));
        renderMovies(filtered);
    }

    // Scroll to bibliothèque
    document.getElementById('library-section').scrollIntoView({ behavior: 'smooth' });
}

window.filterByGenre = filterByGenre;

function handleSortChange(sortType) {
    let sortedMovies = [...allMovies];

    if (currentGenre !== 'all') {
        sortedMovies = sortedMovies.filter(m => m.genres && m.genres.includes(currentGenre));
    }

    if (currentUniverse) {
        sortedMovies = sortedMovies.filter(m => m.universe === currentUniverse);
    }

    switch (sortType) {
        case 'name-asc':
            sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'name-desc':
            sortedMovies.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'year-desc':
            sortedMovies.sort((a, b) => b.year - a.year);
            break;
        case 'year-asc':
            sortedMovies.sort((a, b) => a.year - b.year);
            break;
    }

    renderMovies(sortedMovies);
}

window.handleSortChange = handleSortChange;

// --- Custom Dropdown Logic ---

function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.classList.toggle('active');
    }
}

function selectSort(sortType, label) {
    // Aplicar ordenación
    handleSortChange(sortType);

    // Actualizar UI
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('selected');
        if (item.innerText === label) {
            item.classList.add('selected');
        }
    });

    // Cerrar menú
    const menu = document.getElementById('sort-options');
    if (menu) menu.classList.remove('active');
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('sort-dropdown');
    const menu = document.getElementById('sort-options');

    if (dropdown && !dropdown.contains(e.target)) {
        if (menu) menu.classList.remove('active');
    }
});

window.toggleDropdown = toggleDropdown;
window.selectSort = selectSort;
