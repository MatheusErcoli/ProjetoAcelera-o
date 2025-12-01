# 🚀 Guia Rápido de Teste - Sistema de Autenticação

## 1️⃣ Configuração Inicial

### Backend
```bash
cd backend
npm install
# Certifique-se que o .env está configurado com JWT_SECRET
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 2️⃣ Criar Usuários de Teste

Execute o script para criar 3 usuários (um de cada tipo):

```bash
cd backend
node scripts/createTestUsers.js
```

Isso criará:
- **Admin**: admin@test.com / teste123
- **Prestador**: prestador@test.com / teste123  
- **Contratante**: cliente@test.com / teste123

## 3️⃣ Testes de Autenticação

### ✅ Teste 1: Login e Redirecionamento Automático

**Admin:**
1. Acesse http://localhost:5173/login
2. Login: admin@test.com / teste123
3. ✅ Deve redirecionar para `/admin` (Dashboard)

**Prestador:**
1. Acesse http://localhost:5173/login
2. Login: prestador@test.com / teste123
3. ✅ Deve redirecionar para `/home/providers`

**Contratante:**
1. Acesse http://localhost:5173/login
2. Login: cliente@test.com / teste123
3. ✅ Deve redirecionar para `/home/clients`

### ✅ Teste 2: Proteção de Rotas (Tentativa de Acesso Não Autorizado)

**Logado como Admin:**
1. Tente acessar: http://localhost:5173/home/providers
2. ✅ Deve redirecionar de volta para `/admin`
3. Tente acessar: http://localhost:5173/home/clients
4. ✅ Deve redirecionar de volta para `/admin`

**Logado como Prestador:**
1. Tente acessar: http://localhost:5173/admin
2. ✅ Deve redirecionar para `/home/providers`
3. Tente acessar: http://localhost:5173/home/clients
4. ✅ Deve redirecionar para `/home/providers`

**Logado como Contratante:**
1. Tente acessar: http://localhost:5173/admin
2. ✅ Deve redirecionar para `/home/clients`
3. Tente acessar: http://localhost:5173/home/providers
4. ✅ Deve redirecionar para `/home/clients`

### ✅ Teste 3: Bloqueio de Acesso Sem Login

1. Abra DevTools (F12)
2. Vá em Application > Local Storage
3. Apague o item `token`
4. Tente acessar qualquer rota protegida:
   - http://localhost:5173/admin
   - http://localhost:5173/home/providers
   - http://localhost:5173/home/clients
5. ✅ Todas devem redirecionar para `/login`

### ✅ Teste 4: Logout

**De qualquer página protegida:**
1. Clique no ícone de usuário (canto superior direito)
2. Clique em "Sair"
3. ✅ Deve redirecionar para página inicial `/`
4. ✅ Token deve ser removido do localStorage
5. Tente acessar rota protegida novamente
6. ✅ Deve solicitar login

### ✅ Teste 5: Token Inválido

1. Faça login normalmente
2. Abra DevTools > Application > Local Storage
3. Modifique manualmente o valor do `token`
4. Recarregue a página
5. ✅ Deve redirecionar para `/login`

### ✅ Teste 6: Registro de Novo Usuário

**Registrar como Prestador:**
1. Acesse http://localhost:5173/register
2. Selecione "Prestador de Serviço"
3. Preencha todos os campos
4. Clique em "Cadastrar"
5. ✅ Após sucesso, deve redirecionar para `/home/providers`

**Registrar como Contratante:**
1. Acesse http://localhost:5173/register
2. Selecione "Contratante"
3. Preencha todos os campos
4. Clique em "Cadastrar"
5. ✅ Após sucesso, deve redirecionar para `/home/clients`

## 4️⃣ Verificações no Backend

### Testar endpoint /auth/me

**Com token válido:**
```bash
# Primeiro faça login para obter o token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"teste123"}'

# Use o token retornado no próximo comando
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Resposta esperada:**
```json
{
  "id": 1,
  "name": "Admin Teste",
  "email": "admin@test.com",
  "role": "ADMIN",
  "whatsapp": "44999999999",
  "photo_url": "..."
}
```

### Testar token inválido

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer token_invalido"
```

**Resposta esperada:**
```json
{
  "message": "Token inválido"
}
```

## 5️⃣ Checklist Final

- [ ] Login funciona para todos os tipos de usuário
- [ ] Redirecionamento automático após login está correto
- [ ] Rotas protegidas bloqueiam acesso não autorizado
- [ ] Logout limpa token e redireciona corretamente
- [ ] Usuário sem token não acessa rotas protegidas
- [ ] Registro cria usuário e redireciona corretamente
- [ ] Token inválido/expirado é tratado corretamente
- [ ] Não há erros no console do navegador
- [ ] Não há erros no terminal do backend

## 🐛 Troubleshooting

### Problema: "Token inválido" após login
- Verifique se o JWT_SECRET está configurado no backend
- Confirme que o backend está rodando na porta correta
- Verifique se o VITE_API_URL no frontend aponta para o backend

### Problema: Redirecionamento não funciona
- Abra DevTools e veja erros no Console
- Verifique se o endpoint /auth/me está respondendo corretamente
- Confirme que o token está sendo salvo no localStorage

### Problema: CORS errors
- Certifique-se que o backend tem CORS configurado
- Verifique se a URL do frontend está permitida no backend

### Problema: Usuários de teste não foram criados
- Verifique conexão com o banco de dados
- Execute as migrations antes do script
- Veja logs de erro no terminal

## 📝 Logs Úteis

### Ver logs do navegador:
1. F12 > Console
2. Procure por erros (em vermelho)
3. Verifique requisições em Network

### Ver logs do backend:
1. Terminal onde `npm start` está rodando
2. Procure por erros ou mensagens de autenticação

## ✅ Tudo Funcionando?

Se todos os testes passaram, seu sistema de autenticação está funcionando corretamente! 🎉

Próximos passos:
- Implementar refresh tokens
- Adicionar "Esqueci minha senha"
- Melhorar UX com loading states
- Adicionar testes automatizados
