document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }
        
        const loginButton = loginForm.querySelector('.login-button');
        loginButton.disabled = true;
        loginButton.innerHTML = '<span>Logging in...</span>';
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, rememberMe })
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = '/dashboard';
            } else {
                showError(data.error || 'Login failed. Please check your credentials.');
                loginButton.disabled = false;
                loginButton.innerHTML = '<span>Login</span>';
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
            loginButton.disabled = false;
            loginButton.innerHTML = '<span>Login</span>';
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
});
