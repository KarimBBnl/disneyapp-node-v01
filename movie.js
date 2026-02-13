const API_BASE_URL = 'http://localhost:3000/api/movies';
const IMAGES_BASE_URL = 'http://localhost:3000/images';
const VIDEOS_BASE_URL = 'http://localhost:3000/videos';

document.addEventListener('DOMContentLoaded', () => {
    checkUserSession();
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        showError('No se especificó ninguna película.');
        return;
    }

    fetchMovieDetail(slug);
});

async function fetchMovieDetail(slug) {
    const container = document.getElementById('movie-detail');

    try {
        const response = await fetch(`${API_BASE_URL}/${slug}`);

        if (!response.ok) {
            if (response.status === 404) throw new Error('Película no encontrada.');
            throw new Error('Error al conectar con el servidor.');
        }

        const movie = await response.json();
        renderMovie(movie);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

function renderMovie(movie) {
    document.title = `${movie.title} - GFT Magic`;
    const mainContainer = document.getElementById('movie-detail');
    const contentContainer = mainContainer.querySelector('.movie-detail-container');

    const imageUrl = `${IMAGES_BASE_URL}/${movie.name_slug}.png`;
    let videoHTML = '';

    // Lógica para el reproductor (YouTube vs Local)
    if (movie.youtube_url) {
        const videoId = getYouTubeId(movie.youtube_url);
        videoHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0" 
                title="${movie.title}" 
                frameborder="0" 
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>`;
    } else {
        const videoUrl = `${VIDEOS_BASE_URL}/${movie.name_slug}.mp4`;
        videoHTML = `
            <video controls poster="${imageUrl}">
                <source src="${videoUrl}" type="video/mp4">
                Tu navegador no soporta el video.
            </video>`;
    }

    // Set Cinema Background
    mainContainer.style.backgroundImage = `url('${imageUrl}')`;

    contentContainer.innerHTML = `
        <div class="movie-detail-header">
            <div class="detail-poster-container">
                <img src="${imageUrl}" alt="${movie.title}" class="detail-poster" onerror="this.onerror=null; this.src='${movie.photo_url || 'https://placehold.co/400x600/1a1c24/FFF?text=No+Poster'}'">
            </div>
            
            <div class="detail-info">
                <h1>${movie.title}</h1>
                <div class="detail-meta">
                    <span class="meta-item"><i class="fa-regular fa-calendar"></i> ${movie.year}</span>
                    <span class="meta-item"><i class="fa-solid fa-tags"></i> ${movie.genres || 'General'}</span>
                    <span class="meta-item age-badge"><i class="fa-solid fa-user-shield"></i> +${movie.edad_minima || 0}</span>
                </div>
                
                <div class="detail-actions">
                    <div id="favorite-btn-container">
                        <!-- Botón generado dinámicamente -->
                    </div>
                </div>

                <div class="detail-description">
                    <p>${movie.description || 'Sin descripción disponible.'}</p>
                </div>
                <div class="detail-actors">
                    <h3><i class="fa-solid fa-users"></i> Actores</h3>
                    <p>${movie.actores || 'No se han especificado actores.'}</p>
                </div>
            </div>
        </div>

        <section class="player-section">
            <h2 class="player-title"><i class="fa-solid fa-play"></i> Reproductor Principal</h2>
            <div class="player-wrapper">
                ${videoHTML}
            </div>
        </section>
    `;

    // Inicializar botón de favoritos si hay sesión
    initFavoriteButton(movie.id);

    // Cargar reseñas
    loadReviews(movie.id, movie.name_slug);
}

// --- Reviews System ---

async function loadReviews(movieId, movieSlug) {
    const listContainer = document.getElementById('reviews-list');
    const countContainer = document.getElementById('reviews-count');
    const formContainer = document.getElementById('review-form-container');

    // Render form if user is logged in
    const userString = localStorage.getItem('gft_user');
    if (userString) {
        const user = JSON.parse(userString);
        renderReviewForm(formContainer, movieId, movieSlug, user);
    } else {
        formContainer.innerHTML = `
            <div class="login-to-review">
                <p>¿Has visto esta película? <a href="login.html?redirect=movie.html?slug=${movieSlug}">Inicia sesión</a> para dejar tu opinión.</p>
            </div>
        `;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/reviews/${movieId}`);
        if (!response.ok) throw new Error('Error fetching reviews');

        const reviews = await response.json();

        // Update count
        if (countContainer) {
            countContainer.innerText = `${reviews.length} ${reviews.length === 1 ? 'opinión' : 'opiniones'}`;
        }

        if (reviews.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-reviews">
                    <i class="fa-regular fa-comment-dots"></i>
                    <p>Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = reviews.map(review => createReviewCard(review)).join('');

    } catch (e) {
        console.error('Error loading reviews:', e);
        listContainer.innerHTML = '<p class="error-msg">No se pudieron cargar las reseñas.</p>';
    }
}

function createReviewCard(review) {
    const date = new Date(review.created_at).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Generate star icons
    const stars = Array(5).fill(0).map((_, i) => {
        if (i < review.rating) return '<i class="fa-solid fa-star"></i>';
        return '<i class="fa-regular fa-star"></i>';
    }).join('');

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-avatar">
                   <img src="https://ui-avatars.com/api/?name=${review.user_name}&background=random&color=fff" alt="${review.user_name}">
                </div>
                <div class="reviewer-info">
                    <span class="reviewer-name">${review.user_name}</span>
                    <span class="review-date">${date}</span>
                </div>
                <div class="review-rating">
                    ${stars}
                </div>
            </div>
            <div class="review-body">
                <p>${review.text}</p>
            </div>
        </div>
    `;
}

function renderReviewForm(container, movieId, movieSlug, user) {
    container.innerHTML = `
        <form id="review-form" class="review-form">
            <h3>Deja tu opinión</h3>
            <div class="rating-selector">
                <div class="star-rating">
                    <input type="radio" id="star5" name="rating" value="5" /><label for="star5" title="5 estrellas"><i class="fa-solid fa-star"></i></label>
                    <input type="radio" id="star4" name="rating" value="4" /><label for="star4" title="4 estrellas"><i class="fa-solid fa-star"></i></label>
                    <input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="3 estrellas"><i class="fa-solid fa-star"></i></label>
                    <input type="radio" id="star2" name="rating" value="2" /><label for="star2" title="2 estrellas"><i class="fa-solid fa-star"></i></label>
                    <input type="radio" id="star1" name="rating" value="1" /><label for="star1" title="1 estrella"><i class="fa-solid fa-star"></i></label>
                </div>
                <span id="rating-text">Selecciona una puntuación</span>
            </div>
            <textarea id="review-text" placeholder="¿Qué te pareció la película? Comparte tu experiencia..." required></textarea>
            <button type="submit" class="btn btn-primary submit-review-btn">Publicar Reseña</button>
        </form>
    `;

    const form = document.getElementById('review-form');
    form.addEventListener('submit', (e) => submitReview(e, movieId, movieSlug, user.id, user.name));
}

async function submitReview(e, movieId, movieSlug, userId, username) {
    e.preventDefault();

    const text = document.getElementById('review-text').value;
    const ratingInput = document.querySelector('input[name="rating"]:checked');

    if (!ratingInput) {
        alert('Por favor selecciona una puntuación.');
        return;
    }

    const rating = parseInt(ratingInput.value);
    const btn = e.target.querySelector('button');
    const originalBtnText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner-small"></div> Publicando...';

    try {
        const response = await fetch('http://localhost:3000/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                movieId,
                userId,
                rating,
                text,
                movie_slug: movieSlug, // Fallback if ID is missing
                username // Fallback
            })
        });

        if (!response.ok) throw new Error('Error posting review');

        // Reload reviews
        await loadReviews(movieId, movieSlug);

        // Reset form or show success message?
        // Usually loadReviews re-renders the form, so we might want to clear it if we keep it.
        // But loadReviews re-renders everything.

    } catch (e) {
        console.error('Error submitting review:', e);
        alert('Hubo un error al publicar tu reseña.');
        btn.disabled = false;
        btn.innerHTML = originalBtnText;
    }
}

async function initFavoriteButton(movieId) {
    const userString = localStorage.getItem('gft_user');
    if (!userString) return;

    const user = JSON.parse(userString);
    const container = document.getElementById('favorite-btn-container');

    try {
        const response = await fetch(`http://localhost:3000/api/favorites/${user.id}`);
        const favorites = await response.json();
        const isFavorite = favorites.some(fav => fav.id === movieId);

        renderFavoriteButton(isFavorite, user.id, movieId);
    } catch (e) {
        console.error('Error checking favorites:', e);
    }
}

function renderFavoriteButton(isFavorite, userId, movieId) {
    const container = document.getElementById('favorite-btn-container');
    container.innerHTML = `
        <button class="btn ${isFavorite ? 'btn-secondary' : 'btn-primary'} btn-favorite" onclick="toggleFavorite(${isFavorite}, ${userId}, ${movieId})">
            <i class="fa-solid ${isFavorite ? 'fa-minus' : 'fa-plus'}"></i>
            ${isFavorite ? 'Quitar de mi lista' : 'Añadir a mi lista'}
        </button>
    `;
}

async function toggleFavorite(isFavorite, userId, movieId) {
    const url = 'http://localhost:3000/api/favorites';
    const method = isFavorite ? 'DELETE' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, movieId })
        });

        if (response.ok) {
            renderFavoriteButton(!isFavorite, userId, movieId);
        }
    } catch (e) {
        console.error('Error toggling favorite:', e);
    }
}

function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

function showError(message) {
    const mainContainer = document.getElementById('movie-detail');
    const contentContainer = mainContainer.querySelector('.movie-detail-container');

    mainContainer.style.backgroundImage = 'none';

    contentContainer.innerHTML = `
        <div class="error-container">
            <i class="fa-solid fa-circle-xmark"></i>
            <h2>¡Oops! algo salió mal</h2>
            <p>${message}</p>
            <a href="index.html" class="btn btn-primary" style="display:inline-flex; width:auto; margin-top:2rem;">Volver al Inicio</a>
        </div>
    `;
}
function checkUserSession() {
    const user = JSON.parse(localStorage.getItem('gft_user'));
    const container = document.getElementById('user-profile-container');
    if (!container) return;

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
