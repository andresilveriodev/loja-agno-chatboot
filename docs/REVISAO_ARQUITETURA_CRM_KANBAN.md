# Revisão de Arquitetura – CRM Kanban (Projeto Loja Multidepartamental)

**Revisor:** Architect (Aria) | AIOS  
**Documentos revisados:** `docs/PLANEJAMENTO_CRM_KANBAN_FUNIL.md`, `ARQUITETURA_PROJETO.md` (Fases 5–6, CRM, WhatsApp, Banco de Dados)  
**Data:** Fevereiro 2026

---

## 1. Resumo executivo

O planejamento do CRM Kanban está **consistente e implementável**. A revisão identifica **inconsistências de nomenclatura**, **gaps de segurança e resiliência** e **recomendações de API e performance** para reduzir risco e débito técnico antes da implementação.

**Veredicto:** Aprovado com recomendações obrigatórias (padronização de rotas, autenticação do CRM, validação de webhook) e opcionais (versionamento de API, otimistic update, índices Order).

---

## 2. Consistência entre documentos

### 2.1 Rotas de API – Webhook WhatsApp

| Documento | Rota do webhook |
|-----------|------------------|
| `ARQUITETURA_PROJETO.md` (Fase 6) | `POST /api/whatsapp/webhook` |
| `ARQUITETURA_PROJETO.md` (seção Integração WhatsApp) | `POST /api/webhooks/whatsapp` |
| `PLANEJAMENTO_CRM_KANBAN_FUNIL.md` | `POST /api/webhooks/whatsapp` |

**Recomendação:** Padronizar em **uma única rota**. Sugestão: **`POST /api/webhooks/whatsapp`** (plural `webhooks` agrupa futuros webhooks) e atualizar a Fase 6 no `ARQUITETURA_PROJETO.md` para essa rota.

### 2.2 Módulos backend: leads vs crm

- **ARQUITETURA** prevê: `modules/leads/` (Lead, stage) e `modules/crm/` (kanban-stage, activity, scheduling).
- **PLANEJAMENTO** fala em endpoints `/api/crm/leads`, `/api/crm/schedule`, `/api/crm/orders`.

**Recomendação:** Manter **um único prefixo de API** `/api/crm/` e, no backend, decidir:
- **Opção A:** Controller em `crm.controller.ts` que orquestra Leads, Schedules e Orders (recomendado para API unificada).
- **Opção B:** Controllers separados (`leads.controller.ts`, `crm.controller.ts`) com rotas montadas sob o prefixo `crm` (ex.: `GET /api/crm/leads` no LeadsController). Garantir que não exista duplicação de responsabilidade (ex.: criação de lead só no webhook ou em um único módulo).

### 2.3 Estágios (stage) – Lead vs Order

- Lead usa estágios 1–7 (new_lead … won, lost).
- Order usa estágios 8–12 (payment_pending … delivered).

No plano está claro que são entidades diferentes (lead vs pedido). **Recomendação:** No backend, usar **enums separados** (`LeadStage`, `OrderStage`) para evitar mistura de valores e facilitar validação (ex.: não aceitar `stage: 'delivered'` em Lead).

---

## 3. Design de API (REST)

### 3.1 Convenções atuais

- `GET /api/crm/leads` com query params (stage, source, from, to, q, intent).
- `GET /api/crm/leads/:id`, `PUT /api/crm/leads/:id`.
- `GET /api/crm/leads/:id/history` para timeline.
- `POST /api/crm/schedule`, `PUT /api/crm/schedule/:id`.
- `GET /api/crm/orders`, `GET /api/crm/orders/:id`, `POST /api/crm/orders`, `PUT /api/crm/orders/:id`.

**Pontos positivos:** Recursos bem identificados (leads, orders, schedule), uso de IDs, filtros via query string.

### 3.2 Recomendações

- **Paginação:** Para `GET /api/crm/leads` e `GET /api/crm/orders`, definir desde o início `limit` e `offset` (ou `cursor`) para evitar listas muito grandes. Ex.: `GET /api/crm/leads?limit=50&offset=0&stage=...`.
- **Ordenação:** Documentar parâmetro único de sort. Ex.: `sort=-lastInteractionAt` (menos = desc) ou `sort=createdAt`.
- **Resposta de drag-and-drop:** O `PUT /api/crm/leads/:id` com `{ "stage": "qualified" }` deve retornar o **recurso atualizado** (lead completo) para o frontend atualizar a UI sem refetch total; ou retornar 204 e o cliente refaz a lista. Recomendação: **200 + body** para permitir optimistic update e fallback em caso de conflito.
- **Versionamento:** Opcional para v1: prefixar com `/api/v1/crm/...` se houver previsão de mudanças que quebrem contrato. Se não, manter `/api/crm/...` e documentar em OPENAPI/Swagger.

### 3.3 Idempotência e concorrência

- Múltiplos usuários podem mover o mesmo lead ao mesmo tempo. **Recomendação:** 
  - Aceitar `If-Match: <version>` ou `updatedAt` no `PUT` e retornar 409 em caso de conflito; ou
  - Política “last write wins” com retorno do recurso atualizado (mais simples para MVP).
- Webhook WhatsApp: garantir que processamento de mensagens seja **idempotente** por `messageId` (Evolution API) para evitar duplicar mensagens no CRM em retentativas.

---

## 4. Segurança

### 4.1 CRM (leads, orders, schedule)

- O planejamento **não explicita autenticação** para as rotas do CRM. Dados de leads e pedidos são sensíveis (nome, telefone, endereço).
- **Recomendação obrigatória:** Proteger todas as rotas `/api/crm/*` com **autenticação** (ex.: JWT ou sessão). Usar o `auth.guard.ts` já previsto na estrutura do backend. Definir quem acessa o CRM (ex.: apenas usuários “vendedor” ou “admin”).
- **Autorização:** Se houver multi-tenant ou múltiplas equipes no futuro, considerar escopo por “conta” ou “equipe”. Para MVP, um único contexto pode ser suficiente.

### 4.2 Webhook WhatsApp

- O plano cita “validar assinatura”. A ARQUITETURA mostra `Authorization: Bearer EVOLUTION_API_KEY`.
- **Recomendação:** 
  - Validar que o request ao `POST /api/webhooks/whatsapp` venha da Evolution API: uso de **header de assinatura** (se a Evolution enviar) ou **token fixo em header/query** comparado com variável de ambiente. Não confiar apenas em “qualquer POST”.
  - Rate limiting no endpoint de webhook para mitigar abuso (ex.: 100 req/min por IP ou por instância).

### 4.3 Dados sensíveis (PII)

- Lead e Order contêm telefone, nome, endereço. **Recomendação:** Em produção, considerar mascarar telefone/email em logs; não logar corpo completo de mensagens em nível DEBUG em produção. LGPD: documentar base legal e retenção para dados de leads/pedidos.

---

## 5. Performance e escalabilidade

### 5.1 Listagem e filtros

- `GET /api/crm/leads` com vários filtros (stage, source, date range, q) deve usar **índices** no MongoDB. O ARQUITETURA já recomenda: `stage`, `createdAt`, `phone` (unique). Incluir **`lastInteractionAt`** se a ordenação padrão for por “última interação”.
- **Order:** Criar índices: `leadId`, `stage`, `createdAt` (e possivelmente `orderNumber` único).

### 5.2 Histórico (timeline)

- `GET /api/crm/leads/:id/history` pode retornar muitas mensagens. **Recomendação:** Paginar (ex.: `limit=50&before=<messageId>` ou `page=1&limit=50`) para não trazer milhares de mensagens de uma vez.

### 5.3 Frontend – Kanban

- Dois tipos de card (lead vs order) e 12 colunas: uma única lista “flat” de leads + lista de orders, com agrupamento no front por `stage`, é suficiente. Evitar N+1: o backend deve devolver leads (e orders) já filtrados/agrupados por estágio ou o front faz o agrupamento em memória com uma única chamada `GET /api/crm/leads` + `GET /api/crm/orders` (com filtros). Ambas as abordagens são aceitáveis; a segunda reduz chamadas e simplifica cache (ex.: React Query com invalidação após PUT).

### 5.4 Real-time (opcional)

- O plano não exige atualização em tempo real do Kanban quando outro usuário move um card. Se for requisito futuro, considerar **WebSocket ou SSE** para o backend notificar “lead X mudou de stage” e o front atualizar a lista; ou polling leve (ex.: a cada 30 s) na tela do CRM.

---

## 6. Resiliência e operação

### 6.1 Webhook

- Se o processamento do webhook (AGNO + persistência) demorar, a Evolution API pode reenviar. **Recomendação:** 
  - Processar mensagem de forma **assíncrona** (fila Bull/BullMQ): webhook responde 200 rápido após enfileirar; worker processa e chama AGNO + salva no CRM. Assim o webhook não estoura timeout.
  - Idempotência por `messageId` (ou `remoteJid + messageId`) para evitar duplicar mensagens em retries.

### 6.2 Erros e logging

- Padronizar respostas de erro (ex.: `{ "code": "CRM_LEAD_NOT_FOUND", "message": "..." }`) e usar o `http-exception.filter.ts` já previsto. Para o CRM, mapear 404 (lead/order não encontrado), 400 (stage inválido), 409 (conflito de versão, se implementar).
- Logs: correlacionar request (requestId) em todas as camadas para rastrear um drag-and-drop ou um webhook da Evolution até o banco.

### 6.3 Ordem (Order)

- **orderNumber** sequencial: em ambiente com mais de uma instância do backend, usar geração atômica (ex.: collection de counters no MongoDB com findOneAndUpdate) ou UUID + sufixo legível (ex.: #1001-AB12) para evitar colisão.

---

## 7. Modelo de dados – checagem rápida

- **Lead:** Referência a pedidos: preferir array de `orderIds` no Lead (ou virtual via query em Order por leadId). Manter `stage` apenas para estágios de **venda** (1–7); quando um pedido é criado, o lead pode permanecer em `won` e o “progresso” da compra fica no Order.
- **Order:** Campo `stage` redundante com `paymentStatus` + `shippingStatus`? O plano usa `stage` como “fonte da verdade” para a coluna do Kanban; então manter `stage` e manter `paymentStatus`/`shippingStatus` sincronizados ao mudar de coluna (ex.: ao mover para “Pagamento confirmado”, setar `paymentStatus: confirmed` e `paymentConfirmedAt`). Isso evita inconsistência.
- **Activity:** Útil para auditoria (quem moveu o lead, quando). Recomendação: registrar atividade ao mudar `stage` (lead e order) com `userId`, `previousStage`, `newStage`, `createdAt`.

---

## 8. Checklist de decisões antes da implementação

| # | Decisão | Recomendação |
|---|---------|---------------|
| 1 | Rota do webhook WhatsApp | Unificar em `POST /api/webhooks/whatsapp` e atualizar ARQUITETURA. |
| 2 | Autenticação do CRM | Obrigatório: guard em todas as rotas `/api/crm/*`. |
| 3 | Paginação em listagens | Incluir `limit`/`offset` (ou cursor) em `GET /api/crm/leads` e `GET /api/crm/orders`. |
| 4 | Paginação no history | Incluir `limit` (e opcionalmente `before`) em `GET /api/crm/leads/:id/history`. |
| 5 | Webhook assíncrono | Processar mensagem em fila (Bull); webhook só enfileira e responde 200. |
| 6 | Idempotência do webhook | Usar messageId (ou chave composta) para ignorar duplicatas. |
| 7 | Enums de stage | Separar LeadStage e OrderStage no código. |
| 8 | orderNumber | Gerar de forma atômica (counter ou UUID legível) em multi-instância. |
| 9 | Índices Order | Criar em leadId, stage, createdAt (e orderNumber se único). |
| 10 | Activity | Registrar mudança de stage (lead/order) com userId e timestamps. |

---

## 9. Referências cruzadas

- **Visão multi-nicho:** `docs/VISAO_CRM_CEREBRO_OPERACIONAL.md` (CRM cérebro operacional: estrutura base, Kanban, auto-move, pet/salão/academia/e-commerce).
- **Planejamento:** `docs/PLANEJAMENTO_CRM_KANBAN_FUNIL.md`
- **Arquitetura geral:** `ARQUITETURA_PROJETO.md` (Fases 5–6, CRM Kanban, Integração WhatsApp, Banco de Dados)
- **Implementação:** seguir checklists do planejamento e deste documento para segurança, API e resiliência.

---

*Revisão de arquitetura. Implementação a cargo do @dev; ajustes de modelo de dados podem envolver @data-engineer. Para dúvidas sobre esta revisão: *help (Architect).*
