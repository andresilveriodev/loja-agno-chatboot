# Modelagem CRM – SQLite (atual) e mapeamento para MongoDB

**Data:** Fevereiro 2026  
**Responsável:** @data-engineer  
**Uso:** SQLite em dev/MVP; migração futura para MongoDB em cliente real.

---

## 1. Visão geral

O CRM Kanban usa as entidades: **Lead**, **Message**, **Schedule**, **Activity**, **Order**, **OrderItem**.  
No backend NestJS + TypeORM está configurado **SQLite** (better-sqlite3) com `synchronize: true` em não-produção, criando as tabelas automaticamente a partir das entities.

- **SQLite:** `backend/src/entities/*.entity.ts` + `data/loja.db` (ou `DATABASE_PATH`).
- **MongoDB (futuro):** este documento descreve o mapeamento coleção ↔ tabela e índices sugeridos.

---

## 2. Schema SQLite (TypeORM)

### 2.1 Tabelas e relações

| Tabela          | Descrição                          | Relações |
|-----------------|------------------------------------|----------|
| `leads`         | Contatos/leads do funil de vendas  | 1:N messages, schedules, activities, orders |
| `messages`      | Mensagens (chat web + WhatsApp)    | N:1 lead (opcional) |
| `schedules`     | Agendamentos (call, visita, callback) | N:1 lead |
| `activities`    | Timeline/auditoria (mudança de estágio, nota) | N:1 lead |
| `orders`        | Pedidos (funil de compra)           | N:1 lead, 1:N order_items |
| `order_items`   | Itens do pedido                    | N:1 order |
| `order_counters`| Contador para orderNumber atômico  | — |

### 2.2 Enums / valores (campos texto)

- **Lead.stage:** `new_lead` | `qualified` | `products_shown` | `quotation` | `negotiation` | `won` | `lost`
- **Order.stage:** `payment_pending` | `payment_confirmed` | `preparing` | `shipped` | `delivered`
- **Lead.source / Message.source:** `web` | `whatsapp`
- **Message.sender:** `user` | `bot` | `agent`
- **Schedule.type:** `call` | `visit` | `callback`
- **Schedule.status:** `pending` | `completed` | `cancelled`

### 2.3 Índices (criados pelas entities)

- **leads:** `phone` (unique), `stage`, `createdAt`, `lastInteractionAt`, `source`
- **messages:** `leadId`, `sessionId`, `source`, `createdAt`
- **schedules:** `leadId`, `scheduledAt`
- **activities:** `leadId`, `createdAt`
- **orders:** `leadId`, `stage`, `createdAt`, `orderNumber` (unique)

### 2.4 orderNumber (sequencial)

- Tabela `order_counters`: uma linha (`id = 'default'`, `nextNumber`).
- Ao criar pedido: em **transação**, ler `nextNumber`, incrementar, usar como `orderNumber` do novo Order e inserir linha em `order_counters` se não existir (ex.: 1000 + nextNumber para exibir #1001, #1002).

---

## 3. Mapeamento para MongoDB (quando migrar)

### 3.1 Coleções ↔ Tabelas

| SQLite (tabela) | MongoDB (coleção) | Observação |
|------------------|-------------------|------------|
| leads            | leads             | _id: ObjectId ou UUID string |
| messages         | messages          | leadId como ObjectId ou string |
| schedules        | schedules         | leadId referência |
| activities       | activities        | leadId referência |
| orders           | orders            | leadId referência; items como subdocumento ou collection order_items |
| order_items      | (embed em orders) ou order_items | Recomendado embed em `orders.items[]` no MongoDB |
| order_counters   | counters          | Documento `{ _id: 'orderNumber', value: Number }` |

### 3.2 Formato sugerido no MongoDB

**leads** (um documento = um lead):

```json
{
  "_id": ObjectId,
  "name": "String",
  "phone": "String",
  "company": "String",
  "email": "String",
  "intent": "String",
  "productsOfInterest": ["String"],
  "estimatedValue": Number,
  "stage": "new_lead",
  "source": "web",
  "notes": "String",
  "createdAt": Date,
  "updatedAt": Date,
  "lastInteractionAt": Date
}
```

**messages** (referência por leadId):

```json
{
  "_id": ObjectId,
  "leadId": ObjectId,
  "sessionId": "String",
  "sender": "user",
  "content": "String",
  "type": "text",
  "source": "whatsapp",
  "metadata": {},
  "createdAt": Date
}
```

**orders** (com items embutidos):

```json
{
  "_id": ObjectId,
  "leadId": ObjectId,
  "orderNumber": 1001,
  "items": [
    { "productId": "String", "name": "String", "quantity": Number, "unitPrice": Number, "total": Number }
  ],
  "subtotal": Number,
  "discount": Number,
  "total": Number,
  "paymentMethod": "pix",
  "paymentStatus": "pending",
  "paymentConfirmedAt": Date,
  "shippingAddress": { "street": "", "number": "", "city": "", "state": "", "zipCode": "" },
  "shippingStatus": "pending",
  "shippedAt": Date,
  "trackingCode": "String",
  "deliveredAt": Date,
  "stage": "payment_pending",
  "createdAt": Date,
  "updatedAt": Date
}
```

### 3.3 Índices recomendados (MongoDB)

```javascript
// leads
db.leads.createIndex({ "phone": 1 }, { unique: true });
db.leads.createIndex({ "stage": 1 });
db.leads.createIndex({ "createdAt": -1 });
db.leads.createIndex({ "lastInteractionAt": -1 });
db.leads.createIndex({ "source": 1 });

// messages
db.messages.createIndex({ "leadId": 1, "createdAt": -1 });
db.messages.createIndex({ "sessionId": 1 });

// schedules
db.schedules.createIndex({ "leadId": 1 });
db.schedules.createIndex({ "scheduledAt": 1 });

// activities
db.activities.createIndex({ "leadId": 1, "createdAt": -1 });

// orders
db.orders.createIndex({ "leadId": 1 });
db.orders.createIndex({ "stage": 1 });
db.orders.createIndex({ "createdAt": -1 });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });
```

---

## 4. Arquivos da modelagem (SQLite)

| Arquivo | Conteúdo |
|---------|----------|
| `backend/src/entities/enums.ts` | LeadStage, OrderStage, tipos (LeadSource, ScheduleType, etc.) |
| `backend/src/entities/lead.entity.ts` | Lead |
| `backend/src/entities/message.entity.ts` | Message (leadId opcional, source) |
| `backend/src/entities/schedule.entity.ts` | Schedule |
| `backend/src/entities/activity.entity.ts` | Activity |
| `backend/src/entities/order.entity.ts` | Order |
| `backend/src/entities/order-item.entity.ts` | OrderItem |
| `backend/src/entities/order-counter.entity.ts` | OrderCounter (orderNumber) |
| `backend/src/app.module.ts` | Registro de todas as entities no TypeORM |

---

## 5. Próximos passos (implementação)

1. **Módulo CRM:** criar `modules/crm/` com LeadsService, SchedulesService, OrdersService usando as entities.
2. **orderNumber:** ao criar Order, usar repositório de OrderCounter em transação para obter e incrementar `nextNumber` (ex.: exibir como #1001).
3. **Activity:** ao mudar `stage` de Lead ou Order, registrar Activity com type `stage_change` e metadata `{ previousStage, newStage, userId }`.
4. **Migração para MongoDB:** quando for trocar, criar schemas Mongoose (ou driver nativo) espelhando este documento e script de migração de dados SQLite → MongoDB.

---

*Modelagem feita para funcionar com SQLite; migração para MongoDB pode reutilizar os mesmos enums e nomes de campos.*
