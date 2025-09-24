document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginBtn = document.querySelector('.login-btn');
    const btnText = document.querySelector('.btn-text');
    const alertMessage = document.getElementById('alertMessage');
    const alertText = document.querySelector('.alert-text');

    // Funções de validação
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
        element.parentElement.querySelector('input').style.borderColor = 'var(--error)';
    }

    function hideError(element) {
        element.textContent = '';
        element.classList.remove('show');
        element.parentElement.querySelector('input').style.borderColor = '#E9ECEF';
    }

    function showAlert(message, type = 'error') {
        alertText.textContent = message;
        alertMessage.className = `alert ${type}`;
        alertMessage.style.display = 'block';
        
        // Auto-hide após 5 segundos
        setTimeout(() => {
            hideAlert();
        }, 5000);
    }

    function hideAlert() {
        alertMessage.style.display = 'none';
    }

    // Validação em tempo real
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showError(emailError, 'Email inválido');
        } else {
            hideError(emailError);
        }
    });

    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (!email) {
            showError(emailError, 'Email é obrigatório');
        } else if (!validateEmail(email)) {
            showError(emailError, 'Email inválido');
        } else {
            hideError(emailError);
        }
    });

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        if (password && !validatePassword(password)) {
            showError(passwordError, 'Senha deve ter pelo menos 6 caracteres');
        } else {
            hideError(passwordError);
        }
    });

    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (!password) {
            showError(passwordError, 'Senha é obrigatória');
        } else if (!validatePassword(password)) {
            showError(passwordError, 'Senha deve ter pelo menos 6 caracteres');
        } else {
            hideError(passwordError);
        }
    });

    // Efeitos visuais adicionais
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Animação de entrada dos elementos
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            group.style.transition = 'all 0.5s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, 100 * (index + 1));
    });

    // Efeito de digitação no título
    const title = document.querySelector('.login-header h1');
    const originalText = title.textContent;
    title.textContent = '';

    let i = 0;
    function typeWriter() {
        if (i < originalText.length) {
            title.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    }
    setTimeout(typeWriter, 500);
});
