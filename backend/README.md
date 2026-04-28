# PrestadoresClimber API (backend)

API REST do projeto PrestadoresClimber. Esta camada concentra autenticacao, cadastro, pedidos, avaliacoes e painel administrativo.

## Visao geral
- Express 5 com Sequelize ORM.
- Banco relacional (MariaDB/MySQL) com migrations e seeders.
- Autenticacao via JWT e controle de roles.
- Logs administrativos para auditoria.

## Estrutura principal
- src/app.js: configuracao do Express e registro de rotas.
- src/server.js: bootstrap da API e conexao com o banco.
- src/controllers: regras de negocio por recurso.
- src/routes: definicao das rotas HTTP.
- src/models: modelos Sequelize e relacionamentos.
- src/middlewares: authMiddleware e errorHandler.
- src/utils/adminLogger.js: helper para logs administrativos.
- src/db: config, migrations e seeders.
- scripts: seeds utilitarias (usuarios de teste, logs).

## Endpoints principais (resumo)
- Auth
	- POST /auth/login
	- POST /auth/register
	- GET /auth/me
- Users
	- POST /users
	- GET /users
	- GET /users/:id
	- PUT /users/:id
- Providers
	- GET /providers
	- GET /providers/:id
	- PUT /providers/:id/services
- Services
	- POST /services
	- GET /services
	- PUT /services/:id
- Orders
	- POST /orders
	- GET /orders
	- GET /orders/:id
	- PUT /orders/:id/status
	- DELETE /orders/:id
- Reviews
	- GET /reviews
	- GET /reviews/all (admin)
	- GET /reviews/pending (admin)
	- POST /reviews
	- PUT /reviews/:id/toggle (admin)
- Availability
	- GET /availability/:providerId
	- GET /availability/:providerId/available-slots
	- POST /availability
	- PUT /availability/:id
	- DELETE /availability/:id
- Admin logs
	- GET /admin/logs/recent
	- GET /admin/logs
	- POST /admin/logs
- Health
	- GET /health

## Modelos principais
- User, Address
- Service, ProviderService
- Order, OrderService
- Review
- Availability
- GalleryImage
- AdminLog
- LoginCode, RefreshToken

## Autenticacao e autorizacao
- JWT no header Authorization: Bearer <token>
- authMiddleware valida token e injeta req.user
- Roles: ADMIN, PRESTADOR, CONTRATANTE

## Logs administrativos
- adminLogger registra CREATE/UPDATE/DELETE/ACTIVATE/DEACTIVATE etc.
- Dashboard admin consome /admin/logs/recent.

## Scripts uteis
- npm run dev (nodemon)
- npm run start
- npm run migrate
- npm run seed
- npm run reset
- node scripts/createTestUsers.js
- node scripts/seedAdminLogs.js

## Variaveis de ambiente (.env)
Exemplo:
```
PORT=3000
JWT_SECRET=seu_secret_aqui
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prestadoresclimber
DB_USER=root
DB_PASS=senha
DB_DIALECT=mariadb
```

## Como rodar
1) npm install
2) Configure .env
3) npm run migrate
4) npm run seed
5) npm run dev

## Observacoes de escopo
- Rotas de galeria estao desabilitadas (app.js e routes).
- Login por codigo/validacao de email e refresh token possuem modelos prontos, mas o fluxo ainda nao esta integrado.
