# PrestadoresClimber Web (frontend)

Aplicacao web do projeto PrestadoresClimber. Esta SPA atende contratantes, prestadores e administradores com rotas protegidas por role.

## Visao geral
- React 18 + TypeScript.
- Rotas com React Router.
- Autenticacao centralizada no AuthContext.
- Interfaces responsivas com design system em Tailwind CSS.

## Stack principal
- React 18 + TypeScript
- React Router
- TanStack Query
- Tailwind CSS + Radix UI + shadcn/ui
- Webpack + Babel
- date-fns, lucide-react

## Rotas principais
- / (landing)
- /login
- /register
- /home/clients (CONTRATANTE)
- /home/providers (PRESTADOR)
- /admin (ADMIN)
- /admin/prestadores
- /admin/contratantes
- /admin/servicos
- /admin/avaliacoes

## Modulos importantes
- AuthContext: login, logout, register e checkAuth.
- ProtectedRoute: bloqueio e redirecionamento por role.
- AdminDashboard: contadores, avaliacoes pendentes e logs recentes.
- AdminPrestadores / AdminContratantes / AdminServices / AdminAvaliacoes: gestao administrativa.
- ClientsPage: busca de prestadores, pedidos e avaliacoes.
- ProvidersPage: perfil do prestador, pedidos, disponibilidade e avaliacoes.
- adminLogger: envio de logs administrativos para o backend.

## Configuracao (.env)
```
VITE_API_URL=http://localhost:3000
```

## Como rodar
1) npm install
2) Configure .env
3) npm run dev

Build de producao:
```
npm run build
```

## Observacoes de escopo
- A galeria de imagens do prestador depende do endpoint /gallery (nao habilitado no backend).
- O frontend espera a API rodando na URL configurada em VITE_API_URL.
