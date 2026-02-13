const API_URL = 'http://localhost:3000/api/movies';
let allMoviesData = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchRawData();
});

async function fetchRawData() {
    const textarea = document.getElementById('bulk-textarea');
    const status = document.getElementById('editor-status');
    status.innerText = 'Cargando...';

    try {
        const response = await fetch(API_URL);
        const movies = await response.json();
        allMoviesData = movies;

        renderTextArea(movies);
        status.innerText = `Cargadas ${movies.length} películas.`;
    } catch (error) {
        console.error('Error:', error);
        status.innerText = 'Error al cargar datos.';
    }
}

function renderTextArea(movies) {
    const textarea = document.getElementById('bulk-textarea');
    let text = '';

    movies.forEach(movie => {
        text += `movie_slug: ${movie.name_slug}, title: ${movie.title}, year: ${movie.year}, universe: ${movie.universe || ''}, type: ${movie.type || ''}, age: ${movie.edad_minima || 0}, genres: ${movie.genres}, youtube: ${movie.youtube_url || ''}, photo: ${movie.photo_url || ''}, actors: ${movie.actores || ''}, desc: ${movie.description || ''}\n`;
        text += `---\n`; // Separador
    });

    textarea.value = text;
}

async function saveBulkData() {
    const text = document.getElementById('bulk-textarea').value;
    const status = document.getElementById('editor-status');
    status.innerText = 'Actualizando...';

    const blocks = text.split('---').map(b => b.trim()).filter(b => b.length > 0);
    const parsedMovies = blocks.map(parseMovieBlock).filter(m => m !== null);

    let successCount = 0;
    let errorCount = 0;

    for (const movie of parsedMovies) {
        try {
            // Buscamos si ya existe por el slug extraído
            const exists = allMoviesData.find(m => m.name_slug === movie.name_slug);
            const method = exists ? 'PUT' : 'POST';
            const url = exists ? `${API_URL}/${exists.name_slug}` : API_URL;

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movie)
            });

            if (response.ok) successCount++;
            else {
                console.error('Error con', movie.name_slug, await response.text());
                errorCount++;
            }
        } catch (e) {
            console.error('Fetch error:', e);
            errorCount++;
        }
    }

    status.innerText = `Finalizado. Éxito: ${successCount}, Errores: ${errorCount}`;
    if (errorCount === 0) {
        alert('¡Cambios guardados con éxito!');
        fetchRawData();
    } else {
        alert('Se produjeron algunos errores. Revisa la consola para más detalles.');
    }
}

function parseMovieBlock(block) {
    try {
        // Mejoramos el parsing para que acepte comas dentro de la descripción
        const fields = ['movie_slug', 'title', 'year', 'universe', 'type', 'age', 'genres', 'youtube', 'photo', 'actors', 'desc'];
        const result = {};

        fields.forEach((field, index) => {
            const startTag = `${field}:`;
            const startIdx = block.indexOf(startTag);
            if (startIdx !== -1) {
                let endIdx = block.length;
                // El final de este campo es el inicio del siguiente tag conocido
                for (let j = index + 1; j < fields.length; j++) {
                    const nextTag = `${fields[j]}:`;
                    const nextTagIdx = block.indexOf(nextTag);
                    if (nextTagIdx !== -1 && nextTagIdx > startIdx) {
                        endIdx = nextTagIdx;
                        break;
                    }
                }

                let value = block.substring(startIdx + startTag.length, endIdx).trim();
                // Limpiar coma final si existe (excepto en el último campo)
                if (value.endsWith(',')) value = value.slice(0, -1).trim();
                result[field] = value;
            }
        });

        if (!result.movie_slug || !result.title) return null;

        return {
            name_slug: result.movie_slug,
            title: result.title,
            year: parseInt(result.year) || 2024,
            universe: result.universe || '',
            type: result.type || '',
            edad_minima: parseInt(result.age) || 0,
            genres: result.genres || 'General',
            youtube_url: result.youtube || '',
            photo_url: result.photo || '',
            actores: result.actors || '',
            description: result.desc || 'Sin descripción.'
        };
    } catch (e) {
        console.error('Parsing error on block:', block);
        return null;
    }
}

function filterText() {
    const search = document.getElementById('admin-search').value.toLowerCase();
    const filtered = allMoviesData.filter(m => m.title.toLowerCase().includes(search));
    renderTextArea(filtered);
}
