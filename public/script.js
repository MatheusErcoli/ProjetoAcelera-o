document.addEventListener('DOMContentLoaded', function() {
    // LOGIN
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const alertMessage = document.getElementById('alertMessage');
    const alertText = document.querySelector('.alert-text');

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
        setTimeout(() => {
            hideAlert();
        }, 5000);
    }
    function hideAlert() {
        alertMessage.style.display = 'none';
    }

    if (emailInput && emailError) {
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
    }
    if (passwordInput && passwordError) {
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
    }

    // Efeito de digitação no título login
    const title = document.querySelector('.login-header h1');
    if (title) {
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
    }

    // REGISTRO
    const registerForm = document.getElementById('registerForm');
    const userTypeInput = document.getElementById('userType');
    const servicosField = document.getElementById('servicos');
     const prestadorSection = document.getElementById("prestadorSection");
    prestadorSection.style.display = 'none';

    const RegisternameInput = document.getElementById('Registername');
    const Registeremail = document.getElementById('Registeremail');
    const Registerwhatsapp = document.getElementById('Registerwhatsapp');
    const Registerpassword = document.getElementById('Registerpassword');
    const RegisterconfirmPassword = document.getElementById('RegisterconfirmPassword');
    const Registercep = document.getElementById('Registercep');

    const RegisternameError = document.getElementById('RegisternameError');
    const RegisteremailError = document.getElementById('RegisteremailError');
    const RegisterwhatsappError = document.getElementById('RegisterwhatsappError');
    const RegisterpasswordError = document.getElementById('RegisterpasswordError');
    const RegisterconfirmPasswordError = document.getElementById('RegisterconfirmPasswordError');
    const RegistercepError = document.getElementById('RegistercepError');
    const RegisterservicosError = document.getElementById('RegisterservicosError');

    function applyPhoneMask(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }
    function applyCepMask(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    }
    function validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
    }
    function validateWhatsapp(whatsapp) {
        const cleanPhone = whatsapp.replace(/\D/g, '');
        return cleanPhone.length === 11;
    }
    function validateCep(cep) {
        const cleanCep = cep.replace(/\D/g, '');
        return cleanCep.length === 8;
    }

    if (Registerwhatsapp) {
        Registerwhatsapp.addEventListener('input', function() {
            this.value = applyPhoneMask(this.value);
        });
    }
    if (Registercep) {
        Registercep.addEventListener('input', function() {
            this.value = applyCepMask(this.value);
        });
    }

    if (RegisternameInput && RegisternameError) {
        RegisternameInput.addEventListener('input', function() {
            const name = this.value.trim();
            if (name && !validateName(name)) {
                showError(RegisternameError, 'Nome deve conter apenas letras e ter pelo menos 2 caracteres');
            } else if (name) {
                hideError(RegisternameError);
            }
        });
        RegisternameInput.addEventListener('blur', function() {
            const name = this.value.trim();
            if (!name) {
                showError(RegisternameError, 'Nome é obrigatório');
            } else if (!validateName(name)) {
                showError(RegisternameError, 'Nome deve conter apenas letras e ter pelo menos 2 caracteres');
            } else {
                hideError(RegisternameError);
            }
        });
    }
    if (Registeremail && RegisteremailError) {
        Registeremail.addEventListener('input', function() {
            const email = this.value.trim();
            if (email && !validateEmail(email)) {
                showError(RegisteremailError, 'Email inválido');
            } else if (email) {
                hideError(RegisteremailError);
            }
        });
        Registeremail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (!email) {
                showError(RegisteremailError, 'Email é obrigatório');
            } else if (!validateEmail(email)) {
                showError(RegisteremailError, 'Email inválido');
            } else {
                hideError(RegisteremailError);
            }
        });
    }
    if (Registerwhatsapp && RegisterwhatsappError) {
        Registerwhatsapp.addEventListener('blur', function() {
            const whatsapp = this.value;
            if (!whatsapp) {
                showError(RegisterwhatsappError, 'WhatsApp é obrigatório');
            } else if (!validateWhatsapp(whatsapp)) {
                showError(RegisterwhatsappError, 'WhatsApp deve ter 11 dígitos');
            } else {
                hideError(RegisterwhatsappError);
            }
        });
    }
    if (Registerpassword && RegisterpasswordError) {
        Registerpassword.addEventListener('input', function() {
            const password = this.value;
            if (password && !validatePassword(password)) {
                showError(RegisterpasswordError, 'Senha deve ter pelo menos 6 caracteres');
            } else {
                hideError(RegisterpasswordError);
            }
        });
        Registerpassword.addEventListener('blur', function() {
            const password = this.value;
            if (!password) {
                showError(RegisterpasswordError, 'Senha é obrigatória');
            } else if (!validatePassword(password)) {
                showError(RegisterpasswordError, 'Senha deve ter pelo menos 6 caracteres');
            } else {
                hideError(RegisterpasswordError);
            }
        });
    }
    function validatePasswordConfirmation() {
        if (Registerpassword && RegisterconfirmPassword && RegisterconfirmPasswordError) {
            const password = Registerpassword.value;
            const confirmPassword = RegisterconfirmPassword.value;
            if (!confirmPassword) {
                showError(RegisterconfirmPasswordError, 'Confirmação de senha é obrigatória');
                return false;
            } else if (password !== confirmPassword) {
                showError(RegisterconfirmPasswordError, 'Senhas não coincidem');
                return false;
            } else {
                hideError(RegisterconfirmPasswordError);
                return true;
            }
        }
        return true;
    }
    if (RegisterconfirmPassword) {
        RegisterconfirmPassword.addEventListener('input', validatePasswordConfirmation);
        RegisterconfirmPassword.addEventListener('blur', validatePasswordConfirmation);
    }
    if (Registercep && RegistercepError) {
        Registercep.addEventListener('blur', function() {
            const cep = this.value;
            if (!cep) {
                showError(RegistercepError, 'CEP é obrigatório');
            } else if (!validateCep(cep)) {
                showError(RegistercepError, 'CEP deve ter 8 dígitos');
            } else {
                hideError(RegistercepError);
                buscarEnderecoPorCep(cep.replace(/\D/g, ''));
            }
        });
    }
    async function buscarEnderecoPorCep(cep) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                document.getElementById('logradouro').value = data.logradouro || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.localidade || '';
                document.getElementById('uf').value = data.uf || '';
            }
        } catch (error) {
            console.log('Erro ao buscar CEP:', error);
        }
    }
    if (servicosField && RegisterservicosError && userTypeInput) {
        servicosField.addEventListener('blur', function() {
            if (userTypeInput.value === 'prestador') {
                const servicos = this.value.trim();
                if (!servicos) {
                    showError(RegisterservicosError, 'Descrição dos serviços é obrigatória para prestadores');
                } else if (servicos.length < 10) {
                    showError(RegisterservicosError, 'Descreva os serviços com mais detalhes (mínimo 10 caracteres)');
                } else {
                    hideError(RegisterservicosError);
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            hideAlert();
            let hasErrors = false;

            const Registername = RegisternameInput ? RegisternameInput.value.trim() : '';
            const RegisteremailValue = Registeremail ? Registeremail.value.trim() : '';
            const RegisterwhatsappValue = Registerwhatsapp ? Registerwhatsapp.value : '';
            const RegisterpasswordValue = Registerpassword ? Registerpassword.value : '';
            const RegisterconfirmPasswordValue = RegisterconfirmPassword ? RegisterconfirmPassword.value : '';
            const RegistercepValue = Registercep ? Registercep.value : '';

            if (!Registername) {
                showError(RegisternameError, 'Nome é obrigatório');
                hasErrors = true;
            } else if (!validateName(Registername)) {
                showError(RegisternameError, 'Nome deve conter apenas letras e ter pelo menos 2 caracteres');
                hasErrors = true;
            }
            if (!RegisteremailValue) {
                showError(RegisteremailError, 'Email é obrigatório');
                hasErrors = true;
            } else if (!validateEmail(RegisteremailValue)) {
                showError(RegisteremailError, 'Email inválido');
                hasErrors = true;
            }
            if (!RegisterwhatsappValue) {
                showError(RegisterwhatsappError, 'WhatsApp é obrigatório');
                hasErrors = true;
            } else if (!validateWhatsapp(RegisterwhatsappValue)) {
                showError(RegisterwhatsappError, 'WhatsApp deve ter 11 dígitos');
                hasErrors = true;
            }
            if (!RegisterpasswordValue) {
                showError(RegisterpasswordError, 'Senha é obrigatória');
                hasErrors = true;
            } else if (!validatePassword(RegisterpasswordValue)) {
                showError(RegisterpasswordError, 'Senha deve ter pelo menos 6 caracteres');
                hasErrors = true;
            }
            if (!validatePasswordConfirmation()) {
                hasErrors = true;
            }
            if (!RegistercepValue) {
                showError(RegistercepError, 'CEP é obrigatório');
                hasErrors = true;
            } else if (!validateCep(RegistercepValue)) {
                showError(RegistercepError, 'CEP deve ter 8 dígitos');
                hasErrors = true;
            }
            if (userTypeInput && userTypeInput.value === 'prestador') {
                const servicos = servicosField ? servicosField.value.trim() : '';
                if (!servicos) {
                    showError(RegisterservicosError, 'Descrição dos serviços é obrigatória para prestadores');
                    hasErrors = true;
                } else if (servicos.length < 10) {
                    showError(RegisterservicosError, 'Descreva os serviços com mais detalhes (mínimo 10 caracteres)');
                    hasErrors = true;
                }
            }
            // Se não houver erros, prossiga com o envio
            if (!hasErrors) {
                showAlert('Registro bem-sucedido!', 'success');
            }
        });
    }
    const typeBtns = document.querySelectorAll('.type-btn');
if (typeBtns && prestadorSection && userTypeInput) {
    typeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            typeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            userTypeInput.value = btn.getAttribute('data-type');
            if (btn.getAttribute('data-type') === 'prestador') {
                prestadorSection.style.display = 'block';
            } else {
                prestadorSection.style.display = 'none';
            }
        });
    });
}
});