# Sistema de Autenticação e Autorização - ServicesClimber

## ✅ Implementações Realizadas

### Backend

1. **Endpoint `/auth/me`** - Retorna informações do usuário autenticado
   - Localização: `backend/src/controllers/auth.controller.js`
   - Rota: `backend/src/routes/auth.routes.js`
   - Protegido por `authMiddleware`

### Frontend

1. **AuthContext** (`frontend/src/contexts/AuthContext.tsx`)
   - Context centralizado para gerenciar autenticação
   - Mantém estado do usuário, token e status de autenticação
   - Funções: `login()`, `logout()`, `checkAuth()`
   - Verifica automaticamente autenticação ao carregar a aplicação

2. **ProtectedRoute** (`frontend/src/components/ProtectedRoute.tsx`)
   - Componente HOC para proteger rotas
   - Verifica se usuário está autenticado
   - Valida se o role do usuário tem permissão para acessar a rota
   - Redireciona automaticamente para a página correta baseado no role

3. **Atualização do App.tsx**
   - Todas as rotas sensíveis agora estão protegidas
   - Rotas `/admin/*` - apenas `ADMIN`
   - Rota `/home/providers` - apenas `PRESTADOR`
   - Rota `/home/clients` - apenas `CONTRATANTE`

4. **Atualização do LoginPage**
   - Usa AuthContext ao invés do hook antigo
   - Redireciona automaticamente após login baseado no role:
     - `ADMIN` → `/admin`
     - `PRESTADOR` → `/home/providers`
     - `CONTRATANTE` → `/home/clients`

5. **Atualização dos Layouts e Páginas**
   - AdminLayout: Botão de logout com dropdown
   - ClientsPage: Logout usando AuthContext
   - ProvidersPage: Logout usando AuthContext

## 🔐 Fluxo de Autenticação

### Login
1. Usuário envia email e senha
2. Backend valida credenciais
3. Backend retorna token JWT + dados do usuário (incluindo role)
4. Frontend salva token no localStorage
5. Frontend consulta `/auth/me` para confirmar autenticação
6. Redireciona baseado no role do usuário

### Proteção de Rotas
1. Ao acessar uma rota protegida:
   - ProtectedRoute verifica se há token válido
   - Verifica se o role do usuário está nos `allowedRoles`
   - Se não autorizado, redireciona para a página apropriada
   - Se não autenticado, redireciona para `/login`

### Logout
1. Limpa token do localStorage
2. Limpa estado do usuário no Context
3. Redireciona para página inicial

## 📋 Roles e Permissões

| Role | Rotas Permitidas | Descrição |
|------|------------------|-----------|
| `ADMIN` | `/admin/*` | Acesso total ao painel administrativo |
| `PRESTADOR` | `/home/providers` | Página de gestão do prestador |
| `CONTRATANTE` | `/home/clients` | Página de busca de prestadores |

## 🧪 Como Testar

### 1. Iniciar o Backend
```bash
cd backend
npm install
npm start
```

### 2. Iniciar o Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Criar Usuários de Teste

Você pode criar usuários via endpoint `/auth/register` ou diretamente no banco de dados:

```sql
-- Admin
INSERT INTO users (name, email, password_hash, role, whatsapp) 
VALUES ('Admin', 'admin@test.com', '$2b$10$hash...', 'ADMIN', '44999999999');

-- Prestador
INSERT INTO users (name, email, password_hash, role, whatsapp) 
VALUES ('Prestador Teste', 'prestador@test.com', '$2b$10$hash...', 'PRESTADOR', '44999999998');

-- Contratante
INSERT INTO users (name, email, password_hash, role, whatsapp) 
VALUES ('Cliente Teste', 'cliente@test.com', '$2b$10$hash...', 'CONTRATANTE', '44999999997');
```

### 4. Cenários de Teste

#### ✅ Teste 1: Login como Admin
1. Acesse `/login`
2. Entre com credenciais de admin
3. Deve redirecionar para `/admin` (Dashboard)
4. Tente acessar `/home/providers` - deve redirecionar de volta para `/admin`
5. Tente acessar `/home/clients` - deve redirecionar de volta para `/admin`

#### ✅ Teste 2: Login como Prestador
1. Acesse `/login`
2. Entre com credenciais de prestador
3. Deve redirecionar para `/home/providers`
4. Tente acessar `/admin` - deve redirecionar de volta para `/home/providers`
5. Tente acessar `/home/clients` - deve redirecionar de volta para `/home/providers`

#### ✅ Teste 3: Login como Contratante
1. Acesse `/login`
2. Entre com credenciais de contratante
3. Deve redirecionar para `/home/clients`
4. Tente acessar `/admin` - deve redirecionar de volta para `/home/clients`
5. Tente acessar `/home/providers` - deve redirecionar de volta para `/home/clients`

#### ✅ Teste 4: Acesso sem Login
1. Limpe o localStorage
2. Tente acessar `/admin` diretamente
3. Deve redirecionar para `/login`
4. Tente acessar `/home/providers` - deve redirecionar para `/login`
5. Tente acessar `/home/clients` - deve redirecionar para `/login`

#### ✅ Teste 5: Logout
1. Faça login com qualquer usuário
2. Clique no botão de logout
3. Deve limpar autenticação e redirecionar para página inicial
4. Tente acessar rotas protegidas - deve pedir login novamente

## 🔧 Variáveis de Ambiente

### Backend (.env)
```env
JWT_SECRET=seu_secret_aqui
PORT=3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## 📝 Notas Importantes

1. **Token JWT**: O token expira em 1 dia. Após expirar, o usuário precisa fazer login novamente.

2. **Middleware de Autenticação**: Todas as rotas protegidas no backend devem usar `authMiddleware`.

3. **Context Provider**: O `AuthProvider` deve envolver todas as rotas que precisam de autenticação.

4. **Verificação Automática**: Ao carregar a aplicação, o AuthContext verifica automaticamente se há um token válido.

5. **Segurança**: 
   - Nunca exponha o JWT_SECRET
   - Use HTTPS em produção
   - Implemente refresh tokens para sessões longas (futuro)
   - Considere adicionar rate limiting no backend

## 🚀 Próximos Passos (Melhorias Futuras)

- [ ] Implementar refresh tokens
- [ ] Adicionar "Esqueci minha senha"
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Adicionar rate limiting no login
- [ ] Implementar log de atividades de login
- [ ] Adicionar opção "Lembrar-me" funcional
- [ ] Melhorar tratamento de erros de rede
- [ ] Adicionar loading states mais robustos
