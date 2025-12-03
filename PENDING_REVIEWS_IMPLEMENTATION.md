# Implementação de Avaliações Pendentes

## Resumo
Foi implementada uma funcionalidade completa para exibir avaliações pendentes (incompletas) no painel administrativo. Esta funcionalidade identifica pedidos concluídos onde uma ou ambas as partes (prestador e contratante) ainda não realizaram suas avaliações.

## Alterações Realizadas

### Backend

#### 1. Controller (`backend/src/controllers/reviews.controller.js`)
- **Nova função:** `getPendingReviews`
  - Busca todas as ordens com status "DONE"
  - Para cada ordem, verifica se existem avaliações do prestador e do contratante
  - Retorna apenas ordens onde falta pelo menos uma avaliação
  - Inclui informações completas sobre:
    - O pedido (ID, status, data de criação)
    - Prestador e contratante (dados do usuário)
    - Avaliações existentes (se houver)
    - Flags indicando quais avaliações estão faltando

#### 2. Routes (`backend/src/routes/reviews.routes.js`)
- **Nova rota:** `GET /reviews/pending`
  - Protegida por autenticação (authMiddleware)
  - Disponível apenas para administradores
  - Retorna lista de avaliações pendentes

### Frontend

#### 1. Types e Interfaces (`frontend/src/pages/admin/AdminAvaliacoes.tsx`)
- **Atualizada interface `Order`:** Agora inclui `provider` e `customer` opcionais
- **Nova interface `PendingReview`:**
  ```typescript
  interface PendingReview {
    order: Order;
    provider_review: Review | null;
    customer_review: Review | null;
    missing_provider_review: boolean;
    missing_customer_review: boolean;
  }
  ```

#### 2. Estado do Componente
- **Novo estado:** `pendingReviews` - armazena lista de avaliações pendentes
- **Novo estado:** `viewMode` - controla visualização entre "completed" e "pending"
- **Nova função:** `fetchPendingReviews()` - busca avaliações pendentes da API

#### 3. Interface de Usuário

##### Toggle de Visualização
- Dois botões para alternar entre:
  - **Avaliações Concluídas** - exibe o comportamento anterior (avaliações existentes)
  - **Avaliações Pendentes** - nova seção

##### Seção de Avaliações Pendentes
Exibe cards para cada pedido com avaliações incompletas, mostrando:
- **Cabeçalho do Pedido:**
  - Número do pedido com badge laranja
  - Data de criação
  - Badge "Avaliação Incompleta"

- **Grid com 2 colunas:**
  - **Coluna Prestador:**
    - Avatar e informações do prestador
    - Status da avaliação (✓ concluída ou ✗ pendente)
    - Se concluída, mostra nota e comentário
  
  - **Coluna Contratante:**
    - Avatar e informações do contratante
    - Status da avaliação (✓ concluída ou ✗ pendente)
    - Se concluída, mostra nota e comentário

- **Código de cores:**
  - Verde: Avaliação concluída
  - Vermelho: Avaliação pendente
  - Laranja: Indicador de pedido com avaliação incompleta

## Funcionalidades Implementadas

### Detecção de Avaliações Pendentes
O sistema identifica três cenários:
1. **Nenhuma avaliação:** Nem prestador nem contratante avaliaram
2. **Avaliação parcial (1):** Apenas o prestador avaliou
3. **Avaliação parcial (2):** Apenas o contratante avaliou

### Filtros e Busca
- Filtros de status (Todas/Ativas/Inativas) aplicam-se apenas às avaliações concluídas
- A busca por nome/email também funciona apenas na aba de concluídas
- Avaliações pendentes não têm filtros (mostram todas as pendentes)

### Mensagens de Estado
- Loading state durante carregamento
- Mensagem vazia específica para cada aba
- Na aba pendentes: mensagem positiva quando não há pendências

## Segurança
- Endpoint protegido por autenticação
- Verificação de role ADMIN no backend
- Token JWT validado em todas as requisições

## Como Testar

1. Certifique-se de ter pedidos com status "DONE" no banco de dados
2. Crie alguns pedidos onde apenas uma parte avaliou
3. Acesse o painel administrativo → Avaliações
4. Clique em "Avaliações Pendentes"
5. Verifique se os pedidos incompletos aparecem corretamente

## Melhorias Futuras (Opcional)
- Adicionar notificações para usuários com avaliações pendentes
- Implementar lembretes automáticos após X dias do pedido concluído
- Adicionar métricas de taxa de conclusão de avaliações
- Permitir admin enviar notificação manual para completar avaliação
