# CLAUDE.md

Guia para agentes (Claude Code) trabalhando neste repositório.

## Sobre o projeto

**Economatica Workspace** (oficial): portal B2B que faz a ponte entre o site e as ferramentas da Economatica (Terminal, Plataforma, Excel Add-in, Data Feed, APIs, Kento MCP). Front fiel ao Figma "Eco Workspace • B2B • Área Admin".

- Stack: Vite + React 19 + TypeScript + Tailwind CSS v4 (tokens do Figma em `src/index.css` via `@theme`) + React Router v7.
- Estrutura: `components/layout` (AppShell, Sidebar, Topbar), `components/ui`, `features/*`, `pages/*`, `data/*.ts` (conteúdo), `lib/`.
- Onboarding: todo acesso entra por `/onboarding` (gate em `src/App.tsx`; perfil declarado em `features/onboarding/profile-store.ts`, mock em memória).
- BFF: `src/lib/workspace-bff/` fala com o `userbffapi` v4 (`/userbffapi/v4/workspace/*`, env `VITE_WORKSPACE_BFF_BASE_URL`) com fail-open para o motor local; runbook de produção no card ECO2025-1917.
- Scripts: `npm ci`, `npm run dev`, `npm run build` (tsc + vite), `npm run preview`.
- Lembrete: `VITE_*` é congelado no build; mudou env, redeploya.

## Regra obrigatória — Jira na org economatica

Este repo é o Workspace oficial da Economatica:

1. **Todo trabalho DEVE ter uma task no Jira**, criada (ou localizada) **ANTES** de começar a executar. Projeto **ECO2025** ("Economatica 3030"), board 614 — https://tradersclub.atlassian.net. Via MCP **Atlassian Rovo** (`createJiraIssue`, `editJiraIssue`, `transitionJiraIssue`, `getTransitionsForJiraIssue`). cloudId tradersclub: `fee025d0-2ffa-47fa-b560-37c098ffe684`.
2. **Padrão do card:** "agent-ready" auto-contido (objetivo, contexto, plano por repo/PR, checklist, critérios de aceite, gate). Tipo **Tarefa**; labels = repos tocados (`economatica-workspace`, …) + label de feature.
3. **Atualizar no kanban conforme a execução evolui:** Refinada → Em andamento → Em teste → Concluída, com comentários nos marcos (PR aberto, deploy). Nada de trabalho solto sem rastro no board.

## Regra obrigatória — Menos PRs, mais consolidado

**Consolidar o trabalho no MENOR número de PRs possível.** Cada PR exige review/merge do Pedro.

1. **1 PR por repo por feature.** Nunca fracionar mudanças relacionadas do mesmo repo em vários PRs.
2. **PR separado só quando:** (a) é outro repo (multi-repo exige ≥1 PR por repo); ou (b) é um hotfix bloqueador.
3. **Planejar o conjunto mínimo antes de abrir:** mapear o que a feature toca, agrupar tudo do mesmo repo, abrir o menor número de PRs.
