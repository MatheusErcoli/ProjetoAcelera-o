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


    //elementos registro
    const registerForm = document.getElementById('registerForm');
    const userTypeButtons = document.querySelectorAll('.type-btn');
    const userTypeInput = document.getElementById('userType');
    const prestadorSection = document.getElementById('prestadorSection');
    const servicosField = document.getElementById('servicos');

    //campos formulário registro
    const Registername = document.getElementById('Registername');
    const Registeremail = document.getElementById('Registeremail');
    const Registerwhatsapp = document.getElementById('Registerwhatsapp');
    const Registerpassword = document.getElementById('Registerpassword');
    const RegisterconfirmPassword = document.getElementById('RegisterconfirmPassword');
    const Registercep = document.getElementById('Registercep');

    //elementos de erro registro
    const RegisternameError = document.getElementById('RegisternameError');
    const RegisteremailError = document.getElementById('RegisteremailError');
    const RegisterwhatsappError = document.getElementById('RegisterwhatsappError');
    const RegisterpasswordError = document.getElementById('RegisterpasswordError');
    const RegisterconfirmPasswordError = document.getElementById('RegisterconfirmPasswordError');
    const RegistercepError = document.getElementById('RegistercepError');
    const RegisterservicosError = document.getElementById('RegisterservicosError');
    
    // Elementos de controle
    const registerBtn = document.querySelector('.register-btn');
    const RegisterbtnText = document.querySelector('.Registerbtn-text');
    const RegisteralertMessage = document.getElementById('RegisteralertMessage');
    const RegisteralertText = document.querySelector('.Registeralert-text');

    // Alternância entre tipos de usuário
    userTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            
            
            userTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Atualizar campo hidden
            userTypeInput.value = type;
            
            // Mostrar/ocultar seção de prestador
            if (type === 'prestador') {
                prestadorSection.style.display = 'block'; 
                prestadorSection.classList.remove('hide');
                prestadorSection.classList.add('show');
                servicosField.required = true;
            } else {
                prestadorSection.classList.remove('show');
                prestadorSection.classList.add('hide');
                servicosField.required = false;
                servicosField.value = '';
                hideError(servicosError);
                // Após a animação de 'hide', ocultar completamente
                prestadorSection.addEventListener('animationend', function handler() {
                    if (!prestadorSection.classList.contains('show')) { 
                        prestadorSection.style.display = 'none';
                    }
                    prestadorSection.removeEventListener('animationend', handler);
                }, {once: true});
            }
        });
    });
    // Máscaras para campos
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

    // Aplicar máscaras
    Registerwhatsapp.addEventListener('input', function() {
        this.value = applyPhoneMask(this.value);
    });

    Registercep.addEventListener('input', function() {
        this.value = applyCepMask(this.value);
    });
    // Funções de validação
    function validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateWhatsapp(whatsapp) {
        const cleanPhone = whatsapp.replace(/\D/g, '');
        return cleanPhone.length === 11;
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function validateCep(cep) {
        const cleanCep = cep.replace(/\D/g, '');
        return cleanCep.length === 8;
    }
    function showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
        element.parentElement.querySelector('input, select, textarea').classList.add('invalid');
        element.parentElement.querySelector('input, select, textarea').classList.remove('valid');
    }

    function hideError(element) {
        element.textContent = '';
        element.classList.remove('show');
        const field = element.parentElement.querySelector('input, select, textarea');
        field.classList.remove('invalid');
        field.classList.add('valid');
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
    // Validação em tempo real
    nameInput.addEventListener('input', function() {
        const name = this.value.trim();
        if (name && !validateName(name)) {
            showError(nameError, 'Nome deve conter apenas letras e ter pelo menos 2 caracteres');
        } else if (name) {
            hideError(nameError);
        }
    });

    nameInput.addEventListener('blur', function() {
        const name = this.value.trim();
        if (!name) {
            showError(nameError, 'Nome é obrigatório');
        } else if (!validateName(name)) {
            showError(nameError, 'Nome deve conter apenas letras e ter pelo menos 2 caracteres');
        } else {
            hideError(nameError);
        }
    });

    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showError(emailError, 'Email inválido');
        } else if (email) {
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

    whatsappInput.addEventListener('blur', function() {
        const whatsapp = this.value;
        if (!whatsapp) {
            showError(whatsappError, 'WhatsApp é obrigatório');
        } else if (!validateWhatsapp(whatsapp)) {
            showError(whatsappError, 'WhatsApp deve ter 11 dígitos');
        } else {
            hideError(whatsappError);
        }
    });

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        if (password && !validatePassword(password)) {
            showError(passwordError, 'Senha deve ter pelo menos 6 caracteres');
        } else if (password) {
            hideError(passwordError);
        }
        
        // Revalidar confirmação se já foi preenchida
        if (confirmPasswordInput.value) {
            validatePasswordConfirmation();
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

    function validatePasswordConfirmation() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            showError(confirmPasswordError, 'Confirmação de senha é obrigatória');
            return false;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordError, 'Senhas não coincidem');
            return false;
        } else {
            hideError(confirmPasswordError);
            return true;
        }
    }

    confirmPasswordInput.addEventListener('input', validatePasswordConfirmation);
    confirmPasswordInput.addEventListener('blur', validatePasswordConfirmation);

    cepInput.addEventListener('blur', function() {
        const cep = this.value;
        if (!cep) {
            showError(cepError, 'CEP é obrigatório');
        } else if (!validateCep(cep)) {
            showError(cepError, 'CEP deve ter 8 dígitos');
        } else {
            hideError(cepError);
            // Buscar endereço por CEP (opcional)
            buscarEnderecoPorCep(cep.replace(/\D/g, ''));
        }
    });
    // Busca de endereço por CEP
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
    servicosField.addEventListener('blur', function() {
        if (userTypeInput.value === 'prestador') {
            const servicos = this.value.trim();
            if (!servicos) {
                showError(servicosError, 'Descrição dos serviços é obrigatória para prestadores');
            } else if (servicos.length < 7) {
                showError(servicosError, 'Descreva os serviços com mais detalhes (mínimo 10 caracteres)');
            } else {
                hideError(servicosError);
            }
        }
    });
    // Submissão do formulário
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        hideAlert();
        
        // Validação final
        let hasErrors = false;
        
        // Validar todos os campos obrigatórios
        const Registername = Registername.value.trim();
        const Registeremail = Registeremail.value.trim();
        const Registerwhatsapp = Registerwhatsapp.value;
        const Registerpassword = Registerpassword.value;
        const RegisterconfirmPassword = RegisterconfirmPassword.value;
        const Registercep = Registercep.value;
        
        if (!Registername) {
            showError(nameError, 'Nome é obrigatório');
            hasErrors = true;
        } else if (!validateName(Registername)) {
            showError(nameError, 'Nome deve conter apenas letras e ter pelo menos 2 caracteres');
            hasErrors = true;
        }
        
        if (!Registeremail) {
            showError(emailError, 'Email é obrigatório');
            hasErrors = true;
        } else if (!validateEmail(Registeremail)) {
            showError(emailError, 'Email inválido');
            hasErrors = true;
        }
        
        if (!Registerwhatsapp) {
            showError(whatsappError, 'WhatsApp é obrigatório');
            hasErrors = true;
        } else if (!validateWhatsapp(Registerwhatsapp)) {
            showError(whatsappError, 'WhatsApp deve ter 11 dígitos');
            hasErrors = true;
        }
        
        if (!Registerpassword) {
            showError(passwordError, 'Senha é obrigatória');
            hasErrors = true;
        } else if (!validatePassword(Registerpassword)) {
            showError(passwordError, 'Senha deve ter pelo menos 6 caracteres');
            hasErrors = true;
        }
        
        if (!validatePasswordConfirmation()) {
            hasErrors = true;
        }
        
        if (!Registercep) {
            showError(cepError, 'CEP é obrigatório');
            hasErrors = true;
        } else if (!validateCep(Registercep)) {
            showError(cepError, 'CEP deve ter 8 dígitos');
            hasErrors = true;
        }
        
        if (userTypeInput.value === 'prestador') {
            const servicos = servicosField.value.trim();
            if (!servicos) {
                showError(servicosError, 'Descrição dos serviços é obrigatória para prestadores');
                hasErrors = true;
            } else if (servicos.length < 10) {
                showError(servicosError, 'Descreva os serviços com mais detalhes (mínimo 10 caracteres)');
                hasErrors = true;
            }
        }
    });
    // Animações de entrada
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach((section, index) => {
        section.style.animationDelay = `${index * 0.1}s`;
    });
});
