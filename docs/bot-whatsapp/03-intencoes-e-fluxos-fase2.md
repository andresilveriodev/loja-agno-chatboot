# Intenções e fluxos – Fase 2

**Objetivo:** Classificar intenção do usuário e conduzir a conversa por roteiros com 1 pergunta por vez e opções rápidas.

**Atualizado em:** 2026-02-25

---

## 1. Lista de intenções

| Intenção            | Descrição                          | Fluxo / Ação |
|---------------------|------------------------------------|--------------|
| **venda_orcamento** | Orçamento, preço, produto, compra  | IA (catálogo + recomendações) |
| **suporte**         | Reclamação, problema, dúvida técnica | Fluxo suporte (1 pergunta → handoff) |
| **agendamento**     | Marcar visita/entrega/reunião     | Fluxo agendamento (dia → período → handoff) |
| **status_pedido**   | Rastrear pedido, status            | Fluxo status (número do pedido → handoff) |
| **info**            | Endereço, horário                  | Base de conhecimento (Fase 1) |
| **politicas**       | Garantia, troca, pagamento         | Base de conhecimento (Fase 1) |
| **atendente**       | Pedido explícito de humano         | Mensagem de handoff (Fase 4 preparação) |
| **outros**          | Não identificado ou genérico      | Menu inicial ou IA |

---

## 2. Mapeamento para fluxos

- **venda_orcamento** → `BotService` encaminha para `AiService` (busca produtos, preço, orçamento).
- **info** / **politicas** → Resposta da base (FAQ, horários, endereços, políticas) — já implementado na Fase 1.
- **suporte** → Fluxo: 1 pergunta “Sobre o que é? 1) Problema com pedido 2) Dúvida 3) Outro” → mensagem de transferência para atendente.
- **agendamento** → Fluxo: “Qual dia?” → “Manhã ou tarde? 1) Manhã 2) Tarde” → mensagem de transferência.
- **status_pedido** → Fluxo: “Me diga o número do pedido” → (quando houver API: consulta; senão) transferência.
- **atendente** → Resposta fixa: “Vou te passar para um atendente. Tempo médio: X. Digite 0 a qualquer momento.”
- **outros** → Menu inicial (opções 1–5) ou, se já em conversa, IA.

---

## 3. Menu inicial

Exibido na primeira interação ou quando o usuário pede “menu” / “opções” / “oi” sem contexto claro:

```
Oi! Aqui é o Alé, assistente da Loja Multidepartamental.
Em que posso te ajudar?

1) Orçamento / produto
2) Agendar
3) Suporte
4) Endereço / horário
5) Status do pedido

Digite o número ou escreva sua dúvida. Digite 0 para atendente.
```

---

## 4. Regras do classificador (regras)

- **venda_orcamento:** valor, preço, quanto custa, orçamento, quero comprar, produto, catálogo, furadeira, etc.
- **suporte:** suporte, reclamação, problema, não chegou, defeito, dúvida técnica.
- **agendamento:** agendar, agendamento, marcar, agendar visita, data.
- **status_pedido:** status do pedido, rastrear, onde está meu pedido, número do pedido.
- **info:** endereço, horário, onde fica, que horas abre.
- **politicas:** garantia, troca, devolução, política.
- **atendente:** atendente, humano, falar com alguém, 0 (quando após menu).

Resposta numérica após o menu: “1” → venda_orcamento, “2” → agendamento, “3” → suporte, “4” → info, “5” → status_pedido.

---

## 5. Critérios de aceite (Fase 2)

- [x] “Qual valor?” → resposta sobre preço/orçamento (classificador → venda_orcamento → IA).
- [x] Máximo 1 pergunta por vez com opções (fluxos suporte, agendamento, status com 1 pergunta por passo).
- [x] Confirmação de intenção antes de aprofundar (menu inicial com 1–5; escolha numérica).
- [x] Classificador integrado ao bot e fluxos (suporte, agendamento, status) com perguntas e opções.
