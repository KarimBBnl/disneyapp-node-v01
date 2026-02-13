const SEARCH_API_URL = 'http://localhost:3000/api/movies';
const SEARCH_IMAGES_URL = 'http://localhost:3000/images';

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});

function initSearch() {
    const searchInput = document.getElementById('nav-search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    let movies = [];

    // Pre-fetch movies for faster search
    fetch(SEARCH_API_URL)
        .then(res => res.json())
        .then(data => {
            movies = data;
        })
        .catch(err => console.error('Error fetching movies for search:', err));

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 1) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }

        const filtered = movies.filter(m =>
            m.title.toLowerCase().includes(query) ||
            (m.genres && m.genres.toLowerCase().includes(query))
        ).slice(0, 5); // Limit to 5 results

        renderSearchResults(filtered, query);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

function renderSearchResults(results, query) {
    const searchResults = document.getElementById('search-results');

    if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary); text-align: center;">No se encontraron resultados.</div>';
    } else {
        searchResults.innerHTML = results.map(movie => `
            <div class="search-item" onclick="window.location.href='movie.html?slug=${movie.name_slug}'">
                <img src="${SEARCH_IMAGES_URL}/${movie.name_slug}.png" alt="${movie.title}" onerror="this.onerror=null; this.src='${movie.photo_url || 'https://placehold.co/100x150/1a1c24/FFF?text=Movie'}'">
                <div class="search-item-info">
                    <span class="search-item-title">${movie.title}</span>
                    <span class="search-item-meta">${movie.year} • ${movie.genres ? movie.genres.split(',')[0] : 'Cine'}</span>
                </div>
            </div>
        `).join('');
    }

    searchResults.classList.add('active');
}
