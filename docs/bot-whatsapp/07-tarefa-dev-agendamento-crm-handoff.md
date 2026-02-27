# Tarefa @dev: Agendamento no CRM e handoff só para casos complexos

**Objetivo:** Garantir que (1) a IA faça agendamento e marque entrega gravando no CRM, e (2) a passagem para humano ocorra apenas quando for algo complexo que a IA não consegue resolver.

**Atualizado em:** 2026-02-26

---

## 1. Comportamento desejado (critérios de aceite)

| Cenário | Quem resolve | Handoff para humano? |
|---------|--------------|----------------------|
| Agendar **visita** ou **retorno** | IA (fluxo + gravar no CRM) | Não (só se usuário digitar 0 ou pedir atendente) |
| Agendar **entrega** (marcar entrega) | IA (fluxo + gravar no CRM) | Não (idem) |
| Suporte / problema / dúvida técnica | Humano | Sim (fluxo termina em "Vou te passar para um atendente") |
| Status do pedido | Humano | Sim (fluxo pede número e passa para atendente) |
| Pedido explícito de atendente ou "0" | Humano | Sim |

- **Agendamento sempre grava no CRM:** ao confirmar visita, retorno ou entrega, o registro deve ser criado na tabela `schedules` e o lead atualizado quando aplicável (cidade, intent).
- **Nunca exibir "Agendamento criado!" sem ter gravado:** se por algum motivo não houver `leadId` no momento da confirmação, não mostrar mensagem de sucesso; orientar contato ou passar para atendente.

---

## 2. O que já está implementado (verificar, não quebrar)

- **BotService.runFlow** (`backend/src/modules/bot/bot.service.ts`):
  - Fluxo **agendamento** (visita, retorno, entrega): coleta dados, na confirmação chama `this.crmService.createSchedule(...)` e `this.crmService.updateLead(leadId, ...)` quando `leadId` está presente.
  - Fluxos **suporte** e **status_pedido**: terminam com mensagem de handoff (sem criar agendamento).
- **CrmService.createSchedule** (`backend/src/modules/crm/crm.service.ts`): persiste em `scheduleRepo` (tabela `schedules`) com `leadId`, `type`, `scheduledAt`, `title`, `description`, e para entrega: `address`, `cep`, `deliveryItems`; `status: "pending"`.
- **WhatsApp controller** (`backend/src/modules/whatsapp/whatsapp.controller.ts`): chama `findOrCreateLeadByPhone(phone)` e passa `leadId` para `botService.getReply(..., leadId)`, então no WhatsApp o agendamento já é gravado.

---

## 3. Tarefas para o desenvolvedor

### 3.1 Garantir mensagem correta quando não houver `leadId` (agendamento)

**Arquivo:** `backend/src/modules/bot/bot.service.ts`  
**Método:** `runFlow`, dentro do fluxo de **agendamento**.

- **Visita/Retorno** (confirmação no `subStepIndex === 3`):
  - Hoje: se `leadId` estiver ausente, o `if (isConfirmationYes(userText) && leadId && ...)` não executa `createSchedule`, mas a resposta ao usuário é a mesma ("Agendamento criado! ...").
  - **Ajuste:** quando o usuário confirmar com "sim" mas **não** houver `leadId`, **não** exibir a mensagem de sucesso do passo final (getAgendamentoSubStep(tipo, 4)). Em vez disso, retornar uma mensagem que:
    - informe que para finalizar o agendamento é preciso identificar o contato, e
    - ofereça passar para um atendente (ex.: "Para concluir o agendamento preciso do seu contato. Quer que eu te passe para um atendente? Digite 0 para atendente.").
- **Entrega** (confirmação no `subStepIndex === 6`):
  - Mesmo critério: se `leadId` estiver ausente na confirmação, **não** mostrar "Agendamento de entrega criado!". Usar mensagem análoga à acima (identificar contato / oferecer atendente).

**Referência de trechos atuais:**
- Visita/Retorno: linhas ~234–261 (confirmação cidade e `createSchedule`).
- Entrega: linhas ~322–352 (confirmação e `createSchedule`).

### 3.2 (Opcional) Registrar handoff quando encaminhar por falta de `leadId`

Se na tarefa 3.1 você encaminhar o usuário para atendente por falta de `leadId`, avalie se nesse mesmo fluxo deve ser registrada uma **Activity** de handoff no CRM (por exemplo motivo `"agendamento_sem_leadId"`), para o atendente ver na timeline. Isso depende de existir um ponto no controller ou no bot que chame `registerWhatsappHandoff`. Hoje o handoff é registrado no **WhatsApp controller** quando a resposta do bot contém "vou te passar para um atendente" ou quando o texto do usuário bate em gatilhos fortes. Se a nova mensagem não contiver "vou te passar para um atendente", o handoff pode não ser registrado automaticamente; nesse caso, documentar ou implementar o registro conforme padrão do projeto.

### 3.3 Garantir que canais que usam o bot sempre passem `leadId`

- **WhatsApp:** já passa `leadId` (ver `whatsapp.controller.ts`).
- Se existir ou for criado outro canal (ex.: chat web) que chame `BotService.getReply`, **garantir** que esse canal sempre passe `leadId` quando o usuário estiver identificado (ex.: após login ou após associar sessão ao lead). Documentar no código ou em README do módulo bot que `leadId` é obrigatório para persistir agendamento.

---

## 4. Arquivos principais

| Arquivo | Uso |
|---------|-----|
| `backend/src/modules/bot/bot.service.ts` | Fluxo de agendamento; condição `leadId`; mensagens de sucesso/fallback |
| `backend/src/modules/crm/crm.service.ts` | `createSchedule`, `updateLead` |
| `backend/src/modules/crm/dto/create-schedule.dto.ts` | Contrato do agendamento |
| `backend/src/entities/schedule.entity.ts` | Entidade `schedules` |
| `backend/src/modules/whatsapp/whatsapp.controller.ts` | Chamada a `getReply` com `leadId`; registro de handoff |

---

## 5. Como validar

1. **WhatsApp (fluxo atual):** fazer agendamento completo (visita, retorno ou entrega) e confirmar. Verificar no CRM que um novo registro aparece em **Agendamentos** (`schedules`) para o lead correto, com tipo, data/hora, título e (no caso de entrega) endereço, CEP e itens.
2. **Cenário sem leadId (se implementado):** em ambiente de teste, chamar `getReply` na confirmação do agendamento sem passar `leadId` (ou com `leadId` undefined). Verificar que a resposta **não** é "Agendamento criado!" e que orienta contato ou atendente.
3. **Handoff:** suporte e status do pedido devem continuar exibindo "Vou te passar para um atendente" e registrando handoff no CRM; agendamento concluído pela IA não deve disparar handoff automático (apenas se o usuário digitar 0 ou pedir atendente).

---

## 6. Referências

- Handoff: `docs/bot-whatsapp/05-handoff-fase4.md`
- Intenções e fluxos: `docs/bot-whatsapp/03-intencoes-e-fluxos-fase2.md`
- Fluxos (mensagens): `backend/src/modules/bot/flows/flow-definitions.ts`
