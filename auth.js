const API_AUTH_URL = 'http://localhost:3000/api/auth';

let isLoginMode = true;

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('login-form');
    const toggleLink = document.getElementById('toggle-auth');

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });

    authForm.addEventListener('submit', handleAuthSubmit);
});

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const nameField = document.getElementById('name-field');
    const authBtn = document.getElementById('auth-btn');
    const toggleText = document.getElementById('toggle-text');

    if (isLoginMode) {
        title.innerText = 'Iniciar Sesión';
        subtitle.innerText = 'Bienvenido de nuevo a la magia';
        nameField.style.display = 'none';
        document.getElementById('name').required = false;
        authBtn.innerText = 'Acceder ahora';
        toggleText.innerHTML = '¿No tienes cuenta? <a href="#" id="toggle-auth" onclick="toggleAuthMode(); return false;">Regístrate aquí</a>';
    } else {
        title.innerText = 'Crear Cuenta';
        subtitle.innerText = 'Únete a la mejor experiencia cinematográfica';
        nameField.style.display = 'block';
        document.getElementById('name').required = true;
        authBtn.innerText = 'Registrarme';
        toggleText.innerHTML = '¿Ya tienes cuenta? <a href="#" id="toggle-auth" onclick="toggleAuthMode(); return false;">Inicia sesión</a>';
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    const endpoint = isLoginMode ? '/login' : '/register';
    const body = isLoginMode ? { username, password } : { username, password, name };

    try {
        const response = await fetch(`${API_AUTH_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            if (isLoginMode) {
                // Save session
                localStorage.setItem('gft_user', JSON.stringify(data));
                window.location.href = 'index.html';
            } else {
                alert('¡Registro completado con éxito! Ahora puedes iniciar sesión.');
                toggleAuthMode();
            }
        } else {
            alert('Error: ' + (data.error || 'Algo salió mal'));
        }
    } catch (error) {
        console.error('Auth error:', error);
        alert('Error conectando con el servidor.');
    }
}
