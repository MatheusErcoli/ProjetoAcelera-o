<div class="login-container">
    <div class="login-card">
        <div class="login-header">
            <h1>Bem-vindo</h1>
            <p>Faça seu login para continuar</p>
        </div>
        <form>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
                <span class="error-message" id="emailError"></span>
            </div>
            <div class="form-group">
                <label for="password">Senha</label>
                <input type="password" id="password" name="password" required>
                <span class="error-message" id="passwordError"></span>
            </div>
            <div class="form-options">
                <label class="checkbox-container">
                    <input type="checkbox" id="remember" name="remember">
                    <span class="checkmark"></span>
                    Lembrar de mim
                </label>
                <a href="#" class="forgot-password">Esqueceu a senha?</a>
            </div>
            <button type="submit" class="login-btn">
                <span class="btn-text">Entrar</span>
                <div class="loading-spinner" style="display: none;"></div>
            </button>
            <div class="form-footer">
                <p>Não tem uma conta? <a href="#" class="register-link">Cadastre-se</a></p>
            </div>
        </form>
        <div class="alert" id="alertMessage" style="display: none;">
            <span class="alert-text"></span>
        </div>
    </div>
</div>