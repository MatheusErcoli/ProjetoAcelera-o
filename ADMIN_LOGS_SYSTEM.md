# Sistema de Logs Administrativos

Este documento descreve o sistema de logs para ações administrativas implementado no ServicesClimber.

## Visão Geral

O sistema de logs registra todas as ações administrativas realizadas na plataforma, armazenando-as no banco de dados na tabela `admin_logs`. Estes logs são exibidos no Dashboard do Admin em tempo real.

## Backend

### Modelo (AdminLog)

Localização: `backend/src/models/adminLogs.js`

Campos:
- `id`: Identificador único do log
- `admin_id`: ID do administrador que realizou a ação (pode ser null)
- `action`: Tipo de ação (CREATE, UPDATE, DELETE, APPROVE, REJECT, ACTIVATE, DEACTIVATE)
- `target_table`: Tabela afetada pela ação
- `target_id`: ID do registro afetado
- `details`: Detalhes adicionais sobre a ação
- `created_at`: Data e hora da ação

### Controller

Localização: `backend/src/controllers/admin.controller.js`

Métodos:
- `createLog(req, res)`: Cria um novo log
- `getLogs(req, res)`: Busca todos os logs com paginação
- `getRecentLogs(req, res)`: Busca os 10 logs mais recentes

### Rotas

Localização: `backend/src/routes/admin.routes.js`

```
GET  /admin/logs/recent  - Busca os 10 logs mais recentes (requer autenticação admin)
GET  /admin/logs         - Busca todos os logs com paginação (requer autenticação admin)
POST /admin/logs         - Cria um novo log (requer autenticação admin)
```

### Utility Helper

Localização: `backend/src/utils/adminLogger.js`

Função auxiliar para criar logs facilmente:

```javascript
const { logAdminAction } = require("../utils/adminLogger");

await logAdminAction(
  adminId,        // ID do admin
  "CREATE",       // Ação
  "services",     // Tabela
  5,              // ID do registro
  "Novo serviço criado: Limpeza de Piscinas" // Detalhes
);
```

## Frontend

### Library Helper

Localização: `frontend/src/lib/adminLogger.ts`

Funções auxiliares para criar logs do frontend:

```typescript
import { adminLogger } from "@/lib/adminLogger";

// Exemplos de uso:
await adminLogger.created("services", 5, "Novo serviço criado");
await adminLogger.updated("users", 3, "Perfil atualizado");
await adminLogger.deleted("reviews", 7, "Avaliação removida");
await adminLogger.approved("providers", 4, "Prestador aprovado");
await adminLogger.rejected("providers", 6, "Prestador rejeitado");
await adminLogger.activated("reviews", 1, "Avaliação ativada");
await adminLogger.deactivated("reviews", 2, "Avaliação desativada");
```

### Dashboard

Localização: `frontend/src/pages/admin/AdminDashboard.tsx`

O dashboard exibe os logs recentes no card "Atividade Recente", mostrando:
- Mensagem formatada da ação
- Nome do admin que realizou a ação
- Tempo relativo (há X minutos/horas/dias)
- Detalhes adicionais quando disponíveis

## Logs Automáticos Implementados

### Backend - Controllers com Logs Automáticos

Todos os controllers abaixo já possuem logs automáticos integrados:

#### Users Controller
- ✅ `createUser` - Log ao criar usuário (contratante ou prestador)
- ✅ `updateUser` - Log ao atualizar usuário (incluindo ativação/desativação)

#### Services Controller
- ✅ `createService` - Log ao criar serviço
- ✅ `updateServices` - Log ao atualizar serviço (incluindo ativação/desativação)

#### Orders Controller
- ✅ `createOrder` - Log ao criar ordem (apenas se admin)
- ✅ `updateOrderStatus` - Log ao atualizar status (apenas se admin)
- ✅ `deleteOrder` - Log ao deletar ordem (apenas se admin)

#### Reviews Controller
- ✅ `createReview` - Log ao criar avaliação (apenas se admin)
- ✅ `toggleReviewStatus` - Log ao ativar/desativar avaliação

### Frontend - Páginas com Logs Automáticos

#### AdminServices
- ✅ Ativação/desativação de serviços
- ✅ Criação de novos serviços
- ✅ Atualização de serviços existentes

#### AdminPrestadores
- ✅ Ativação/desativação de prestadores
- ✅ Criação de novos prestadores
- ✅ Atualização de dados de prestadores

#### AdminContratantes
- ✅ Ativação/desativação de contratantes
- ✅ Criação de novos contratantes
- ✅ Atualização de dados de contratantes

#### AdminAvaliacoes
- ✅ Ativação/desativação de avaliações

## Como Usar

### No Backend (Controllers)

Os logs já estão integrados automaticamente nos controllers. Para adicionar em novos endpoints:

```javascript
const { logAdminAction } = require("../utils/adminLogger");

// Após criar/atualizar/deletar algo
if (req.user && req.user.role === "ADMIN") {
  await logAdminAction(
    req.user.id,      // ID do admin autenticado
    "CREATE",         // Tipo de ação
    "services",       // Tabela afetada
    newService.id,    // ID do registro
    `Serviço criado: ${newService.name}` // Detalhes
  );
}
```

### No Frontend (Páginas Admin)

Após uma ação administrativa bem-sucedida:

```typescript
import { adminLogger } from "@/lib/adminLogger";

// Após ativar uma avaliação
await adminLogger.activated(
  "reviews",
  reviewId,
  `Avaliação de ${author} para ${target} - Nota: ${rating}/5`
);
```

## Tipos de Ações

- `CREATE`: Criação de um novo registro
- `UPDATE`: Atualização de um registro existente
- `DELETE`: Exclusão de um registro
- `APPROVE`: Aprovação de um registro pendente
- `REJECT`: Rejeição de um registro pendente
- `ACTIVATE`: Ativação de um registro desativado
- `DEACTIVATE`: Desativação de um registro ativo

## Tabelas Rastreadas

- `users`: Usuários e prestadores
- `services`: Serviços cadastrados
- `orders`: Pedidos/Ordens de serviço
- `reviews`: Avaliações
- `providers`: Prestadores específicos

## Scripts de Teste

Para popular logs de exemplo:

```bash
cd backend
node scripts/seedAdminLogs.js
```

## Status de Implementação

✅ **Concluído:**
- Sistema de logs no backend (models, controllers, rotas)
- Integração automática em todos os controllers principais
- Sistema de logs no frontend (helper library)
- Integração em todas as páginas de admin
- Dashboard mostrando logs recentes em tempo real
- Formatação inteligente de mensagens
- Tempo relativo humanizado

## Próximos Passos

- [ ] Adicionar filtros de logs no dashboard (por ação, tabela, admin)
- [ ] Criar página dedicada para visualizar todos os logs com paginação
- [ ] Adicionar exportação de logs para CSV/Excel
- [ ] Adicionar notificações em tempo real usando WebSockets
- [ ] Implementar retenção automática de logs (limpar logs antigos)
