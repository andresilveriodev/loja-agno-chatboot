# Visão de Arquitetura – CRM “Cérebro Operacional” (Multi-nicho)

**Autor:** Architect (Aria) | AIOS  
**Baseado em:** especificação completa do CRM Kanban para pet shop, salão/estética, academia/studio e e-commerce, extensível a outros negócios.  
**Relacionado:** `PLANEJAMENTO_CRM_KANBAN_FUNIL.md`, `REVISAO_ARQUITETURA_CRM_KANBAN.md`, `ARQUITETURA_PROJETO.md`

---

## 1. Posicionamento do CRM

O CRM com Kanban é o **“cérebro operacional”** do atendimento:

- A **IA conversa no WhatsApp** (e outros canais), captura dados (nome, telefone, necessidade, datas, serviços, produtos).
- O **CRM organiza tudo em cartão**: histórico completo, próximos passos, agendamentos/pedidos, tarefas e **automações**.
- O lead é **movido no funil conforme a conversa avança** (regras de auto-move) e por ações humanas (drag-and-drop, “Assumir conversa”).

Funciona para **pet shop**, **salão/estética**, **academia/studio**, **e-commerce** e pode ser **genérico** para outros negócios: a estrutura base é comum; módulos e funis variam por nicho.

---

## 2. Estrutura base (todos os nichos)

### 2.1 Cadastro único (Pessoa/Empresa) + identificação automática

| Campo / conceito | Descrição |
|------------------|-----------|
| **Contact (Lead/Cliente)** | Nome, WhatsApp (principal), e-mail, CPF/CNPJ (opcional), cidade, **tags** (ex.: “banho e tosa”, “corte feminino”, “plano anual”, “carrinho abandonado”). |
| **Origem** | WhatsApp, Instagram, site, indicação, anúncios. |
| **Preferências e observações** | Horários, restrições, estilo, budget, notas internas. |
| **Consentimento LGPD** | Opt-in com registro de **quando/como** foi coletado (finalidade, canal, timestamp). |

**Deduplicação:** por telefone (e opcionalmente e-mail). FindOrCreate no webhook e na criação manual.

### 2.2 Inbox + Histórico completo (“dossiê” do relacionamento)

| Elemento | Descrição |
|----------|-----------|
| **Timeline** | Mensagens WhatsApp (e outros canais), áudios/transcrições (se houver), notas internas, arquivos, chamadas, eventos (agendamento criado, etapa alterada, pagamento). |
| **Resumo automático pela IA** | “Quem é”, “O que quer”, “Objeções”, “Próximo passo” (gerado/atualizado a partir da conversa). |
| **Campos extraídos da conversa** | Entidades preenchidas pela IA: nome, serviço/produto, data desejada, endereço, pet, plano, etc. |

### 2.3 Agenda / Compromissos / Reservas

- Agenda por **profissional / sala / recurso** (cadeira, sala de estética, veterinário, tosa, aula experimental, avaliação).
- **Confirmação e lembretes** por WhatsApp (comum em salão e estética).
- Integração ao **cartão** do Kanban: ver agendamentos do contato no card e na timeline.

### 2.4 Funil de vendas em Kanban (pipeline)

- **Cartão (Deal/Card):** valor estimado, probabilidade, etapa atual, responsável, SLA (prazo do próximo contato), checklist, anexos.
- **Múltiplos funis** possíveis: um para “Agendamentos”, outro para “Vendas”, outro para “Pós-venda/Retenção” (configurável por nicho ou conta).

### 2.5 Tarefas e follow-up automático

- Exemplos: “Responder em até X min”, “Pedir foto/referência”, “Confirmar presença”, “Enviar link de pagamento”.
- **Escalonamento:** não respondeu em 2h → lembrete; 24h → “última tentativa”; 72h → arquivar ou reativar depois.
- Tarefas vinculadas ao **cartão** e exibidas no card (próximo passo, data/hora).

### 2.6 Financeiro (mínimo) e pagamentos

- Links de pagamento, status (pendente/pago/estornado), parcelamento/assinatura.
- Por nicho: **academia** → cobrança recorrente, inadimplência, previsão de inativação; **e-commerce** → pagamento por pedido; **salão** → comanda/pacotes.

### 2.7 Relatórios e painel

- Conversão por etapa, tempo médio no funil, taxa de no-show, ticket médio, recompra/retorno.
- **Motivos de perda** (preço, horário, indecisão, concorrente) para análise.

### 2.8 Permissões e operação

- **Perfis:** admin, atendente, vendedor, gerente, financeiro.
- **Log de auditoria:** quem alterou etapa, valor, agendamento, responsável.

---

## 3. Integração WhatsApp + IA (coração do fluxo)

### 3.1 Conectores

- WhatsApp Business API / provedor (Evolution API, Twilio, etc.).
- Webhooks: mensagens (entrada/saída), eventos (entregue/lido), mídia.

### 3.2 Preenchimento automático do CRM via IA

Quando o cliente fala, a IA:

1. **Identifica intenção** (agendar, orçamento, comprar, suporte, status do pedido).
2. **Extrai entidades** (nome, data, serviço, produto, pet, plano).
3. **Cria/atualiza contato** (Contact).
4. **Cria/atualiza cartão no Kanban** e **move de etapa** (regras de auto-move).
5. **Cria tarefa de follow-up** se necessário (ex.: “Confirmar agendamento em 1 dia”).

### 3.3 Regras de movimento do Kanban (auto-move)

Exemplos genéricos (configuráveis por nicho):

| Gatilho (conversa / evento) | Ação no funil |
|-----------------------------|----------------|
| Cliente informou **nome + serviço** | Mover para “Qualificado”. |
| Cliente escolheu **data/horário** | Mover para “Agendado”. |
| Cliente pediu **link de pagamento** | “Pagamento pendente”. |
| Pagamento confirmado | “Venda ganha” / “Ganho”. |
| Pedido entregue / serviço concluído | “Pós-venda / Retenção”. |
| Cliente desistiu / motivo de perda | “Perdido” (com motivo). |

As regras são avaliadas pela **IA ou por um motor de regras** no backend após cada mensagem ou evento (pagamento, agendamento).

### 3.4 Hand-off humano

- **“Assumir conversa”:** atendente assume; a IA deixa de responder automaticamente naquele thread.
- **Regras de hand-off:** emergência (ex.: vet), reclamação, negociação fora do padrão, chargeback, palavras-chave ou intenção “falar com humano”.

---

## 4. O que o Kanban precisa ter (na prática)

### 4.1 Colunas recomendadas (modelo geral)

1. **Novo lead (WhatsApp)**  
2. **Em atendimento**  
3. **Qualificado**  
4. **Proposta / orçamento enviado**  
5. **Aguardando resposta**  
6. **Agendado / Carrinho em aberto**  
7. **Pagamento pendente**  
8. **Ganho (concluído)**  
9. **Pós-venda / Retenção**  
10. **Perdido**

*(Por nicho, colunas podem ser renomeadas ou agrupadas; ver seção 6.)*

### 4.2 Cartão – Campos essenciais

| Bloco | Campos |
|-------|--------|
| **Identificação** | Cliente (nome, canal), tags. |
| **Pipeline** | Etapa, responsável. |
| **Próximo passo** | Descrição + data/hora (SLA). |
| **Valor** | Estimado e final. |
| **Checklist** | Ex.: “confirmar endereço”, “enviar política”, “pegar medidas”, “mandar link” (marcáveis). |
| **Histórico** | Últimas mensagens + resumo IA. |
| **Anexos** | Foto do pet, referência de cabelo, comprovante, etc. |

---

## 5. Esqueleto técnico (modelo de dados mínimo)

Entidades que o CRM precisa para funcionar bem com IA e multi-nicho:

| Entidade | Uso |
|----------|-----|
| **Contact** | Cadastro único (pessoa/empresa): nome, telefone, email, CPF/CNPJ, cidade, tags, origem, preferências, consentimento LGPD. |
| **Conversation** | Threads por canal (WhatsApp, etc.): referência ao Contact, mensagens (Message). |
| **Message** | Mensagem individual: conteúdo, sender (user/bot/agent), tipo (texto, áudio, mídia), source, timestamp; transcrição se áudio. |
| **Deal / Card** | Cartão do Kanban: contactId, pipelineId, stage, responsável, valor estimado/final, probabilidade, SLA, checklist, anexos, resumo IA. |
| **Pipeline** | Funil: nome (ex.: “Vendas”, “Agendamentos”), etapas (stages) ordenadas. |
| **Activity** | Tarefas, follow-ups: tipo, dealId/contactId, dueAt, status, descrição; usado para “próximo passo” e escalonamento. |
| **Appointment** | Agendamentos/reservas: contactId, dealId (opcional), recurso (profissional/sala), início/fim, status, lembretes. |
| **Order** | E-commerce: pedido, itens, pagamento, entrega (já no planejamento atual). |
| **Membership** | Academia: plano, matrícula, cobrança recorrente, inadimplência (módulo academia). |
| **Pet** | Pet shop: nome, espécie/raça, idade, peso, tutor (contactId), histórico serviços/vacinas (módulo pet). |
| **Service** | Salão/estética: serviços, profissionais, duração, recursos; histórico por contato (módulo salão). |
| **Plan** | Academia: planos, preços, contratos (módulo academia). |

**Relacionamentos resumidos:**

- Contact 1:N Conversation, 1:N Deal, 1:N Appointment, 1:N Order (e-commerce), 1:N Pet (pet shop).
- Deal 1:N Activity, N:1 Pipeline; Deal pode referenciar Order/Appointment/Membership conforme o nicho.
- Conversation N:1 Contact, 1:N Message.

---

## 6. Funcionalidades por nicho (resumo)

### A) Pet shop / clínica veterinária

- **Entidade Pet:** nome, espécie/raça, idade, peso, temperamento, alergias; vinculado ao Contact (tutor).
- **Histórico:** serviços (banho/tosa), prontuário (clínica).
- **Vacinas/vermífugos + lembretes automáticos** (recall).
- **Kanban típico:** Novo tutor → Qualificar (pet/dados) → Orçar → Agendar → Confirmar → Atendimento → Pós (recall vacina / retorno / fidelização).

### B) Salão de beleza / estética

- **Serviços, profissionais, duração, recursos** (cadeira/sala/equipamento).
- **Preferências e histórico** (cor, técnica, produtos usados).
- **Lembretes por WhatsApp** e agenda online.
- **Pacotes, fidelidade, estoque (se vender produto), comissões.**
- **Kanban típico:** Novo → Qualificado (serviço/data) → Agendado → Confirmado → Em atendimento → Pagamento → Retenção (reagendar em X dias).

### C) Academia / studio fitness

- **Aluno = Contact;** planos, matrícula, contratos.
- **Cobrança recorrente**, inadimplência, risco de churn.
- **Check-in/reserva** (studios), avaliações/treinos (conforme posicionamento).
- **Kanban típico:** Lead → Visita/Aula experimental → Proposta de plano → Matrícula → Pagamento → Onboarding → Retenção/Renovação → Recuperação (inadimplente/inativo).

### D) E-commerce

- **Pedido, carrinho, pagamento, entrega, suporte.**
- **Recuperação de carrinho abandonado** via WhatsApp; pós-compra (upsell/cross-sell).
- **Atendimento:** troca, devolução, garantia, segunda via, status do pedido.
- **Kanban típico:** Novo lead → Produto de interesse → Carrinho criado → Checkout pendente → Pago → Fulfillment → Entregue → Pós-venda → Recompra.

*(O projeto atual “Loja multidepartamental” é uma instanciação deste nicho.)*

---

## 7. Automações essenciais

- **Deduplicação** por telefone ao criar/atualizar contato.
- **“Se não respondeu”** → sequência de follow-up (2h, 24h, 72h) com tarefas e mensagens automáticas.
- **“Se agendou”** → confirmação + lembretes (1 dia antes, X horas antes).
- **“Se pagou”** → mover cartão e disparar fluxo de pós-venda.
- **“Se perdeu”** → registrar motivo + reativação futura (campanha ou reabertura manual).

Implementação: motor de regras no backend e/ou jobs (Bull) que avaliam condições (última mensagem, status do pedido, data do agendamento) e disparam ações (criar Activity, enviar mensagem, mover Deal).

---

## 8. Qualidade e segurança

- **Logs** correlacionados (requestId), auditoria de alterações (quem mudou etapa/valor/agendamento).
- **Permissões** por perfil (admin, atendente, vendedor, gerente, financeiro) nas rotas e nos dados.
- **Criptografia** em repouso e em trânsito (TLS, dados sensíveis no banco).
- **LGPD:** finalidade, consentimento registrado, exportação e remoção de dados sob demanda.

---

## 9. Itens indispensáveis (checklist do “CRM perfeito” para IA + Kanban)

1. **Inbox + timeline** — Tudo que foi falado e feito no contato/cartão.  
2. **Extração automática** — IA preenche campos (nome, serviço, data, produto, pet, etc.) a partir da conversa.  
3. **Kanban com regras de auto-move** — Etapa muda pelo que foi dito/feito (e por drag-and-drop humano).  
4. **Agenda / Pedidos** integrados ao cartão — Ver e criar agendamentos e pedidos no contexto do Deal.  
5. **Follow-up automático** — Tarefas e sequências para não perder lead (escalonamento 2h/24h/72h).  
6. **Módulos por nicho** — Pet (pet/vacinas), Salão (agenda/histórico/comanda), Academia (recorrência/inadimplência), E-commerce (carrinho/pedido/entrega).  
7. **Genérico** — Base comum (Contact, Conversation, Deal, Activity, Appointment) permitindo estender a outros negócios com novos pipelines e entidades.

---

## 10. Relação com o projeto atual (Loja multidepartamental)

- O **PLANEJAMENTO_CRM_KANBAN_FUNIL.md** e a **REVISAO_ARQUITETURA_CRM_KANBAN.md** descrevem a **primeira instanciação**: e-commerce (leads, funil de vendas, pedidos, pagamento, entrega, WhatsApp + IA).
- Esta visão (**VISAO_CRM_CEREBRO_OPERACIONAL.md**) é o **alvo de longo prazo**: CRM genérico com estrutura base (Contact, Deal, Activity, Appointment, Inbox, auto-move, follow-up) e **módulos opcionais** por nicho (Pet, Salão, Academia, E-commerce).
- Ao implementar o CRM da Loja, convém **nomear e modelar** de forma que depois seja possível:
  - Generalizar “Lead” para **Contact** (com tags, origem, consentimento).
  - Generalizar “cartão do funil” para **Deal** (pipeline + stage configuráveis).
  - Adicionar **Activity** como tarefas/follow-up e **Pipeline** como entidade (não só enum fixo).
  - Incluir **Appointment** com recurso (profissional/sala) para agenda multi-recurso.
  - Incluir entidades de nicho (Pet, Service, Plan, Membership) quando for atender outros segmentos.

Assim o projeto atual permanece **consistente** com esta visão e o CRM pode evoluir para o “cérebro operacional” multi-nicho sem quebrar a base.

---

*Documento de visão de arquitetura. Para implementação por fase, seguir PLANEJAMENTO_CRM_KANBAN_FUNIL.md e REVISAO_ARQUITETURA_CRM_KANBAN.md. Para dúvidas: @architect *help.*
