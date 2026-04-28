# PrestadoresClimber (prestadoresclimber.com.br)

Projeto academico desenvolvido pelos alunos participantes do Programa de Aceleracao de Carreiras 2026 do Centro Universitario Integrado. Esta entrega final foi planejada para apresentacao a banca do projeto.

## Contexto e dor do cliente
Joseph Climber chegou a Campo Mourao. Casado e pai de tres filhos, trabalha em tres periodos e sua esposa, Janyce Climber, teve dificuldade para encontrar prestadores de servico de forma rapida e confiavel para resolver problemas do dia a dia (ex.: cano estourado, troca de chuveiro, instalacao eletrica). A dor central era a demora para localizar profissionais e a falta de um canal unico de indicacoes.

## Solucao proposta
O prestadoresclimber.com.br conecta prestadores e contratantes em um marketplace local, com cadastro validado, busca filtrada e pedidos com avaliacao dupla. Assim, o contratante encontra ajuda rapida e o prestador ganha visibilidade e credibilidade.

## O que foi entregue
- Cadastro e login para prestador e contratante com endereco completo, WhatsApp e foto.
- Selecionar servicos oferecidos pelo prestador e listar prestadores com filtros (cidade, UF, servico, dia da semana).
- Agenda e disponibilidade do prestador com validacao de horario e slots disponiveis.
- Pedidos/ordens com status (REQUESTED, CONFIRMED, DONE, CANCELLED).
- Avaliacoes com regra de exibicao apenas quando as duas partes avaliam.
- Painel administrativo para usuarios, prestadores, servicos e avaliacoes.
- Logs administrativos e atividade recente no dashboard.
- Interfaces responsivas para desktop e mobile.

## Requisitos x implementacao (resumo)
| Requisito | Status |
| --- | --- |
| Cadastro de prestador e contratante com endereco, WhatsApp e foto | OK |
| Listagem e filtros de prestadores (cidade, UF, servico) | OK |
| Selecionar servicos e disponibilidade do prestador | OK |
| Pedido e agendamento de horario | OK |
| Avaliacao dupla (prestador e contratante) | OK |
| Painel admin com ativar/desativar usuarios e avaliacoes | OK |
| Cadastro de servicos no admin | OK |
| Galeria de fotos do prestador | Parcial (UI pronta, API desabilitada) |
| Validacao por email/codigo e refresh token | Base pronta (modelos), fluxo nao integrado |

## Stack
### Backend
- Node.js, Express 5
- Sequelize ORM
- MariaDB/MySQL (dialect configuravel)
- JWT, bcrypt
- dotenv, cors, cookie-parser

### Frontend
- React 18 + TypeScript
- React Router, TanStack Query
- Tailwind CSS + Radix UI + shadcn/ui
- Webpack + Babel
- date-fns, lucide-react

## Arquitetura (visao geral)
- Frontend SPA consome API REST.
- Backend organiza controllers, routes e models com Sequelize.
- Banco relacional guarda usuarios, servicos, pedidos, avaliacoes e logs.
- Autenticacao com JWT e controle de roles (ADMIN, PRESTADOR, CONTRATANTE).

## Como rodar (resumo rapido)
1) Backend: cd backend, npm install, configurar .env, npm run migrate, npm run seed, npm run dev
2) Frontend: cd frontend, npm install, configurar .env, npm run dev
3) Opcional: node backend/scripts/createTestUsers.js para usuarios de teste

Detalhes completos em backend/README.md e frontend/README.md.

## Credenciais de teste
- Admin: admin@test.com / teste123
- Prestador: prestador@test.com / teste123
- Contratante: cliente@test.com / teste123

## Documentacao complementar
- ADMIN_LOGS_SYSTEM.md
- AUTHENTICATION.md
- PENDING_REVIEWS_IMPLEMENTATION.md
- TESTING_GUIDE.md
- TESTING_PENDING_REVIEWS.md
