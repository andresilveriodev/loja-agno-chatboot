# Planejamento por fases – Bot WhatsApp (padrão ouro)

**Objetivo:** Implementar o bot etapa por etapa, evitando os 12 problemas descritos (alucinação, classificação fraca, respostas longas, handoff ruim, coleta de dados, desalinhamento com operação, exceções, tom, spam, personalização, LGPD, métricas).

**Princípios:** Base única de conhecimento, regra “se não sabe não inventa”, fluxos por intenção, respostas curtas + opções, handoff com contexto, coleta progressiva, conteúdo versionado, rotas de exceção, métricas e melhoria contínua.

---

## Fase 1 – Base de conhecimento e anti-alucinação

**Objetivo:** Ter uma base única (FAQ + políticas + produtos + horários) e regra obrigatória: não afirmar o que não está na base; em dúvida, pedir confirmação.

**Escopo:**

- Definir fonte única de verdade: onde ficam FAQ, políticas, produtos, prazos, endereços, horários (arquivos, CMS, API, planilha).
- Modelar “limites do bot”: o que pode afirmar sozinho vs o que deve “confirmar com humano/sistema”.
- Para dados sensíveis (preço, estoque, prazos): sempre validar em fonte (planilha/ERP/CRM/API) antes de afirmar.
- Implementar resposta padrão de incerteza: *“Posso confirmar isso pra você. É sobre (A) preço, (B) prazo, (C) garantia?”* (ou equivalente por tipo de dado).

**Entregas:**

- Especificação da base (estrutura, campos, origem).
- Documento “Limites do bot” (pode afirmar / deve confirmar).
- Integração de leitura/consulta à base (e às fontes de preço/estoque/prazo quando houver).
- Lógica no bot: se resposta não está na base ou na fonte → não inventar; usar template de confirmação.

**Critérios de aceite:**

- Bot nunca inventa preço, prazo, política, endereço, garantia ou disponibilidade.
- Em caso de dúvida, responde com opções de confirmação (ex.: A/B/C) em vez de texto inventado.

**Dependências:** Nenhuma (fase inicial).

---

## Fase 2 – Intenção e roteiros (classificação e fluxos)

**Objetivo:** Reduzir “perguntar demais” e respostas fora do contexto (ex.: cliente pergunta valor e bot manda texto sobre a empresa).

**Escopo:**

- Definir intenções: venda/orçamento, suporte, agendamento, status de pedido, endereço/horário, políticas, outros.
- Implementar classificador de intenção (modelo ou regras) usando base + histórico quando disponível.
- Desenhar roteiros por intenção (fluxos) com perguntas mínimas: 1 pergunta por vez, com opções rápidas.
- Micro-check de confirmação: ex. *“Entendi. Você quer agendar ou só tirar dúvida de preço?”*

**Entregas:**

- Lista de intenções e mapeamento para fluxos.
- Classificador de intenção integrado ao bot.
- Fluxos por intenção (venda, suporte, agendamento, status, info) com perguntas e opções.
- Mensagem de menu inicial: ex. *“Você quer: 1) Orçamento 2) Agendar 3) Suporte 4) Endereço/horário”*.

**Critérios de aceite:**

- “Qual valor?” → resposta sobre preço/orçamento, não texto genérico.
- Máximo 1 pergunta por vez com opções; sem “interrogatório” de 6 perguntas seguidas.
- Confirmação de intenção antes de aprofundar no fluxo.

**Dependências:** Fase 1 (base) desejável para respostas corretas dentro de cada fluxo.

---

## Fase 3 – Formato de resposta (curto e escaneável)

**Objetivo:** Respostas adequadas ao WhatsApp (curtas, escaneáveis), sem texto “acadêmico” longo.

**Escopo:**

- Padrão: 1–3 linhas + opções quando fizer sentido.
- Uso de bullets curtas (ex.: ✅ Preço, ⏱️ Prazo, 📍 Entrega).
- “Ver mais” sob demanda: ex. *“Se quiser, te mando os detalhes completos da política.”*

**Entregas:**

- Guia de estilo (máximo de linhas, uso de emojis/bullets, quando oferecer “ver mais”).
- Ajuste dos templates e respostas do bot ao padrão (incluindo respostas vindas da base da Fase 1).
- Lógica para “ver mais” (resposta expandida sob demanda).

**Critérios de aceite:**

- Respostas padrão em 1–3 linhas + opções.
- Uso consistente de bullets para múltiplas informações.
- Detalhes longos só quando o usuário pedir.

**Dependências:** Fases 1 e 2 (conteúdo e fluxos já definidos).

---

## Fase 4 – Handoff para humano (transferência com contexto)

**Objetivo:** Transferir para atendente quando necessário, com contexto e SLA claro.

**Escopo:**

- Detectar gatilhos: “atendente”, “humano”, “reclamação”, “processo”, “cancelar”, “procon”, etc.
- Ao transferir: enviar resumo automático ao CRM/atendente: nome, telefone, intenção, produto, urgência, histórico (ex.: últimas 10 mensagens), etapa do funil.
- Mensagem clara ao cliente: ex. *“Vou te passar para um atendente. Tempo médio: X. Enquanto isso, me diga: (cidade) e (produto).”*
- Definir SLA (tempo médio de espera) e exibir quando fizer sentido.

**Entregas:**

- Lista de gatilhos e regras de acionamento do handoff.
- Integração com fila/CRM (envio do resumo).
- Template de resumo (campos obrigatórios).
- Mensagens ao cliente (transferência + SLA + dados opcionais a preencher).

**Critérios de aceite:**

- Pedido explícito de atendente não é ignorado.
- Atendente recebe resumo com histórico e contexto.
- Cliente recebe confirmação e expectativa de tempo.

**Dependências:** Fase 2 (intenção) para enriquecer o resumo; pode usar dados da Fase 5.

---

## Fase 5 – Coleta progressiva de dados

**Objetivo:** Capturar o mínimo necessário no momento certo, sem interrogatório.

**Escopo:**

- Estratégia “primeiro ajude, depois peça dado”.
- Por etapa: orçamento → “Qual item e sua cidade?”; agendamento → “Qual dia/horário e endereço/bairro?”; etc.
- Validação de formato (telefone, CEP) e confirmação antes de salvar.
- Só pedir dados essenciais para a etapa atual.

**Entregas:**

- Mapeamento etapa → dados necessários (nome, cidade, necessidade, faixa orçamento quando aplicável, etc.).
- Validação e confirmação (formato + mensagem “Confirma: X?”).
- Integração com CRM/backend para persistir dados no momento certo.

**Critérios de aceite:**

- Dados pedidos apenas quando necessários para o fluxo.
- Formato validado; dado confirmado antes de gravar.
- Sem repetir pergunta já respondida (ver Fase 10).

**Dependências:** Fase 2 (fluxos) para saber em que etapa pedir cada dado.

---

## Fase 6 – Alinhamento com a operação (“contrato de verdade”)

**Objetivo:** Bot não promete o que a operação não cumpre (prazos, horários, áreas, políticas).

**Escopo:**

- Checklist operação: horários reais, áreas atendidas, prazos reais, exceções, políticas (troca, garantia, pagamento).
- Conteúdo versionado com data: “Atualizado em: dd/mm”.
- Revisão periódica (ex.: mensal) entre produto/operação e conteúdo do bot.

**Entregas:**

- Checklist “Contrato bot x operação” preenchido e aprovado.
- Base de conhecimento e mensagens com data de atualização.
- Processo de revisão (responsável, periodicidade).

**Critérios de aceite:**

- Nenhuma afirmação do tipo “24h”, “24/7”, “qualquer cartão” sem estar no checklist aprovado.
- Conteúdo sensível com “Atualizado em” visível onde fizer sentido.

**Dependências:** Fase 1 (base) para aplicar versionamento e checklist.

---

## Fase 7 – Exceções e casos fora do padrão

**Objetivo:** Tratar reclamação, urgência, cancelamento, mídia e casos atípicos sem quebrar o fluxo.

**Escopo:**

- Rotas de exceção: reclamação → empatia + coleta de dados + prioridade + humano; urgência → pergunta objetiva + encaminhar.
- Suporte a mídia: ex. *“Pode me mandar uma foto do produto/erro?”*; áudio → confirmar entendimento e oferecer menu.
- Casos proibidos/ilegais: resposta padrão e, se aplicável, registro sem repetir o conteúdo sensível.

**Entregas:**

- Fluxos de exceção (reclamação, urgência, cancelamento, chargeback quando aplicável).
- Tratamento de áudio/vídeo/imagem (confirmação + fallback para menu).
- Política e mensagens para pedidos fora da política.

**Critérios de aceite:**

- Reclamação/urgência acionam rota específica e handoff quando necessário.
- Mídia não quebra o bot; áudio tem resposta e menu.
- Casos sensíveis tratados por política definida.

**Dependências:** Fase 2 (intenção) e Fase 4 (handoff).

---

## Fase 8 – Tom e empatia

**Objetivo:** Tom curto, simpático e profissional; mensagens de “ponte” e empatia em frustração.

**Escopo:**

- Tom: curto, simpático, profissional (documentar em guia).
- Mensagens de ponte: ex. *“Entendi 🙂”*, *“Boa! Vou te ajudar com isso.”*
- Em frustração/reclamação: ex. *“Sinto muito por isso. Vou resolver com você agora.”*

**Entregas:**

- Atualização do guia de estilo (tom + frases de ponte e empatia).
- Templates por situação (confirmação, ajuda, frustração, transferência).
- Ajuste das respostas do bot aos novos templates.

**Critérios de aceite:**

- Respostas sem tom frio/robótico.
- Uso consistente de frases de ponte e empatia nos momentos certos.

**Dependências:** Fases 2 e 3 (fluxos e formato já definidos).

---

## Fase 9 – Limites de automação (anti-spam)

**Objetivo:** Evitar excesso de mensagens e reengajamento agressivo.

**Escopo:**

- Limite por sessão: ex. no máximo 1 follow-up em 2h e outro em 24h (parâmetros configuráveis).
- Compactar respostas (evitar 5 mensagens curtas seguidas; agrupar em 1–2 quando possível).
- Respeitar silêncio e dar saída: ex. *“Se preferir, digite 0 para falar com um atendente.”*

**Entregas:**

- Regras de rate limit e follow-up (configuráveis).
- Lógica de agrupamento de mensagens antes do envio.
- Mensagem de saída e opção “0” para humano (integrada ao handoff da Fase 4).

**Critérios de aceite:**

- Não disparar várias mensagens em sequência desnecessária.
- Follow-up dentro dos limites definidos.
- Cliente pode sair para atendente de forma clara.

**Dependências:** Fase 4 (handoff).

---

## Fase 10 – Personalização e memória de sessão

**Objetivo:** Cliente não sentir que está repetindo tudo; contexto reaproveitado.

**Escopo:**

- Memória de sessão: nome, cidade, produto de interesse, etapa.
- Resumo por etapa: ex. *“Então você quer: X, na cidade Y, para Z — certo?”*
- Não repetir pergunta já respondida (verificar contexto antes de perguntar).

**Entregas:**

- Armazenamento de contexto de sessão (estado por conversa).
- Regra: checar contexto antes de fazer pergunta.
- Template de resumo e uso nos fluxos (confirmação antes de avançar).

**Critérios de aceite:**

- Dados já informados são reutilizados e não solicitados de novo.
- Resumo claro antes de ações importantes (envio de orçamento, agendamento, etc.).

**Dependências:** Fase 2 (fluxos) e Fase 5 (dados); integração com persistência.

---

## Fase 11 – Segurança e LGPD

**Objetivo:** Mínimo necessário de dados, sem pedir ou expor informações sensíveis no chat.

**Escopo:**

- Princípio: mínimo necessário; não pedir dados bancários/cartão pelo WhatsApp.
- Mensagem padrão: ex. *“Não precisamos de dados de cartão aqui. Se alguém pedir, desconfie.”*
- Política de retenção: armazenar só o essencial no CRM, com justificativa e base legal.
- Evitar vazamento de dados (ex.: nunca mostrar pedido de outra pessoa).

**Entregas:**

- Política de dados (coleta, uso, retenção) documentada.
- Revisão dos pontos de coleta (Fase 5) sob ótica LGPD.
- Mensagens padrão de segurança e não solicitação de cartão/banco.
- Regras de exibição de dados (só o próprio usuário).

**Critérios de aceite:**

- Nenhuma coleta de cartão/dados bancários pelo bot.
- Retenção e propósito documentados; exibição de dados restrita ao titular.

**Dependências:** Pode ser iniciada em paralelo; revisão completa após Fase 5.

---

## Fase 12 – Métricas e melhoria contínua

**Objetivo:** Medir desempenho e evoluir base, prompts e fluxos.

**Escopo:**

- Métricas mínimas: taxa de resolução sem humano, tempo até primeira resposta e até solução, taxa de transferência, taxa de abandono, conversão por intenção (ex.: orçamento→venda, agendamento→comparecimento), top N perguntas sem resposta (lacunas).
- Revisão semanal: conversas “falhas”, atualização de base, prompt e fluxos.
- Dashboard ou relatório para produto/operação.

**Entregas:**

- Definição das métricas e forma de coleta (logs, eventos, CRM).
- Dashboard ou relatório (semanal) com indicadores.
- Processo de revisão semanal (responsável, checklist de atualização).

**Critérios de aceite:**

- Indicadores disponíveis e acompanhados.
- Revisão semanal realizada e refletida em mudanças na base/fluxos.

**Dependências:** Todas as fases anteriores (bot em uso para gerar dados).

---

## Ordem sugerida para o @dev

| Ordem | Fase | Motivo |
|-------|------|--------|
| 1 | Fase 1 – Base e anti-alucinação | Fundação; evita risco maior (invenção de informação). |
| 2 | Fase 2 – Intenção e roteiros | Direciona toda a conversa e uso da base. |
| 3 | Fase 3 – Formato de resposta | Ajusta estilo sem refazer fluxos. |
| 4 | Fase 4 – Handoff | Necessário antes de escalar uso. |
| 5 | Fase 5 – Coleta de dados | Depende dos fluxos; melhora qualidade de lead. |
| 6 | Fase 6 – Contrato com operação | Reduz desalinhamento; pode ser em paralelo a 3–5. |
| 7 | Fase 7 – Exceções | Aproveita handoff e fluxos já definidos. |
| 8 | Fase 8 – Tom e empatia | Refino de conteúdo e templates. |
| 9 | Fase 9 – Anti-spam | Regras de envio e handoff já existentes. |
| 10 | Fase 10 – Personalização | Usa fluxos e coleta já implementados. |
| 11 | Fase 11 – LGPD | Pode começar cedo; revisão após Fase 5. |
| 12 | Fase 12 – Métricas | Instrumentação desde cedo; dashboard e processo após fases principais. |

---

## Checklist padrão ouro (resumo para cada entrega)

- [ ] Fluxos por intenção (venda / suporte / agendamento / info).
- [ ] Respostas curtas + opções numeradas.
- [ ] Regra anti-alucinação: “se não sabe, confirma”.
- [ ] Handoff claro + resumo para humano/CRM.
- [ ] Coleta progressiva (mínimo necessário).
- [ ] Base de conhecimento viva e versionada.
- [ ] Tratamento de exceções (reclamação, urgência, cancelamento).
- [ ] Métricas + melhoria semanal.
