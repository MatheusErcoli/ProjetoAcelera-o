<body>
    <div class="register-container">
        <div class="register-card">
            <div class="register-header">
                <h1>Criar Conta</h1>
                <p>Preencha os dados para se cadastrar</p>
            </div>
            
            <!-- Seletor de tipo de usuário -->
            <div class="user-type-selector">
                <button type="button" class="type-btn active" data-type="usuario">
                    <span class="type-icon">👤</span>
                    <span class="type-text">Usuário</span>
                </button>
                <button type="button" class="type-btn" data-type="prestador">
                    <span class="type-icon">🔧</span>
                    <span class="type-text">Prestador</span>
                </button>
            </div>
            
            <form id="registerForm" class="register-form" action="registro.php" method="POST">
                <input type="hidden" id="userType" name="user_type" value="usuario">
                
                <!-- Campos básicos (comuns aos dois tipos) -->
                <div class="form-section">
                    <h3 class="section-title">Dados Pessoais</h3>
                    
                    <div class="form-group">
                        <label for="name">Nome Completo</label>
                        <input type="text" id="Registername" name="Registername" required>
                        <span class="error-message" id="RegisternameError"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="Registeremail" name="Registeremail" required>
                        <span class="error-message" id="RegisteremailError"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="whatsapp">WhatsApp</label>
                        <input type="tel" id="Registerwhatsapp" name="Registerwhatsapp" placeholder="(00) 00000-0000" required>
                        <span class="error-message" id="RegisterwhatsappError"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="Registerpassword" name="Registerpassword" required>
                        <span class="error-message" id="RegisterpasswordError"></span>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirmPassword">Confirmar Senha</label>
                        <input type="password" id="RegisterconfirmPassword" name="confirm_password" required>
                        <span class="error-message" id="RegisterconfirmPasswordError"></span>
                    </div>
                </div>
                
                <!-- Campos de endereço -->
                <div class="form-section">
                    <h3 class="section-title">Endereço</h3>
                    
                    <div class="form-row">
                        <div class="form-group flex-2">
                            <label for="logradouro">Logradouro</label>
                            <input type="text" id="logradouro" name="logradouro" placeholder="Rua, Avenida, etc." required>
                            <span class="error-message" id="logradouroError"></span>
                        </div>
                        
                        <div class="form-group flex-1">
                            <label for="numero">Número</label>
                            <input type="text" id="numero" name="numero" required>
                            <span class="error-message" id="numeroError"></span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="complemento">Complemento</label>
                        <input type="text" id="complemento" name="complemento" placeholder="Apartamento, sala, etc. (opcional)">
                        <span class="error-message" id="complementoError"></span>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group flex-2">
                            <label for="bairro">Bairro</label>
                            <input type="text" id="bairro" name="bairro" required>
                            <span class="error-message" id="bairroError"></span>
                        </div>
                        
                        <div class="form-group flex-1">
                            <label for="cep">CEP</label>
                            <input type="text" id="Registercep" name="Registercep" placeholder="00000-000" required>
                            <span class="error-message" id="RegistercepError"></span>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group flex-2">
                            <label for="cidade">Cidade</label>
                            <input type="text" id="cidade" name="cidade" required>
                            <span class="error-message" id="cidadeError"></span>
                        </div>
                        
                        <div class="form-group flex-1">
                            <label for="uf">UF</label>
                            <select id="uf" name="uf" required>
                                <option value="">Selecione</option>
                                <option value="AC">AC</option>
                                <option value="AL">AL</option>
                                <option value="AP">AP</option>
                                <option value="AM">AM</option>
                                <option value="BA">BA</option>
                                <option value="CE">CE</option>
                                <option value="DF">DF</option>
                                <option value="ES">ES</option>
                                <option value="GO">GO</option>
                                <option value="MA">MA</option>
                                <option value="MT">MT</option>
                                <option value="MS">MS</option>
                                <option value="MG">MG</option>
                                <option value="PA">PA</option>
                                <option value="PB">PB</option>
                                <option value="PR">PR</option>
                                <option value="PE">PE</option>
                                <option value="PI">PI</option>
                                <option value="RJ">RJ</option>
                                <option value="RN">RN</option>
                                <option value="RS">RS</option>
                                <option value="RO">RO</option>
                                <option value="RR">RR</option>
                                <option value="SC">SC</option>
                                <option value="SP">SP</option>
                                <option value="SE">SE</option>
                                <option value="TO">TO</option>
                            </select>
                            <span class="error-message" id="ufError"></span>
                        </div>
                    </div>
                </div>
                
                <!-- Campos específicos para prestador de serviço -->
                <div class="form-section" id="prestadorSection" style="display: none;">
                    <h3 class="section-title">Serviços Oferecidos</h3>
                    
                    <div class="form-group">
                        <label for="servicos">Descreva os serviços que você oferece</label>
                        <textarea id="servicos" name="servicos" rows="4" placeholder="Ex: Eletricista residencial e predial, instalação de chuveiros, tomadas, disjuntores, manutenção elétrica em geral..."></textarea>
                        <span class="error-message" id="RegisterservicosError"></span>
                    </div>
                </div>
                <button type="submit" class="register-btn">
                    <span class="Registerbtn-text">Criar Conta</span>
                </button>
                
                <div class="form-footer">
                    <p>Já tem uma conta? <a href="login" class="login-link">Faça login</a></p>
                </div>
            </form>
            
            <div class="alert" id="RegisteralertMessage" style="display: none;">
                <span class="Registeralert-text"></span>
            </div>
        </div>
    </div>
</body>