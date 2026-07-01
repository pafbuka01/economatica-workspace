# Economatica Workspace

Workspace B2B que serve de ponte entre o site e as ferramentas da Economatica
(Terminal, Plataforma, Excel Add-in, Data Feed, APIs, Kento MCP, …).

Front-end fiel ao design do Figma _"Eco Worskspace • B2B • Área Admin"_.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (tokens do Figma mapeados em `src/index.css`)
- **React Router v7**
- **vite-plugin-svgr** — ícones SVG (extraídos do Figma) como componentes React
- Tipografia: **IBM Plex Sans** / **IBM Plex Mono** (Google Fonts)

## Como rodar

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção (type-check + bundle)
npm run preview  # pré-visualiza o build
```

## Estrutura

```
src/
  assets/icons/      ícones SVG do Figma (nav usa currentColor)
  components/
    layout/          AppShell, Sidebar, Topbar
    ui/              Button, NavItem, ProgressBar, SectionLabel
  data/              navigation.ts, products.ts (conteúdo)
  features/home/     Hero, ProductCard
  pages/             HomePage, PlaceholderPage (stubs)
  lib/               cn, icons, types
  index.css          tokens de design (Tailwind @theme)
  App.tsx            rotas
```

A Home (`/`) é a única tela construída. Os demais itens de navegação têm rotas-stub
(`PlaceholderPage`) para a estrutura crescer sem quebrar a navegação.

> O design de referência (screenshots, tokens, SVGs) fica em `.context/figma/`
> (diretório de colaboração do workspace, fora do versionamento).
