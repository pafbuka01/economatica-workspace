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

## Comparador de empresas (`/comparador`)

Compara ações da B3 lado a lado. Cobre o universo inteiro: **479 tickers / 350
empresas** após dedup por CNPJ, em 11 setores Bovespa.

**Dados.** Snapshot versionado, gerado a partir de dumps da Economatica:

```bash
node scripts/build-snapshot.mjs   # scripts/raw/*.json -> src/data/comparator/snapshot.json
```

Os dumps em `scripts/raw/` são respostas de `equities_screen` particionadas por
setor — a paginação por cursor da API repete a primeira página, então o
particionamento por setor é o que garante cobertura determinística. O build
deduplica por ticker, elege a classe mais líquida de cada CNPJ e pré-calcula a
distribuição setorial (min/P25/mediana/P75/max) que alimenta o badge de percentil.

A UI depende da interface `ComparatorSource` (`src/data/comparator/types.ts`), não
do snapshot: trocar por API ao vivo é reimplementar aquele objeto.

**O que o comparador trata que uma tabela ingênua erra:**

| Caso | Tratamento |
| --- | --- |
| PETR3 e PETR4 (mesmo CNPJ, P/L 5,6x vs 5,0x) | dedup por CNPJ, classe mais líquida é a primária, aviso quando duas classes entram juntas |
| Banco não tem enterprise value | linhas de EV renderizam `n/a`, nunca vazio ou zero |
| P/L negativo (prejuízo) | vira `n/m`, fica fora do heatmap e da mediana setorial |
| Direção da métrica | em P/L menor é verde, em ROE maior é verde (`direction` em `metrics.ts`) |
| Preço T-1 sobre balanço trimestral | carimbo de frescor fixo no topo |
| Papel ilíquido | aviso de que o múltiplo pode estar defasado |

**KPI gerencial por setor.** Quando todas as selecionadas compartilham o segmento,
aparece o bloco de indicadores gerenciais (bancos: Basileia, CET1, inadimplência
90+, cobertura, carteira). Cada número carrega o link do documento CVM de origem,
com página e trecho citado — contrato de auditabilidade da fonte.

A Home (`/`) e o comparador (`/comparador`) são as telas construídas. Os demais itens de navegação têm rotas-stub
(`PlaceholderPage`) para a estrutura crescer sem quebrar a navegação.

> O design de referência (screenshots, tokens, SVGs) fica em `.context/figma/`
> (diretório de colaboração do workspace, fora do versionamento).
