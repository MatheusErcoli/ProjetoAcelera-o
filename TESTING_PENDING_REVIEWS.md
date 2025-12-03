# Guia de Teste - Avaliações Pendentes

## Pré-requisitos
1. Backend rodando
2. Frontend rodando
3. Banco de dados com dados de teste
4. Usuário admin autenticado

## Preparação dos Dados de Teste

### Cenário 1: Pedido sem nenhuma avaliação
1. Crie um pedido entre um prestador e um contratante
2. Atualize o status para "DONE"
3. NÃO crie avaliações para este pedido

### Cenário 2: Apenas o contratante avaliou
1. Crie um pedido entre um prestador e um contratante
2. Atualize o status para "DONE"
3. Crie uma avaliação onde `author_id` = `customer_id`
4. NÃO crie avaliação do prestador

### Cenário 3: Apenas o prestador avaliou
1. Crie um pedido entre um prestador e um contratante
2. Atualize o status para "DONE"
3. Crie uma avaliação onde `author_id` = `provider_id`
4. NÃO crie avaliação do contratante

### Cenário 4: Ambos avaliaram (não deve aparecer em pendentes)
1. Crie um pedido entre um prestador e um contratante
2. Atualize o status para "DONE"
3. Crie avaliação do contratante
4. Crie avaliação do prestador

## Passos de Teste

### Backend

1. **Testar endpoint de avaliações pendentes**
   ```bash
   # No terminal, faça uma requisição
   curl -X GET http://localhost:3000/reviews/pending \
     -H "Authorization: Bearer SEU_TOKEN_ADMIN"
   ```

2. **Verificar resposta**
   - Deve retornar array de objetos
   - Cada objeto deve ter: order, provider_review, customer_review, missing_provider_review, missing_customer_review
   - Apenas pedidos com status "DONE" e avaliações incompletas devem aparecer

### Frontend

1. **Acessar painel admin**
   - Faça login como admin
   - Navegue até "Avaliações"

2. **Verificar interface**
   - Deve haver dois botões no topo:
     - "Avaliações Concluídas" (comportamento antigo)
     - "Avaliações Pendentes" (novo)

3. **Testar aba "Avaliações Concluídas"**
   - Clique em "Avaliações Concluídas"
   - Deve mostrar todas as avaliações existentes agrupadas por pedido
   - Filtros de status devem funcionar
   - Busca por nome/email deve funcionar

4. **Testar aba "Avaliações Pendentes"**
   - Clique em "Avaliações Pendentes"
   - Deve mostrar cards para cada pedido com avaliação incompleta
   - Cada card deve mostrar:
     - Número do pedido com badge laranja
     - Data de criação
     - Badge "Avaliação Incompleta"
     - Prestador e contratante lado a lado
     - Status de cada avaliação (✓ concluída ou ✗ pendente)

5. **Verificar cenários específicos**

   **Cenário 1: Nenhuma avaliação**
   - Ambos os lados devem mostrar "✗ Ainda não avaliou" em vermelho

   **Cenário 2: Apenas contratante avaliou**
   - Lado do contratante: "✓ Avaliação concluída" em verde + detalhes da avaliação
   - Lado do prestador: "✗ Ainda não avaliou" em vermelho

   **Cenário 3: Apenas prestador avaliou**
   - Lado do prestador: "✓ Avaliação concluída" em verde + detalhes da avaliação
   - Lado do contratante: "✗ Ainda não avaliou" em vermelho

   **Cenário 4: Ambos avaliaram**
   - NÃO deve aparecer na aba de pendentes

6. **Testar mensagem vazia**
   - Se não houver avaliações pendentes
   - Deve mostrar ícone de check verde
   - Mensagem: "Não há avaliações pendentes..."

## Checklist de Validação

- [ ] Backend retorna dados corretos no endpoint `/reviews/pending`
- [ ] Frontend exibe toggle entre abas corretamente
- [ ] Contador de avaliações pendentes está correto
- [ ] Cards de pedidos pendentes aparecem com estilo laranja
- [ ] Status de cada participante (prestador/contratante) está correto
- [ ] Avaliações existentes são exibidas (nota + comentário)
- [ ] Avaliações faltando mostram mensagem em vermelho
- [ ] Pedidos totalmente avaliados NÃO aparecem em pendentes
- [ ] Pedidos não concluídos (status != DONE) NÃO aparecem
- [ ] Mensagem vazia aparece quando não há pendências
- [ ] Sem erros no console do navegador
- [ ] Sem erros no log do backend

## Troubleshooting

### Problema: Endpoint retorna 403
**Solução:** Verifique se o token é de um usuário admin

### Problema: Lista vazia mas deveria ter pendências
**Solução:** Verifique se:
- Os pedidos têm status "DONE"
- As avaliações estão corretamente associadas aos pedidos
- O author_id corresponde ao provider_id ou customer_id

### Problema: Erro ao carregar
**Solução:** Verifique:
- Backend está rodando
- Rota `/reviews/pending` está registrada
- Token está válido e não expirou

### Problema: Dados inconsistentes
**Solução:** Verifique:
- Relacionamentos no Sequelize estão corretos
- Includes no query estão funcionando
- Dados no banco estão íntegros
