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

**Sentimento, notícias e confiança da administração.** Bloco adicional por
empresa, gerado por `node scripts/build-news.mjs` a partir de `scripts/raw-news/`
e `scripts/raw-sentiment/`:

| Sinal | Cobertura | Origem |
| --- | --- | --- |
| Sentimento de notícias (net −100 a +100) | 193 tickers, 151 com amostra suficiente | `news_sentiment_overview`, batch de 50 tickers por chamada |
| Principais manchetes | 146 tickers | `news_search` agrupado, com complemento individual |
| Confiança da administração (ICEE) | 14 empresas com call no 2T26 | `ir_sentiment_overview` |

Quatro decisões que a API não toma, e sem as quais o bloco engana:

- `by_group` só devolve contagens; o net por ticker é derivado de (pos−neg)÷total;
- abaixo de 8 notícias a direção é ruído — vira "amostra insuficiente", não um número;
- `sentiment_score` é **confiança do modelo**, não intensidade: a polaridade sai
  do campo `sentiment`;
- matéria marcada com 4+ tickers é giro de mercado e cede a vez; título que cita
  a empresa sobe na fila, senão "Ibovespa sobe/cai" domina a lista de todo mundo.

**Gráficos de valuation.** Alternador tabela/gráficos, em SVG inline. A régua
mostra a caixa do setor (P25–mediana–P75, bigodes no mínimo e máximo) com cada
empresa marcada; o eixo foca o interquartil porque um outlier setorial espremeria
a seleção inteira. A dispersão cruza P/L com ROE sobre os pares do setor. A
identidade das empresas vai por rótulo direto, nunca por cor — assim verde e
vermelho seguem significando só melhor e pior.

**Artefato autocontido.** O mesmo comparador existe como página única, sem
build nem servidor — o snapshot vai embutido no HTML (nenhuma requisição
externa, a CSP do artefato bloqueia qualquer host):

```bash
node scripts/build-artifact.mjs   # -> dist-artifact/comparador.html (454 KB)
```

`scripts/artifact/comparador.template.html` é o template; o build injeta o
snapshot e os KPIs (lidos de `sectorKpis.ts`, fonte única com o app React).

A Home (`/`) e o comparador (`/comparador`) são as telas construídas. Os demais itens de navegação têm rotas-stub
(`PlaceholderPage`) para a estrutura crescer sem quebrar a navegação.

> O design de referência (screenshots, tokens, SVGs) fica em `.context/figma/`
> (diretório de colaboração do workspace, fora do versionamento).
