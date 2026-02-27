# Limites do bot – O que pode afirmar / Deve confirmar

**Objetivo:** Deixar explícito o que o bot pode afirmar sozinho e o que deve confirmar com humano ou sistema antes de responder.

**Atualizado em:** 2026-02-25

---

## 1. Pode afirmar sozinho (desde que esteja na base)

O bot **pode** afirmar, **somente** quando a informação constar na base de conhecimento ou na API (produtos/preços):

| Assunto        | Condição                                      |
|----------------|-----------------------------------------------|
| Nome da loja   | Sempre (dado fixo do sistema)                 |
| Categorias de produtos | Sempre (catálogo)                      |
| Preço de produto | Somente se retornado por `ProductsService`  |
| Resposta de FAQ | Somente se encontrada em `faq.json` (busca por termo) |
| Política (troca, garantia) | Somente se em `policies.json`          |
| Horário de atendimento | Somente se em `horarios.json`        |
| Endereço da loja | Somente se em `enderecos.json`             |
| Prazo genérico (ex.: "varia por região") | Somente se em `prazos.json` com texto aprovado |

---

## 2. Deve confirmar (não inventar)

O bot **não deve** inventar. Deve usar o **template de incerteza** ou transferir:

| Assunto              | Ação do bot                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| Preço não encontrado no catálogo | Não inventar valor. Oferecer: "Posso confirmar o preço pra você. Quer que eu verifique com o time?" ou opções A/B/C. |
| Prazo de entrega para um CEP específico | Não inventar dias. Dizer que varia por região e oferecer confirmar ou passar para atendente. |
| Estoque              | Se não houver integração com ERP, não afirmar disponibilidade. Confirmar com humano. |
| Garantia de produto específico | Só afirmar se estiver em políticas; senão, confirmar.                 |
| Área de entrega      | Só afirmar se estiver na base (endereços/áreas); senão, confirmar.          |
| Formas de pagamento  | Só afirmar se constar em políticas; senão, confirmar.                      |
| Qualquer dado que não esteja na base | **Nunca** inventar. Usar template de confirmação.                    |

---

## 3. Template de incerteza (resposta padrão)

Quando a informação **não** estiver na base ou na fonte:

**Versão curta (1–3 linhas):**
> Não tenho essa informação certinha aqui. Posso confirmar pra você. É sobre (A) preço, (B) prazo, (C) garantia ou (D) outro?

**Versão por tipo (quando o contexto já indicar):**
- Preço: *"O preço desse item eu preciso confirmar. Quer que eu verifique e te aviso?"*
- Prazo: *"O prazo depende da sua região. Posso te passar para um atendente confirmar o prazo pro seu CEP?"*
- Garantia: *"A garantia desse produto vou confirmar. Um momento?"*

---

## 4. Regra obrigatória

- **Se não está na base ou na fonte → não afirmar.**
- Em dúvida → usar template de confirmação (opções A/B/C ou oferta de confirmar/passar para atendente).

---

## 5. Integração com o código

- O pipeline do bot (webhook WhatsApp) deve:
  1. Obter resposta do agente de IA (ai-service).
  2. (Opcional) Detectar se a resposta contém afirmações sensíveis (preço, prazo, garantia, endereço, horário).
  3. Validar essas afirmações contra a base (KnowledgeBaseService + ProductsService).
  4. Se alguma afirmação não puder ser validada → substituir ou complementar com template de incerteza.

Alternativa: restringir no próprio prompt e nas tools do ai-service para que a IA **só** use dados retornados pelas tools/base, sem inventar. A validação no backend é uma camada extra de segurança.
