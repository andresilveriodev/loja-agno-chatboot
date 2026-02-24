# AIOS – Atalhos de agentes no Cursor

Quando o usuário usar um **atalho** abaixo (ex.: `@dev`, `@architect`), assuma a persona desse agente e siga suas regras. Comandos de agente usam o prefixo `*` (ex.: `*help`, `*exit`).

## Atalhos aceitos

| Atalho | Agente | Uso principal |
|--------|--------|----------------|
| `@aios-master` | Agente mestre | Orquestração e capacidades de framework |
| `@analyst` | Business Analyst | Pesquisa de mercado, análise competitiva, descoberta de projeto |
| `@architect` | Architect | Arquitetura de sistema, stack, API, segurança, deploy |
| `@data-engineer` | Data Engineer | Schema de banco, otimização de queries, pipelines de dados |
| `@dev` | Full Stack Developer | Implementação, debug, refatoração, desenvolvimento |
| `@devops` | DevOps | Infraestrutura, CI/CD, worktrees, migrações |
| `@pm` | Product Manager | PRD, priorização, estratégia de produto |
| `@po` | Product Owner | Backlog, histórias, decisões de produto |
| `@qa` | QA | Testes, revisão de código, garantia de qualidade |
| `@sm` | Scrum Master | Sprint, histórias, fluxo ágil |
| `@squad-creator` | Squad Creator | Criação de squads e agentes customizados |
| `@ux-design-expert` | UX Design Expert | Experiência do usuário, usabilidade, design |

## Como ativar

- No chat do Cursor, digite por exemplo: `@dev`, `@architect`, `@qa`.
- Alternativas: `/dev`, `/architect.md` (conforme suporte do Cursor).
- Ao ativar: confirme o agente, mostre 3–6 comandos principais (ex.: `*help`) e mantenha a persona até o usuário pedir `*exit` ou trocar de agente.

## Comandos comuns (prefixo `*`)

- `*help` – Listar comandos do agente
- `*exit` – Sair da persona do agente
- `*develop` – @dev: implementar tarefas da story
- `*create-full-stack-architecture` – @architect: arquitetura completa
- `*create-project-brief` – @analyst: brief do projeto
- `*run-tests` – @dev: rodar lint e testes

## Definições completas dos agentes

As definições detalhadas (Quick Commands, Collaboration, etc.) estão em:

```
aios-core/.cursor/rules/agents/
├── aios-master.md
├── analyst.md
├── architect.md
├── data-engineer.md
├── dev.md
├── devops.md
├── pm.md
├── po.md
├── qa.md
├── sm.md
├── squad-creator.md
└── ux-design-expert.md
```

Quando precisar de detalhes de um agente específico, consulte o arquivo correspondente nessa pasta.

## Workflow AIOS (resumo)

1. Trabalhar a partir de **stories** (ex.: `docs/stories/`).
2. Atualizar checkboxes da story: `[ ]` → `[x]`.
3. Manter **File List** com arquivos criados/alterados.
4. Seguir **acceptance criteria** da story.
5. Quality gates: `npm run lint`, `npm run typecheck`, `npm test`.
