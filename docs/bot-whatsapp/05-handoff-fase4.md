# Handoff para humano – Fase 4

**Objetivo:** Transferir para atendente quando necessário, com contexto útil no CRM e expectativa de tempo clara para o cliente.

**Atualizado em:** 2026-02-25

---

## 1. Gatilhos de handoff

- **Pedido explícito de humano:**
  - Palavras como: “atendente”, “humano”, “falar com alguém”, “pessoa real”.
- **Tom de reclamação / risco:**
  - “reclamação”, “reclamacao”, “procon”, “processo”, “cancelar”, “cancelamento”.
- **Fluxos do bot:**
  - Fluxos de **suporte**, **agendamento** e **status de pedido** terminam com “Vou te passar para um atendente”.

---

## 2. O que vai para o CRM (Activity `handoff`)

Ao disparar o handoff pelo WhatsApp, o backend registra uma **Activity** do tipo `handoff` no CRM com:

- **Cabeçalho (description):**
  - Origem: WhatsApp
  - Nome
  - Telefone
  - Intenção (quando disponível no lead)
  - Motivo: `pedido_explicito_usuario` ou `fluxo_bot`
- **Histórico recente:**
  - Últimas **10 mensagens** da conversa (cliente, bot, agente) com timestamp.

Metadados (`metadata`):

- `source`: `"whatsapp"`
- `reason`: motivo do handoff
- `intention`: intenção atual do lead (quando houver)
- `sessionId`: sessão do chat (ex.: `wa:+5511999999999`)
- `messagesCount`: quantas mensagens foram incluídas no resumo

---

## 3. Mensagens para o cliente (WhatsApp)

- Pedido explícito ou fluxo que termina em handoff:
  - *“Vou te passar para um atendente. Tempo médio: alguns minutos.”*
  - *“Pode me dizer sua cidade ou o produto de interesse?”*
  - Sempre reforçar: *“Digite 0 para atendente.”*

Essas mensagens já estão integradas aos fluxos de **suporte**, **agendamento** e **status**, além da intenção `atendente`.

---

## 4. Critérios de aceite (Fase 4)

- [x] Pedido explícito de atendente não é ignorado (bot responde e registra handoff).
- [x] Atendente recebe resumo com histórico e contexto no CRM (Activity `handoff`).
- [x] Cliente recebe mensagem clara de transferência e expectativa de tempo (“alguns minutos”) + opção `0` para atendente.

