# Especificação da base de conhecimento – Bot WhatsApp (Fase 1)

**Objetivo:** Fonte única de verdade para FAQ, políticas, produtos, prazos, endereços e horários. O bot só afirma o que consta nesta base.

**Atualizado em:** 2026-02-25

---

## 1. Estrutura da base

| Conteúdo      | Origem / Local                    | Campos principais                          | Atualização   |
|---------------|------------------------------------|--------------------------------------------|---------------|
| **FAQ**       | `backend/data/knowledge/faq.json`  | pergunta, resposta, tags, atualizadoEm      | Manual / CMS  |
| **Políticas** | `backend/data/knowledge/policies.json` | id, titulo, texto, tipo, atualizadoEm  | Manual        |
| **Produtos**  | Banco (tabela `products`) + API    | id, name, category, price, description     | ERP / seed    |
| **Prazos**    | `backend/data/knowledge/prazos.json`   | tipo, descricao, valor, unidade, atualizadoEm | Operação  |
| **Endereços** | `backend/data/knowledge/enderecos.json` | tipo, endereco, cidade, atualizadoEm    | Operação      |
| **Horários**  | `backend/data/knowledge/horarios.json`  | tipo, dias, horario, atualizadoEm       | Operação      |

---

## 2. Formato dos arquivos (JSON)

### 2.1 FAQ (`faq.json`)

```json
{
  "atualizadoEm": "2026-02-25",
  "itens": [
    {
      "id": "faq_001",
      "pergunta": "Qual o prazo de entrega?",
      "resposta": "O prazo varia por região. Consulte com o atendente informando seu CEP.",
      "tags": ["prazo", "entrega"]
    }
  ]
}
```

### 2.2 Políticas (`policies.json`)

```json
{
  "atualizadoEm": "2026-02-25",
  "itens": [
    {
      "id": "pol_garantia",
      "tipo": "garantia",
      "titulo": "Garantia",
      "texto": "Conforme fabricante. Consulte a nota fiscal."
    }
  ]
}
```

### 2.3 Prazos (`prazos.json`)

```json
{
  "atualizadoEm": "2026-02-25",
  "itens": [
    {
      "id": "prazo_entrega",
      "tipo": "entrega",
      "descricao": "Entrega",
      "valor": null,
      "observacao": "Varia por CEP. Confirmar com atendente."
    }
  ]
}
```

### 2.4 Endereços (`enderecos.json`)

```json
{
  "atualizadoEm": "2026-02-25",
  "itens": [
    {
      "id": "end_loja",
      "tipo": "loja",
      "endereco": "Rua Exemplo, 123",
      "cidade": "São Paulo",
      "cep": "01234-567"
    }
  ]
}
```

### 2.5 Horários (`horarios.json`)

```json
{
  "atualizadoEm": "2026-02-25",
  "itens": [
    {
      "id": "hor_atendimento",
      "tipo": "atendimento",
      "dias": "Seg a Sex",
      "horario": "8h às 18h"
    }
  ]
}
```

---

## 3. Integração de leitura

- **Backend:** módulo `KnowledgeBaseModule` com `KnowledgeBaseService`.
- **Métodos:** `searchFaq(termo)`, `getPolicies()`, `getPrazos()`, `getEnderecos()`, `getHorarios()`.
- **Produtos e preços:** já existem em `ProductsService`; o bot deve usar apenas esses dados para afirmar preço/estoque quando consultado pela API/catálogo.

---

## 4. Dados sensíveis – validação antes de afirmar

| Dado       | Fonte de verdade        | Ação do bot                              |
|------------|-------------------------|------------------------------------------|
| Preço      | `ProductsService`       | Só afirmar se o valor vier da API/banco  |
| Prazo      | `prazos.json` + operação| Só afirmar se estiver na base; senão confirmar |
| Garantia   | `policies.json`         | Só afirmar se estiver na base            |
| Endereço   | `enderecos.json`        | Só afirmar se estiver na base            |
| Horário    | `horarios.json`         | Só afirmar se estiver na base            |
| Estoque    | ERP/API (quando houver) | Confirmar com humano/sistema se não houver fonte |

---

## 5. Critérios de aceite (Fase 1)

- [x] Especificação da base (estrutura, campos, origem) documentada.
- [x] Arquivos JSON criados e populados com dados iniciais (`backend/data/knowledge/`).
- [x] Serviço de leitura/consulta à base implementado (`KnowledgeBaseService`).
- [x] Bot nunca inventa preço, prazo, política, endereço, garantia ou disponibilidade (resposta priorizada da base; senão template de incerteza).
- [x] Em dúvida, bot responde com opções de confirmação (template de incerteza).
