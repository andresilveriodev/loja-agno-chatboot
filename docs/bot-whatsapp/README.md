# Bot WhatsApp – Padrão Ouro

Documentação e especificações do bot de atendimento WhatsApp, conforme [PLANEJAMENTO_BOT_WHATSAPP_PADRAO_OURO.md](../PLANEJAMENTO_BOT_WHATSAPP_PADRAO_OURO.md).

## Ordem de implementação (para o @dev)

1. **Fase 1 – Base de conhecimento e anti-alucinação** ✅
2. **Fase 2 – Intenção e roteiros** ✅
3. **Fase 3 – Formato de resposta (curto e escaneável)** ✅
4. **Fase 4 – Handoff para humano** ✅
5. **Fase 5 – Coleta progressiva de dados** ✅
6. Fases 6–12 conforme planejamento

## Documentos

| Arquivo | Descrição |
|---------|-----------|
| [01-especificacao-base-conhecimento.md](./01-especificacao-base-conhecimento.md) | Estrutura da base (FAQ, políticas, prazos, endereços, horários), formato JSON e integração. |
| [02-limites-do-bot.md](./02-limites-do-bot.md) | O que o bot pode afirmar sozinho vs. o que deve confirmar; template de incerteza. |
| [03-intencoes-e-fluxos-fase2.md](./03-intencoes-e-fluxos-fase2.md) | Intenções, mapeamento para fluxos, menu inicial e classificador (Fase 2). |
| [04-guia-estilo-resposta-fase3.md](./04-guia-estilo-resposta-fase3.md) | Guia de estilo: 1–3 linhas, bullets, “ver mais” sob demanda (Fase 3). |
| [05-handoff-fase4.md](./05-handoff-fase4.md) | Gatilhos, resumo de handoff no CRM e mensagens para o cliente (Fase 4). |
| [06-coleta-progressiva-fase5.md](./06-coleta-progressiva-fase5.md) | Mapeamento etapa → dados, validação, confirmação e persistência no CRM (Fase 5). |

## Implementação

### Fase 1
- **Base de dados estática:** `backend/data/knowledge/` — `faq.json`, `policies.json`, `prazos.json`, `enderecos.json`, `horarios.json`.
- **Backend:** `KnowledgeBaseModule` (`KnowledgeBaseService`), `BotModule` (`BotService`).
- **Fluxo:** prioriza base; tema sensível sem dado → template de incerteza; senão → ai-service.

### Fase 2
- **Intenções:** `venda_orcamento`, `suporte`, `agendamento`, `status_pedido`, `info`, `politicas`, `atendente`, `menu`, `outros`.
- **Classificador:** `IntentionClassifierService` (regras + interpretação de menu 1–5 e 0).
- **Sessão:** store in-memory por `sessionId` (intenção, passo, dados); TTL 2h.
- **Fluxos:** `flows/flow-definitions.ts` — suporte (1 pergunta → handoff), agendamento (dia → período → handoff), status (1 mensagem → handoff).
- **Menu inicial:** exibido em “oi”, “menu”, “opções” ou primeira interação; escolha por número.

### Fase 3
- **Guia de estilo:** respostas em 1–3 linhas, bullets (⏱️ 📍 ✅), opção *Digite 0 para atendente*.
- **response-style.ts:** `ensureMaxLines`, `formatBullets`, `shortWithVerMais`, `isVerMaisRequest`.
- **Ver mais:** FAQ e políticas podem ter `resumo` (curto) + texto completo; bot oferece “digite *ver mais*” e guarda texto em sessão (TTL 30 min); ao receber “ver mais”/“detalhes”/“completo”, envia o texto completo.
- **Templates:** incerteza, fluxos e handoff ajustados ao padrão curto.

### Fase 4
- **Handoff:** gatilhos (pedido de atendente, reclamação, fluxos); Activity `handoff` no CRM com resumo e últimas 10 mensagens; mensagem clara ao cliente com SLA.

### Fase 5
- **Coleta progressiva:** mapeamento etapa → dados; validação (cidade 2–100 chars, CEP 8 dígitos); confirmação “Confirma: X? 1) Sim 2) Corrigir” antes de gravar.
- **Agendamento:** fluxo com dia → período → cidade → confirmação → persistência no lead (`city`, `intent`) e handoff.
- **Lead:** campo opcional `city`; persistência via `CrmService.updateLead` ao confirmar.
- **data-collection.ts:** `validateCity`, `validateCEP`, `isConfirmationYes/No`, `CONFIRM_CITY_MESSAGE`, `INVALID_CITY_MESSAGE`.

## Como editar a base

Edite os JSON em `backend/data/knowledge/`. Mantenha o campo `atualizadoEm` (ex.: `2026-02-25`). Reinicie o backend para recarregar (ou implementar hot-reload no futuro).
