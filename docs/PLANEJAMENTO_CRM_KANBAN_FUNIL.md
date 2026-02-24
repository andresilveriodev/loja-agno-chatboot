# Planejamento: CRM Kanban com Funil de Vendas + WhatsApp

**Projeto:** Loja Multidepartamental com Agente IA  
**Foco:** CRM com Kanban, funil de vendas, integração WhatsApp → CRM, conversas no CRM, agendamento e filtros  
**Referência:** Alinhado ao `ARQUITETURA_PROJETO.md` e fluxo AIOS

---

## 1. Objetivo do planejamento

Criar um **CRM em formato Kanban** onde:

1. **WhatsApp + IA** → quando a pessoa manda mensagem no WhatsApp da IA, os dados vão para o CRM:
   - Conversas (mensagens) sincronizadas
   - Dados do lead (nome, telefone e outras informações conforme a interação)
2. No CRM é possível **arrastar o lead** pelas etapas do **processo de venda** (funil).
3. Existe **agendamento** (call, visita, retorno).
4. Existem **filtros** (por estágio, data, origem, etc.).

Este documento detalha o **planejamento** (escopo, fluxos, dados, tarefas) para implementar isso.

---

## 2. Visão geral do fluxo

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ENTRADA                                                                 │
│  Pessoa manda mensagem no WhatsApp da IA                                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND (Webhook + AGNO)                                                 │
│  • Recebe mensagem (Evolution API webhook)                                │
│  • Processa com IA (AGNO)                                                │
│  • Busca ou cria LEAD (nome, telefone, etc. conforme interação)          │
│  • Salva MENSAGEM na conversa do lead                                    │
│  • Responde no WhatsApp                                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CRM (Frontend)                                                          │
│  • Kanban com colunas = estágios do funil                                │
│  • Cards = leads (arrastar entre colunas = mudar estágio)                 │
│  • Detalhe do lead: conversas (timeline) + dados do lead + agendamentos  │
│  • Filtros: estágio, data, origem, intenção, etc.                        │
│  • Agendamento: criar/editar eventos (call, visita, callback)             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Escopo detalhado

### 3.1 WhatsApp → CRM (conversas + lead)

| Item | Descrição |
|------|-----------|
| **Quando** | Toda mensagem recebida/enviada no WhatsApp (via webhook Evolution API) |
| **O que vai pro CRM** | (1) **Conversas:** cada mensagem salva e vinculada ao lead. (2) **Lead:** criado ou atualizado com nome, telefone e demais dados extraídos na interação (ex.: empresa, email, intenção, produtos de interesse, valor estimado). |
| **Origem dos dados do lead** | Nome/telefone do contato WhatsApp; nome, empresa, email, intenção e produtos de interesse conforme a IA identifica na conversa (AGNO + ferramentas de CRM). |
| **Sincronização** | Mensagens com `source: "whatsapp"` e `leadId`; timeline no CRM exibe web + WhatsApp em ordem cronológica. |

**Fluxo técnico resumido:**

1. `POST /api/webhooks/whatsapp` recebe evento da Evolution API.
2. Extrair `remoteJid` (telefone) e corpo da mensagem.
3. `Lead.findOrCreate({ phone, source: 'whatsapp' })` — criar lead se não existir.
4. Salvar mensagem: `Message.create({ leadId, sender: 'user', content, source: 'whatsapp' })`.
5. Chamar AGNO com contexto do lead; IA pode atualizar lead (nome, empresa, intent, produtos, valor estimado) via tools.
6. Resposta da IA → enviar no WhatsApp e salvar como nova mensagem (`sender: 'bot'`).
7. Atualizar `lead.lastInteractionAt` e, se aplicável, campos do lead preenchidos pela IA.

### 3.2 Funil de vendas (Kanban) – arrastar no processo

| Item | Descrição |
|------|-----------|
| **Estágios (colunas)** | 1) Novo Lead | 2) Qualificado | 3) Produtos Apresentados | 4) Cotação | 5) Negociação | 6) Fechado (Ganho) | 7) Perdido |
| **Interação** | Arrastar card de lead de uma coluna para outra = atualizar `stage` do lead no backend (ex.: `PUT /api/crm/leads/:id` com `stage`). |
| **Card no Kanban** | Exibir: nome, telefone, empresa (se houver), valor estimado, última interação, produtos de interesse (resumo). Ações: abrir detalhes, WhatsApp, agendar. |
| **Detalhe do lead** | Timeline de conversas (web + WhatsApp), dados do lead, agendamentos, notas, histórico de mudanças de estágio. |

### 3.3 Agendamento

| Item | Descrição |
|------|-----------|
| **Tipos** | Call, Visita técnica, Callback (retorno). |
| **Dados** | leadId, tipo, data/hora, título, descrição, status (pendente, realizado, cancelado). |
| **Onde** | No modal/detalhe do lead: listar agendamentos, criar, editar, marcar como realizado/cancelado. Opcional: vista calendário no CRM. |
| **Lembretes** | Notificação ou badge no CRM para agendamentos do dia (implementação pode ser fase 2). |

### 3.4 Filtros no CRM

| Filtro | Descrição |
|--------|-----------|
| **Por estágio** | Um ou vários estágios do funil (ex.: só Qualificado + Cotação). |
| **Por data** | Criação do lead ou última interação (ex.: últimos 7 dias, este mês). |
| **Por origem** | Web, WhatsApp ou ambos. |
| **Por intenção** | Valores de intent retornados pela IA (ex.: “compra imediata”, “dúvida técnica”). |
| **Busca** | Por nome ou telefone (e opcionalmente empresa). |

Os filtros devem ser aplicados na listagem que alimenta o Kanban (ex.: `GET /api/crm/leads?stage=...&source=...&from=...&to=...&q=...`).

### 3.5 Fluxo de compra (e-commerce): Pagamento e entrega

Quando o lead vira **venda fechada**, o CRM deve permitir acompanhar a **compra** até a entrega, no estilo e-commerce:

| Etapa (após "Fechado") | Descrição |
|------------------------|-----------|
| **Pagamento pendente** | Cliente aceitou proposta; aguardando pagamento (PIX, boleto, cartão, etc.). |
| **Pagamento confirmado** | Pagamento recebido/confirmado. |
| **Em preparação** | Pedido sendo separado/embalado. |
| **Enviado / Em entrega** | Pedido enviado (rastreio opcional). |
| **Entregue** | Compra concluída; entrega confirmada. |

No Kanban isso pode ser tratado de duas formas (escolher uma):

- **Opção A – Colunas extras no mesmo board:** estender o funil com colunas: … Fechado (Ganho) → Pagamento pendente → Pagamento confirmado → Em preparação → Enviado → Entregue (+ Perdido).
- **Opção B – Dois boards:** (1) Funil de vendas (até Fechado/Perdido); (2) Funil de pedidos (Pagamento pendente → … → Entregue), onde cada card é um **pedido** vinculado a um lead.

Recomendação: **Opção A** para simplicidade — mesmo Kanban com mais colunas; o card pode exibir “lead” ou “pedido” conforme o estágio (a partir de “Fechado” mostrar número do pedido e valor).

**Dados necessários para compra/entrega:** pedido (número, leadId, itens, valor total), forma de pagamento, status do pagamento, endereço de entrega, previsão/data de entrega, código de rastreio (se houver). Ver seção 4 (modelo de dados) para entidades Order/Payment/Delivery.

---

## 4. Modelo de dados (resumo)

- **Lead:** `_id`, `name`, `phone`, `company`, `email`, `intent`, `productsViewed` / `productsOfInterest`, `estimatedValue`, `stage`, `source` (web | whatsapp), `notes`, `createdAt`, `updatedAt`, `lastInteractionAt`. Referências a mensagens, agendamentos e pedidos (IDs).
- **Message:** `_id`, `leadId`, `sender` (user | bot | agent), `content`, `type`, `source` (web | whatsapp), `createdAt`.
- **Schedule:** `_id`, `leadId`, `type` (call | visit | callback), `scheduledAt`, `title`, `description`, `status` (pending | completed | cancelled), `createdAt`.
- **Activity (opcional):** para auditoria de mudanças de estágio e notas; usada na timeline do lead.

**Fluxo de compra (e-commerce):**

- **Order (Pedido):** `_id`, `leadId`, `orderNumber` (ex.: #1001), `items` (productId, name, qty, unitPrice, total), `subtotal`, `discount`, `total`, `paymentMethod` (pix | boleto | card | transfer), `paymentStatus` (pending | confirmed | failed | refunded), `paymentConfirmedAt`, `shippingAddress` (street, number, complement, neighborhood, city, state, zipCode), `shippingStatus` (pending | preparing | shipped | delivered), `shippedAt`, `trackingCode`, `deliveredAt`, `stage` (payment_pending | payment_confirmed | preparing | shipped | delivered), `createdAt`, `updatedAt`.
- **Payment (opcional, se quiser histórico de tentativas):** `_id`, `orderId`, `method`, `status`, `amount`, `reference` (PIX/boleto ID), `confirmedAt`, `createdAt`.

Detalhes completos dos schemas estão em `ARQUITETURA_PROJETO.md` (Banco de Dados).

---

## 4.1 Tela do Kanban – Detalhamento (UI/UX)

### 4.1.1 Layout geral da página

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER CRM                                                                              │
│  [Logo]  CRM - Funil de Vendas    [Busca global]           [Notificações] [Usuário]     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  BARRA DE FILTROS (colapsável)                                                          │
│  Estágio: [Multi-select ▼]  Origem: [Todos ▼]  Data: [Últimos 7 dias ▼]  Intenção: [▼] │
│  Busca: [Nome ou telefone...]  [Aplicar] [Limpar]  [Expandir/Recolher filtros]           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  KANBAN (scroll horizontal)                                                             │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬─────────┐ │
│  │ Novo Lead    │ Qualificado  │ Produtos     │ Cotação      │ Negociação   │ Fechado │ │
│  │ (3)          │ (2)          │ Apresent.   │ (4)          │ (2)          │ (1)     │ │
│  ├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼─────────┤ │
│  │ [Card 1]     │ [Card]       │ [Card]       │ [Card]       │ [Card]       │ [Card]  │ │
│  │ [Card 2]     │ [Card]       │              │ [Card]       │ [Card]       │         │ │
│  │ [Card 3]     │              │              │ [Card]       │              │         │ │
│  │              │              │              │ [Card]       │              │         │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴─────────┘ │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐           │
│  │ Perdido (2)  │ Pag. pendente│ Pag. confirm.│ Em preparação│ Enviado      │ Entregue│ │
│  │ [Card] [Card]│ [Card]       │ [Card]       │ [Card]       │ [Card]       │ [Card]  │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴─────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Header:** título “CRM - Funil de Vendas”, busca global (nome/telefone), ícone de notificações (novas mensagens, agendamentos do dia), menu do usuário.
- **Barra de filtros:** sempre visível na primeira dobra; opção de expandir/recolher para mais critérios (ex.: valor estimado, produto de interesse).
- **Kanban:** scroll horizontal; cada coluna = um estágio; contador de cards no título da coluna; colunas de “venda” (Novo Lead … Fechado, Perdido) e, em sequência, colunas de “compra” (Pagamento pendente … Entregue).

### 4.1.2 Colunas do Kanban (estágios)

| Ordem | Código (stage) | Nome exibido | Cor sugerida (ex.) |
|-------|----------------|--------------|--------------------|
| 1 | `new_lead` | Novo Lead | Cinza |
| 2 | `qualified` | Qualificado | Azul claro |
| 3 | `products_shown` | Produtos Apresentados | Azul |
| 4 | `quotation` | Cotação | Amarelo |
| 5 | `negotiation` | Negociação | Laranja |
| 6 | `won` | Fechado (Ganho) | Verde |
| 7 | `lost` | Perdido | Vermelho suave |
| 8 | `payment_pending` | Pagamento pendente | Âmbar |
| 9 | `payment_confirmed` | Pagamento confirmado | Verde claro |
| 10 | `preparing` | Em preparação | Roxo claro |
| 11 | `shipped` | Enviado | Índigo |
| 12 | `delivered` | Entregue | Verde |

- Ao arrastar para **Fechado (Ganho)**, o sistema pode perguntar se deseja **“Abrir pedido / Registrar compra”** (ver 4.1.5).
- Coluna **Perdido:** opcionalmente exibir motivo (tooltip ou campo no card).

### 4.1.3 Card do lead / pedido (conteúdo e ações)

**Quando o card é de LEAD (estágios 1–7):**

- **Linha 1:** Nome do lead (negrito).
- **Linha 2:** Telefone (clicável para WhatsApp); empresa (se houver).
- **Linha 3:** Valor estimado (ex.: “R$ 5.000”); última interação (ex.: “há 2 min”, “ontem”).
- **Linha 4 (resumo):** Produtos de interesse (até 2 nomes + “+N” se houver mais); ou intenção (tag).
- **Ações no card (ícones ou menu ⋮):**
  - **Ver detalhes** – abre modal/página de detalhe (timeline, dados, agendamentos, notas).
  - **WhatsApp** – abre conversa no WhatsApp com o telefone do lead.
  - **Agendar** – abre modal rápido de agendamento (tipo, data/hora, título).
  - **Registrar compra** – só visível a partir de “Cotação” ou “Negociação”; abre fluxo de criação de pedido (ver 4.1.5).

**Quando o card é de PEDIDO (estágios 8–12):**

- **Linha 1:** Nº do pedido (ex.: #1001) + nome do cliente.
- **Linha 2:** Valor total (ex.: “R$ 12.340”); data do pedido.
- **Linha 3:** Status de pagamento (ex.: “Pago”, “Pendente PIX”); status de entrega (ex.: “Enviado – rastreio: BR123…”).
- **Ações:** Ver detalhes do pedido (itens, endereço, pagamento, entrega), WhatsApp (do lead), Editar status (pagamento/entrega).

- **Estados do card:** hover (destaque sutil); arrastando (sombra + opacidade); “carregando” após soltar (skeleton ou spinner até o `PUT` retornar).

### 4.1.4 Modal / página de detalhe do lead

- **Abas ou seções:** (1) Resumo + dados do lead editáveis, (2) Timeline (conversas web + WhatsApp), (3) Agendamentos, (4) Pedidos (se houver), (5) Notas.
- **Resumo:** Nome, telefone, empresa, email, intenção, valor estimado, estágio atual, origem, datas.
- **Timeline:** Lista cronológica reversa de mensagens (avatar, remetente, conteúdo, data/hora, origem web/WhatsApp); possível agrupar por dia.
- **Agendamentos:** Lista com tipo, data/hora, título, status; botão “Novo agendamento”; editar/concluir/cancelar.
- **Pedidos:** Lista de pedidos do lead com número, valor, estágio; botão “Novo pedido” (registrar compra); ao clicar em um pedido, abrir detalhe do pedido (itens, pagamento, entrega).

### 4.1.5 Registrar compra (fluxo tipo e-commerce)

- **Gatilho:** Botão “Registrar compra” no card (a partir de Cotação/Negociação) ou no detalhe do lead; ou ao arrastar para “Fechado (Ganho)” com confirmação “Criar pedido?”.
- **Passo 1 – Itens:** Selecionar produtos (busca ou lista), quantidade, preço unitário; resumo do subtotal; opcional desconto.
- **Passo 2 – Pagamento:** Forma (PIX, boleto, cartão, transferência); valor total; status inicial “Pendente” ou “Confirmado” (se já recebeu).
- **Passo 3 – Entrega:** Endereço de entrega (campos completos); previsão de entrega (opcional); após salvar, pedido aparece na coluna “Pagamento pendente” ou “Pagamento confirmado”, conforme o status escolhido.
- **Após criar:** Card do **pedido** aparece no Kanban nas colunas de compra; o lead continua no funil (pode permanecer em “Fechado” ou ter um link “Pedido #1001” no card do lead). Arrastar o card do pedido entre “Pagamento pendente” → “Pagamento confirmado” → “Em preparação” → “Enviado” → “Entregue” atualiza `Order.stage` e campos como `paymentStatus`, `shippingStatus`, `trackingCode`, `deliveredAt`.

### 4.1.6 Detalhe do pedido (modal ou página)

- **Cabeçalho:** Nº pedido, lead/cliente, data, estágio atual.
- **Itens:** Tabela (produto, qtd, preço un., total).
- **Totais:** Subtotal, desconto, total.
- **Pagamento:** Método, status, data confirmação (se houver), referência (ex.: ID PIX).
- **Entrega:** Endereço completo; status; data envio; código de rastreio (editável); data entrega (ou botão “Marcar como entregue”).
- **Ações:** Editar status de pagamento, editar status de entrega / rastreio, “Marcar como entregue”.

### 4.1.7 Filtros na barra (detalhamento)

- **Estágio:** Multiselect com todos os estágios (lead + pedido); ao selecionar vários, exibir apenas as colunas escolhidas (ou exibir todas e destacar só os cards que batem com o filtro).
- **Origem:** Todos | Web | WhatsApp.
- **Data:** Últimos 7 dias, Últimos 30 dias, Este mês, Personalizado (date range).
- **Intenção:** Lista dinâmica a partir dos valores de `intent` dos leads.
- **Busca:** Placeholder “Nome ou telefone”; busca em tempo real ou ao “Aplicar”; debounce 300 ms.
- **Botões:** Aplicar (refaz `GET /api/crm/leads` e opcionalmente `GET /api/crm/orders` com query params), Limpar (volta aos valores padrão).

### 4.1.8 Empty states e loading

- **Coluna vazia:** Texto “Nenhum lead aqui” / “Nenhum pedido aqui” + ícone; manter área arrastável para dropar cards.
- **Nenhum resultado após filtros:** Mensagem “Nenhum lead encontrado. Ajuste os filtros ou limpe a busca.”
- **Loading:** Colunas com skeleton nos cards ou spinner no centro do board até a primeira carga; ao arrastar e soltar, só o card movido mostra loading até a API responder.

---

## 5. APIs necessárias (checklist)

**Leads e CRM**
- [ ] `GET /api/crm/leads` – Listar leads com filtros (stage, source, datas, intent, busca por nome/telefone) e ordenação.
- [ ] `GET /api/crm/leads/:id` – Detalhe do lead (dados + mensagens + agendamentos + pedidos).
- [ ] `PUT /api/crm/leads/:id` – Atualizar lead (em especial `stage` para o drag-and-drop).
- [ ] `POST /api/crm/leads` – Criar lead manualmente (opcional; a maioria virá da IA/WhatsApp).
- [ ] `POST /api/crm/schedule` – Criar agendamento (leadId, type, scheduledAt, title, description).
- [ ] `PUT /api/crm/schedule/:id` – Atualizar/cancelar agendamento.
- [ ] `GET /api/crm/leads/:id/history` – Histórico/timeline (mensagens + atividades) para o modal do lead.
- [ ] Webhook WhatsApp: `POST /api/webhooks/whatsapp` – Receber eventos Evolution API; criar/atualizar lead e mensagens; chamar AGNO e responder.

**Pedidos (compra / pagamento / entrega)**
- [ ] `GET /api/crm/orders` – Listar pedidos com filtros (stage, leadId, datas) para alimentar colunas do Kanban de compra.
- [ ] `GET /api/crm/orders/:id` – Detalhe do pedido (itens, pagamento, entrega, lead).
- [ ] `POST /api/crm/orders` – Criar pedido (leadId, itens, totais, forma de pagamento, endereço; stage inicial ex.: payment_pending).
- [ ] `PUT /api/crm/orders/:id` – Atualizar pedido (stage, paymentStatus, paymentConfirmedAt, shippingStatus, trackingCode, deliveredAt).

---

## 6. Frontend – CRM (checklist)

- [ ] **Kanban**
  - Componente principal (ex.: `KanbanBoard.tsx`) com colunas de vendas (7 estágios) + colunas de compra (5 estágios: pagamento pendente → entregue).
  - Cards arrastáveis (React Beautiful DnD ou @dnd-kit): ao soltar lead → `PUT /api/crm/leads/:id` (stage); ao soltar pedido → `PUT /api/crm/orders/:id` (stage).
  - Contador por coluna; empty state por coluna; loading no card ao mover.
- [ ] **Lead card**
  - Nome, telefone, empresa, valor estimado, última interação, resumo de produtos; ações: Ver detalhes, WhatsApp, Agendar, Registrar compra (a partir de Cotação/Negociação).
- [ ] **Order card (colunas de compra)**
  - Nº pedido, cliente, valor total, status pagamento/entrega; ações: Ver detalhes do pedido, WhatsApp.
- [ ] **Modal / página de detalhe do lead**
  - Dados do lead editáveis; timeline de conversas (web + WhatsApp); agendamentos (criar/editar/cancelar); lista de pedidos do lead; notas.
- [ ] **Registrar compra (fluxo e-commerce)**
  - Wizard ou formulário: (1) Itens (produtos, qtd, preço), (2) Pagamento (forma, status), (3) Entrega (endereço, previsão). `POST /api/crm/orders`.
- [ ] **Modal / página de detalhe do pedido**
  - Itens, totais, pagamento (método, status, data confirmação), entrega (endereço, status, rastreio, “Marcar como entregue”); edição de stage/status.
- [ ] **Filtros**
  - Barra: estágio (multiselect, incluindo estágios de pedido), origem, datas, intenção, busca; aplicar em `GET /api/crm/leads` e `GET /api/crm/orders` conforme contexto.
- [ ] **Agendamento**
  - Formulário (tipo, data/hora, título, descrição) no contexto do lead; listagem no detalhe do lead.

---

## 7. Backend – tarefas (checklist)

- [ ] **Leads**
  - Model/schema Lead com todos os campos (incl. stage, source, intent); referência a pedidos (array de orderId ou virtual).
  - FindOrCreate por telefone (e source) no webhook WhatsApp.
- [ ] **Mensagens**
  - Salvar toda mensagem (entrada/saída) com `leadId`, `sender`, `source`, `content`, `createdAt`.
- [ ] **AGNO**
  - Ferramentas para: criar/atualizar lead (nome, empresa, email, intent, produtos de interesse, valor estimado); opcionalmente registrar atividade.
  - Após resposta da IA, persistir mensagem da IA e atualizar `lastInteractionAt` do lead.
- [ ] **CRM**
  - Endpoints de leads (list/detail/update), schedule (create/update), history.
  - Filtros e ordenação em `GET /api/crm/leads`.
- [ ] **Pedidos (Order)**
  - Model/schema Order (itens, totais, paymentMethod, paymentStatus, shippingAddress, shippingStatus, trackingCode, stage).
  - Endpoints: GET list (com filtros), GET by id, POST create, PUT update (stage e campos de pagamento/entrega).
  - Geração de orderNumber (sequencial ou baseado em data).
- [ ] **Webhook WhatsApp**
  - Validação, extração de telefone e mensagem, findOrCreate lead, salvar mensagem, chamar AGNO, enviar resposta via Evolution API, salvar resposta e atualizar lead.

---

## 8. Ordem sugerida de implementação

1. **Backend: Lead + Message + Schedule** – Schemas e CRUD básico; FindOrCreate por telefone.
2. **Backend: API CRM** – `GET/PUT /api/crm/leads`, `GET /api/crm/leads/:id`, `GET /api/crm/leads/:id/history`, `POST/PUT /api/crm/schedule`.
3. **Frontend: Kanban** – Board, colunas, cards e drag-and-drop atualizando `stage`.
4. **Frontend: Filtros** – Barra de filtros e integração com `GET /api/crm/leads`.
5. **Frontend: Detalhe do lead** – Timeline de conversas + agendamentos + formulário de agendamento.
6. **Backend: Webhook WhatsApp** – Receber mensagens, lead + mensagens, chamar AGNO, responder e persistir.
7. **AGNO: Tools de CRM** – Atualizar lead com dados extraídos da conversa (nome, empresa, intent, produtos, valor).
8. **Backend: Order (pedido)** – Schema Order, endpoints CRUD e filtros; geração de orderNumber.
9. **Frontend: Registrar compra** – Fluxo em etapas (itens → pagamento → entrega); cards de pedido no Kanban; detalhe do pedido com edição de status e entrega.
10. **Refino** – Notificações de nova mensagem no CRM, lembrete de agendamentos, testes e ajustes.

---

## 9. Critérios de aceite (resumo)

- Quando alguém manda mensagem no WhatsApp da IA, um lead é criado ou atualizado no CRM e as conversas aparecem no CRM (timeline).
- Dados do lead (nome, telefone e outros) são preenchidos conforme a interação (IA + tools).
- No CRM, o usuário pode arrastar o lead entre as colunas do funil e o estágio é salvo.
- No CRM, é possível criar/ver/editar agendamentos (call, visita, callback) por lead.
- No CRM, há filtros por estágio, data, origem, intenção e busca por nome/telefone.
- **Compra (e-commerce):** é possível registrar uma compra a partir do lead (itens, pagamento, endereço de entrega); o pedido aparece no Kanban nas colunas Pagamento pendente → Pagamento confirmado → Em preparação → Enviado → Entregue; o usuário pode arrastar o pedido entre essas colunas e editar status de pagamento/entrega (incl. rastreio e “Marcar como entregue”).

---

## 10. Referências no projeto

- **Refinamento UX (tela, fluxos, acessibilidade):** `docs/UX_REFINO_CRM_KANBAN.md`
- **Visão completa (multi-nicho):** `docs/VISAO_CRM_CEREBRO_OPERACIONAL.md` — CRM como “cérebro operacional” para pet shop, salão, academia, e-commerce e genérico (estrutura base, auto-move, follow-up, módulos por nicho).
- **Revisão de arquitetura:** `docs/REVISAO_ARQUITETURA_CRM_KANBAN.md` (decisões de API, segurança, performance).
- **Arquitetura e fases:** `ARQUITETURA_PROJETO.md` (Fase 5 – CRM Kanban, Fase 6 – WhatsApp, seções CRM Kanban e Integração WhatsApp).
- **Schemas de banco:** `ARQUITETURA_PROJETO.md` – Banco de Dados (Leads, Messages, Schedules, Activities).
- **Evolution API / WhatsApp:** `docs/CONFIGURAR_WEBHOOK_EVOLUTION.md`, `docs/GUIA_INTEGRACAO_AGNO Wahtsapp Service.md`, `docs/INTEGRACAO_EVOLUTION Wahtsapp Service.md`.
- **AGNO:** `docs/EXEMPLOS_PRATICOS_AGNO.md`, `docs/DOCUMENTACAO_STORAGE_MEMORIA_RAG_AGNO.md`.

---

*Documento de planejamento. Para implementação, seguir os checklists acima e as tarefas detalhadas nas Fases 5 e 6 do `ARQUITETURA_PROJETO.md` e no `PLANO_DESENVOLVIMENTO.md` (se existir).*
