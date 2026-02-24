# Refinamento UX – CRM Kanban

**Papel:** UX Design Expert | AIOS  
**Escopo:** Tela do Kanban, fluxos (Registrar compra, agendamento, detalhes), acessibilidade  
**Referências:** `docs/PLANEJAMENTO_CRM_KANBAN_FUNIL.md`, `docs/REVISAO_ARQUITETURA_CRM_KANBAN.md`

---

## 1. Objetivo

Refinar a experiência do usuário do CRM Kanban em três eixos:

1. **Tela do Kanban** – hierarquia visual, uso de espaço, estados e feedback.
2. **Fluxos** – Registrar compra, arrastar para Fechado, agendamento, modais de detalhe.
3. **Acessibilidade** – teclado, leitores de tela, contraste, alternativas ao drag-and-drop.

O frontend do projeto usa **Shadcn UI, Radix e Tailwind**; os componentes do CRM devem seguir os mesmos tokens e padrões (ex.: `ProductCard` com `rounded-xl`, `border`, `shadow-sm`).

---

## 2. Tela do Kanban – Refinamentos

### 2.1 Estrutura da página e hierarquia

- **Uma única coluna de conteúdo:** Header fixo → Barra de filtros (colapsável) → Área do Kanban (scroll horizontal). Evitar sidebar fixa na mesma tela para não competir com o scroll horizontal das colunas.
- **Header do CRM:**
  - Título: **"Funil de Vendas"** (evitar "CRM" sozinho; mais orientado à tarefa).
  - Busca global: placeholder **"Buscar por nome ou telefone"**, ícone de lupa, `aria-label="Buscar leads e pedidos"`. Debounce 300 ms; buscar ao digitar (sem botão "Buscar" obrigatório), com indicador de loading discreto.
  - Notificações: ícone com badge de contagem (novas mensagens + agendamentos do dia); `aria-label="Notificações (N itens)"`; ao clicar, drawer ou dropdown com lista e link para o lead/pedido.
  - Usuário: dropdown com nome e "Sair" (Radix DropdownMenu).
- **Barra de filtros:**
  - Primeira linha sempre visível: **Estágio** (multiselect), **Origem** (Todos | Web | WhatsApp), **Data** (presets + personalizado), **Intenção** (select dinâmico), campo **Busca** (redundante com header mas contextual), botões **Aplicar** e **Limpar**.
  - Botão **"Mais filtros"** (expandir/recolher) para: valor estimado (range), produto de interesse. Recolhido por padrão.
  - Estado recolhido: mostrar chips com filtros ativos (ex.: "Estágio: Cotação, Negociação • Últimos 7 dias") e "Editar" para reabrir.
  - Uso de **Shadcn Select, Popover (date range), Input** e **Button** para consistência.

### 2.2 Área do Kanban (scroll horizontal)

- **Container:** `overflow-x-auto` com `scroll-behavior: smooth`; barra de scroll visível em desktop (evitar `overflow-x: hidden` que prejudica acessibilidade e descoberta).
  - **`aria-label="Funil de vendas e pedidos"`** no container do board.
  - Navegação por teclado: setas esquerda/direita para mover foco entre colunas (ver seção Acessibilidade).
- **Duas fileiras visuais sugeridas (opcional no layout):**
  - **Fileira 1 – Vendas:** Novo Lead → … → Fechado (Ganho) | **Fileira 2:** Perdido (coluna separada).
  - **Fileira 3 – Pedidos:** Pag. pendente → … → Entregue.
  - Ou uma única fileira horizontal longa (12 colunas). Preferir **uma fileira** para simplificar drag-and-drop e acessibilidade (menos ambiguidade de “onde soltar”).
- **Largura das colunas:** mínima fixa (ex.: `min-w-[280px]`) para manter cards legíveis; colunas com muitos cards ganham scroll vertical interno na coluna (não aumentar largura indefinidamente).

### 2.3 Colunas

- **Cabeçalho da coluna:** nome do estágio + contador em badge (ex.: "Novo Lead (3)").
  - Cores por estágio (borda superior ou barra lateral fina), conforme tabela do planejamento; usar tokens Tailwind (ex.: `border-t-4 border-t-primary-500`) para manter consistência com o design system.
- **Área de drop:** altura mínima mesmo vazia (ex.: `min-h-[200px]`) para facilitar “soltar” e deixar claro que é zona de drop.
  - **Empty state:** ícone + texto "Nenhum lead aqui" / "Nenhum pedido aqui" + opcional "Arraste um card para cá". Tom amigável, não vazio cru.
- **Roles e ARIA:** cada coluna como `role="region"` com `aria-label="Coluna: [Nome do estágio], N itens"` para leitores de tela.

### 2.4 Cards (lead e pedido)

- **Lead card (estágios 1–7):**
  - **Linha 1:** Nome (font-weight 600, truncado com `title`).
  - **Linha 2:** Telefone (link `tel:` ou botão "Abrir WhatsApp" com ícone); empresa (secundário, truncado).
  - **Linha 3:** Valor estimado (ex.: "R$ 5.000") + última interação (ex.: "há 2 min") em texto menor/cor secundária.
  - **Linha 4:** Tags (produtos de interesse, até 2 + "+N"; ou intenção). Máximo uma linha; overflow com tooltip.
  - **Ações:** preferir **menu ⋮** (DropdownMenu Radix) com itens: "Ver detalhes", "WhatsApp", "Agendar", "Registrar compra" (apenas Cotação/Negociação). Isso reduz poluição visual e melhora toque em mobile. Ícones + texto em cada item.
  - **Card como elemento arrastável:** área de “pegar” pode ser o card inteiro; evitar conflito com clique do menu (usar `onPointerDown` na área do cabeçalho para iniciar drag, ou lib que distingue click vs drag).
- **Order card (estágios 8–12):**
  - **Linha 1:** Nº pedido (ex.: "#1001") + nome do cliente.
  - **Linha 2:** Valor total + data do pedido.
  - **Linha 3:** Status pagamento (chip) + status entrega (chip ou texto curto com rastreio em tooltip).
  - **Ações no menu:** "Ver detalhes do pedido", "WhatsApp", "Editar status".
- **Estados visuais do card:**
  - **Repouso:** borda sutil, sombra leve (`shadow-sm`).
  - **Hover:** sombra média (`shadow-md`), borda um pouco mais marcada; cursor `grab` na área de drag.
  - **Arrastando:** opacidade ~0.9, sombra forte (`shadow-lg`), cursor `grabbing`; anunciar para leitor de tela (ver Acessibilidade).
  - **Carregando (após soltar):** skeleton interno ou spinner discreto no canto do card até o `PUT` retornar; desabilitar novo drag no mesmo card até concluir.
  - **Erro ao mover:** toast (Shadcn Sonner ou equivalente) "Não foi possível mover. Tente novamente." + manter card na coluna de origem.

### 2.5 Loading e empty states globais

- **Primeira carga do board:** skeleton das colunas (retângulos por coluna com placeholders de cards) ou spinner centralizado; evitar layout shift (reservar altura mínima).
- **Nenhum resultado após filtros:** mensagem centralizada: "Nenhum lead ou pedido encontrado. Ajuste os filtros ou limpe a busca." + botão "Limpar filtros".
- **Erro de rede:** mensagem clara + botão "Tentar novamente" que refaz a requisição.

---

## 3. Fluxos – Refinamentos

### 3.1 Registrar compra (wizard e-commerce)

- **Gatilhos:** (1) Botão "Registrar compra" no menu do card (Cotação/Negociação) ou no detalhe do lead; (2) Ao arrastar lead para "Fechado (Ganho)", **diálogo de confirmação**: "Marcar como Fechado (Ganho) e abrir registro de compra?" com ações "Só marcar", "Registrar compra" (primário), "Cancelar".
- **Wizard em 3 passos:** usar Stepper visual (1. Itens → 2. Pagamento → 3. Entrega); título do passo sempre visível; botões "Voltar" e "Próximo" / "Concluir".
  - **Passo 1 – Itens:** tabela ou lista de itens com: busca/seleção de produto (autocomplete ou select), quantidade, preço unitário (editável), total por linha. Botão "Adicionar item"; subtotal atualizado em tempo real; campo opcional "Desconto (R$)".
  - **Passo 2 – Pagamento:** select "Forma de pagamento" (PIX, Boleto, Cartão, Transferência); exibir valor total; radio "Status inicial": "Pendente" ou "Confirmado" (se já recebeu).
  - **Passo 3 – Entrega:** formulário de endereço (campos completos: CEP com busca, rua, número, complemento, bairro, cidade, UF); campo opcional "Previsão de entrega (data)".
- **Validação:** por passo; não avançar com erros; mensagens inline (ex.: "Preencha pelo menos um item").
- **Após concluir:** fechar modal/drawer; toast "Pedido #1001 criado com sucesso"; invalidar cache do Kanban para o novo card de pedido aparecer; opcionalmente abrir detalhe do pedido criado.
- **Acessibilidade:** foco preso no modal; primeiro campo focável ao abrir; anunciar passo atual para leitor de tela; "Concluir" com `aria-label="Criar pedido e fechar"`.

### 3.2 Arrastar para "Fechado (Ganho)"

- Ao soltar lead na coluna **Fechado (Ganho):** sempre mostrar o diálogo de confirmação acima ("Só marcar" vs "Registrar compra"). Evitar ação silenciosa que exija o usuário lembrar de abrir o fluxo de compra depois.
- Se o usuário escolher "Registrar compra", o lead já fica em "Fechado (Ganho)" e o wizard de registro de compra abre em seguida (mesmo lead pré-selecionado).

### 3.3 Agendamento (call, visita, callback)

- **Abrir:** do menu do card ("Agendar") ou do detalhe do lead (seção Agendamentos → "Novo agendamento").
- **Modal ou Sheet (Shadcn):** formulário com Tipo (Call | Visita técnica | Callback), Data e Hora (datetime-local ou DatePicker + TimePicker), Título, Descrição (opcional). Botões "Cancelar" e "Agendar".
- **Feedback:** toast "Agendamento criado para [data]"; fechar modal; na lista de agendamentos do lead, novo item aparece (ou refetch da seção).

### 3.4 Modal / página de detalhe do lead

- **Abas recomendadas (Shadcn Tabs):** Resumo | Timeline | Agendamentos | Pedidos | Notas.
  - **Resumo:** dados do lead editáveis (nome, telefone, empresa, email, estágio, intenção, valor estimado, origem, datas). Botão "Salvar" ao editar.
  - **Timeline:** agrupamento por dia; cada mensagem com avatar, remetente (Lead / Atendente / IA), conteúdo, data/hora, origem (Web/WhatsApp). Scroll com carregamento sob demanda (paginação) para muitos itens.
  - **Agendamentos:** lista com tipo, data/hora, título, status; ações por item: Editar, Concluir, Cancelar; botão "Novo agendamento".
  - **Pedidos:** lista de pedidos (número, valor, estágio); clique abre detalhe do pedido; botão "Registrar compra".
  - **Notas:** área de texto livre + lista de notas com data; botão "Adicionar nota".
- **Ações rápidas no cabeçalho do modal:** WhatsApp, Agendar, Registrar compra (conforme estágio).
- **Foco e teclado:** ao abrir, foco na primeira aba ou no primeiro elemento interativo; Escape fecha o modal; Tab circula dentro do modal (focus trap).

### 3.5 Detalhe do pedido (modal ou página)

- **Cabeçalho:** nº pedido, nome do cliente (link para lead), data, estágio atual (badge).
- **Blocos:** Itens (tabela) → Totais (subtotal, desconto, total) → Pagamento (método, status, data confirmação, referência) → Entrega (endereço, status, data envio, rastreio, "Marcar como entregue").
- **Edição:** "Editar status de pagamento" e "Editar status de entrega" podem abrir pequenos dialogs ou inline (select de status + campo rastreio). "Marcar como entregue" como botão direto com confirmação rápida.
- **Acessibilidade:** estrutura com headings (h2 por bloco); tabela de itens com cabeçalhos escopo coluna.

---

## 4. Acessibilidade (CRM Kanban)

### 4.1 Princípios

- **WCAG 2.1 nível AA** como meta: contraste, foco visível, teclado, textos alternativos, estrutura semântica.
- **Língua:** `lang="pt-BR"` já no layout; manter em qualquer nova página/modal do CRM.
- **Anúncios dinâmicos:** usar **live region** (`aria-live="polite"`) para: "Lead movido para Qualificado", "Pedido #1001 criado", "Falha ao mover lead".

### 4.2 Navegação por teclado

- **Board:** foco pode entrar no container do Kanban; **Tab** leva para a primeira coluna (ou primeiro card da primeira coluna, conforme estratégia).
- **Colunas:** setas **Esquerda/Direita** movem foco entre colunas (cada coluna como um grupo focável ou primeiro card da coluna); **Cima/Baixo** dentro da coluna entre cards.
- **Card:** ao focar um card, **Enter** ou **Space** pode abrir o menu de ações (DropdownMenu já é acessível por teclado no Radix) ou "Ver detalhes". Evitar que apenas o drag seja acionável; oferecer **alternativa por teclado para mudar estágio** (ver 4.5).
- **Modais/Dialogs:** focus trap; **Escape** fecha; Tab circula apenas dentro do modal.
- **Filtros:** todos os controles (select, input, botões) acessíveis por Tab; ordem lógica (estágio → origem → data → intenção → busca → Aplicar → Limpar).

### 4.3 Leitores de tela

- **Coluna:** `role="region"` e `aria-label="Coluna [Nome], N itens"`.
- **Card:** o card como um todo deve ter `role="button"` ou estar dentro de um elemento clicável com `aria-label="Lead [Nome], [estágio], valor estimado R$ X"` (resumo curto). Ações no menu com rótulos claros ("Ver detalhes de [Nome]", "Abrir WhatsApp para [telefone]", "Agendar follow-up", "Registrar compra").
- **Drag-and-drop:** ao iniciar arraste, anunciar: "Arrastando lead [Nome]. Use as setas para escolher a coluna e Enter para soltar." (ou equivalente). Ao soltar, anunciar "Lead [Nome] movido para [estágio]" via `aria-live="polite"`.
- **Contador de coluna:** incluir no `aria-label` da coluna ("Novo Lead, 3 itens") para que o usuário saiba quantos cards há sem percorrer todos.

### 4.4 Contraste e foco

- **Contraste:** texto e ícones em pelo menos 4.5:1 sobre o fundo (ex.: texto secundário em cinza não muito claro). Badges de estágio com texto legível sobre a cor de fundo.
- **Foco visível:** outline ou ring visível em todos os elementos interativos (botões, links, cards focáveis, itens de menu). Não usar `outline: none` sem substituto (ex.: `ring-2 ring-primary-500 ring-offset-2`).

### 4.5 Alternativa ao drag-and-drop (mudar estágio por teclado/menu)

- **Problema:** arrastar com mouse não está disponível para usuários só de teclado ou leitores de tela.
- **Solução:** no menu de ações do card (⋮), incluir item **"Mover para…"** com submenu das colunas permitidas (ex.: "Qualificado", "Produtos Apresentados", …). Ao escolher, enviar `PUT /api/crm/leads/:id` com o novo `stage` e atualizar a UI + live region.
- Para **pedidos**, mesmo padrão: menu "Mover para…" com estágios de pedido (Pagamento pendente → … → Entregue).
- **Opcional:** no detalhe do lead (e do pedido), campo **Estágio** como select editável; ao alterar, mesmo `PUT` e feedback.

### 4.6 Formulários (Registrar compra, Agendamento, filtros)

- Todos os campos com `<label>` associado (ou `aria-label` se for componente que não expõe label visual).
- Erros de validação: `aria-describedby` apontando para a mensagem de erro; `aria-invalid="true"` no campo com erro.
- Botões de envio: "Agendar", "Concluir", "Aplicar" com texto claro; evitar só ícone sem texto para ações principais.

### 4.7 Resumo de checklist acessibilidade

| Item | Ação |
|------|------|
| Board | `aria-label` no container; anúncio de drag/soltar |
| Colunas | `role="region"`, `aria-label` com nome e contagem |
| Cards | Resumo em `aria-label`; menu de ações acessível |
| Mudar estágio | Menu "Mover para…" (submenu de colunas) além do drag |
| Modais | Focus trap, Escape fecha, primeiro elemento focável |
| Filtros | Ordem Tab lógica; labels em todos os controles |
| Toasts/feedback | `aria-live="polite"` para mensagens dinâmicas |
| Contraste | Texto e ícones ≥ 4.5:1 |
| Foco | Outline/ring visível em todos os interativos |

---

## 5. Resumo para implementação

- **Tela Kanban:** header com busca e notificações; barra de filtros colapsável com chips quando recolhida; board em uma fileira horizontal com colunas de largura mínima fixa; empty states e loading por coluna e global; cards com menu ⋮ e estados hover/drag/loading/erro.
- **Fluxos:** Registrar compra em wizard de 3 passos com confirmação ao arrastar para Fechado; agendamento em modal com tipo/data/título; detalhe do lead em abas (Resumo, Timeline, Agendamentos, Pedidos, Notas); detalhe do pedido em blocos (itens, totais, pagamento, entrega).
- **Acessibilidade:** navegação por teclado (setas entre colunas/cards, Tab, Enter/Space); menu "Mover para…" como alternativa ao drag; ARIA em board/colunas/cards e live regions para feedback; contraste e foco visível; labels e erros em formulários.

Com isso, o CRM Kanban fica alinhado ao planejamento existente, com UX refinada e acessível, pronta para guiar a implementação pelo @dev.

---

*Documento de refinamento UX. Para dúvidas ou evolução do design: @ux-design-expert. Implementação: @dev.*
