# Coleta progressiva de dados – Fase 5

**Objetivo:** Capturar o mínimo necessário no momento certo, sem interrogatório. Primeiro ajude, depois peça dado.

**Atualizado em:** 2026-02-25

---

## 1. Mapeamento etapa → dados necessários

| Etapa / Intenção   | Dados necessários              | Quando pedir                         |
|--------------------|--------------------------------|--------------------------------------|
| **Agendamento**    | dia, período, cidade/bairro    | Dia e período já coletados; cidade antes do handoff. |
| **Suporte**        | tipo (1/2/3), cidade ou nº pedido (opcional) | Tipo na 1ª pergunta; cidade/pedido na mensagem de handoff (texto livre). |
| **Status pedido**  | número do pedido ou telefone/email | Única pergunta antes do handoff.     |
| **Orçamento/Venda**| item, cidade                   | Tratado pelo assistente de IA; handoff já pede cidade no texto. |

Regra: só pedir dados essenciais para a etapa atual; não repetir pergunta já respondida (reaproveitar sessão/lead).

---

## 2. Validação e confirmação

- **Cidade/bairro:** texto 2–100 caracteres; aceitar “São Paulo”, “Centro”, “Zona Sul”.
- **CEP:** 8 dígitos (com ou sem hífen). Se inválido: “CEP inválido. Pode digitar de novo? (ex.: 01310100)”.
- **Confirmação:** antes de gravar, enviar *“Confirma: [valor]? 1) Sim 2) Corrigir”*. Só persistir após “1” ou “sim”.

---

## 3. Integração com CRM

- **Lead:** campos usados para persistir: `name`, `city` (novo), `intent`, `notes`.
- **Quando persistir:** ao confirmar dados no fluxo (ex.: agendamento após “Confirma: [cidade]? 1) Sim”).
- **Handoff:** resumo no CRM já inclui histórico; dados coletados (cidade, etc.) ficam no lead e nas mensagens.

---

## 4. Critérios de aceite (Fase 5)

- [x] Dados pedidos apenas quando necessários para o fluxo.
- [x] Formato validado (cidade, CEP quando usado); dado confirmado antes de gravar.
- [x] Integração com CRM (persistir cidade/intenção no lead ao confirmar).
- [ ] Sem repetir pergunta já respondida (reaproveitar contexto) — reforço na Fase 10.
