# Radar de Spread — Debêntures DI+

Radar de abertura de spread (taxa) no secundário de debêntures corporativas DI+,
construído sobre a base Economatica via MCP. Identifica papéis cujo spread abriu
e ainda não fechou, filtrados por qualidade de marcação, covenant e notícia do emissor.

Cobertura atual: **14 papéis** com série de 12 meses reconstruída, de 6 emissores.
Artefato publicado: página HTML autocontida em `radar-spread.html`.

## Por que existe um funil

O campo `ytm_pct` do snapshot de debêntures vem **vazio no universo inteiro** — filtrar
`debentures_screen(min_ytm=0.01)` retorna zero de ~2.000 papéis. A taxa de mercado só
existe em `debentures_quote_history`, uma chamada por código. Varrer o universo por taxa
custaria ~2.000 chamadas, então a coleta é escalonada:

| Estágio | Ferramenta | Custo | O que faz |
|---|---|---|---|
| 1. Cadastral | `debentures_screen` | 2–3 chamadas | Filtra tipo, volume, rating, covenant. Ordena por `volatility_12m_pct` desc, que já é o pré-ranking de "quem se mexeu" |
| 2. Mercado | `debentures_quote_history` | 1 por papel | Só nos candidatos do estágio 1. Cacheável: a base é T-1 e atualiza overnight |
| 3. Contexto | `credit_overview`, `equities_get`, `news_search` | ~3 por emissor | Só no topo do ranking |

O estágio 1 usa campos de performance do snapshot (`max_drawdown_12m_pct`,
`ytm_max_12m_pct`, `premium_cdi_6m_pct`, `sharpe_12m`) que denunciam abertura **sem**
puxar série. É o que torna o funil viável.

## A métrica

Em debênture DI+, a taxa indicativa ANBIMA **já é o spread sobre o DI** — não há curva a
modelar. Verificação: a AEGE16, emitida a `DI + 3,90%`, negociava a 2,99% com PU a par de
103,3 (spread de mercado abaixo do contratual gera ágio). Para IPCA+ isso não vale: a taxa
é juro real e o spread exigiria interpolar a curva NTN-B por duration, via
`titpub_quote_history` ISIN a ISIN (`fixed_income_reference_list` não tem taxas).

O ranking **não** usa z-score puro. Com o evento dentro da janela, ele infla o próprio
desvio padrão e comprime o escore: a Hapvida, que abriu ~600 bps, marca z de 1,03 na
janela cheia. As métricas que sobrevivem:

- `aberto_vs_base_bps` — spread de hoje contra a mediana do regime calmo (ago–out/25; ver abaixo)
- `pct_do_pico_retido` — quanto da abertura segue de pé após a retração
- `vs_contratual_bps` — repreço desde a originação
- `percentil` — posição na própria janela de 12 meses

## O gate de marcação

`std_dev` (dispersão entre marcações do dia) e o gap bid/ask separam repreço de ruído de
iliquidez. No pico de 02/abr/26 a HAPV28 tinha dispersão 2,46 com bid a 13,05% e ask a
8,89%: naquele dia o papel não tinha preço, tinha desacordo.

O limiar é **absoluto** (`≤0,30` limpo, `≤0,80` atenção, acima disso sujo), não percentil.
Percentil sozinho gera falso positivo em papel de história ultracalma — a AEGE16, com
dispersão de 0,14, aparecia como "sujo" só porque sua mediana histórica era 0,02.

Dispersão baixa **não basta**: a TUPY15 marca 0,04 com bid/ask de 310 bps — consenso sobre
um preço que ninguém pratica dos dois lados. O gate exige as duas travas (dispersão E
bid/ask ≤ 200 bps para "limpo").

## A base é medida por data, não por posição

O HAPVA0 só passa a ser marcado pela ANBIMA em 28/nov/25, quando a primeira perna já tinha
acontecido. Uma base pelas "12 primeiras semanas da série" pegaria o estresse como calmaria
e esconderia a abertura. `BASE_ATE = "2025-11-01"` recorta por data; papéis sem essa janela
usam o mínimo da série como piso e são marcados `base_parcial`.

## Cobertura da camada fundamentalista

A ponte debênture → empresa é o **CNPJ**, não o ticker (`credit_overview` por ticker exige
entitlement de equities; por CNPJ funciona). Dos 33 emissores das 50 maiores emissões,
18 têm ação registrada com CNPJ idêntico. O restante é SPE, concessionária ou subsidiária
sem ação própria, e para esses a camada de fundamento é o relatório do agente fiduciário.

Ajuda que a base de ações inclua companhias **registradas sem negociação relevante**
(Eurofarma/EUFA3, Compass/PASS3, Coelba/CEEB3, MRS/MRSA3B), todas emissoras de debênture.

Notícia por texto livre para emissor não listado devolve ruído — buscar
"Equipav Aegea saneamento debênture" trouxe Autodesk, Fleury e Unipar. Só o filtro por
`tickers` funciona, e ainda assim exige `min_relevance` (um release da Aura veio marcado
com RAIL3).

## Como rodar

```bash
python3 calc.py          # lê series.py + series2.py, emite radar.json + tabela no stdout
```

Para atualizar os dados, refazer as chamadas MCP do estágio 1–2 e regravar `series.py`
no formato `(data, ytm, pu_par, std_dev, bid, ask)`. Depois injetar o JSON na página:

```bash
python3 - <<'PY'
import json
d = json.load(open("radar.json"))
for v in d.values():
    v["serie"] = [{"d": p["d"], "y": p["y"], "sd": p["sd"]} for p in v["serie"]]
html = open("radar-spread.html").read().replace("__DATA__", json.dumps(d, ensure_ascii=False, separators=(",",":")))
open("radar-spread.html","w").write(html)
PY
```

(O HTML versionado já está com os dados injetados; o placeholder `__DATA__` vale para
uma reconstrução a partir do template.)

## Limitações assumidas

- Só DI+. IPCA+ depende da curva NTN-B (fase 2).
- Série semanal: `debentures_quote_history` reamostra automaticamente acima de 1 ano.
  Papel ilíquido tem série esparsa; buracos exigem carry-forward.
- Três relógios distintos na mesma tela: marcação T-1, fundamentos do último trimestre
  arquivado, covenants do relatório anual do agente fiduciário.
- Covenants podem vir marcados como `validated_by_trustee: false` — apurados pela própria
  companhia e ainda em validação. O radar mostra a ressalva em vez de esconder.

## Dashboard ao vivo (`dashboard.html`)

Varredura do universo inteiro com botão de atualizar, publicada como Artifact com a
capability `mcp` declarada sobre o conector **Economatica Notícias**. A página não carrega
dado congelado: ela chama `debentures_screen` paginado (50 por vez, cursor até o fim) com
as credenciais de quem abre, e `debentures_quote_history` sob demanda ao clicar numa linha.

Universo em ago/2026: **1.311** debêntures ativas — 604 DI+, 673 IPCA+, 28 pré-fixadas,
6 em outros indexadores.

### O que a varredura consegue medir sem série

`ytm_pct` continua vazio no snapshot, mas dois campos salvam o estágio 1:

- `index_correction` (ex.: `"DI + 1,0500%"`) dá o **spread contratual** de todo papel, parseável.
- `ytm_max_12m_pct` dá o **pico de taxa em 12 meses**.

Para DI+ os dois são spread sobre o DI, então `pico − contratual` mede quanto o papel
chegou a abrir — um ranking do universo inteiro a custo de ~27 chamadas. Para IPCA+ e
pré-fixado a taxa é juro real ou pré e essa subtração não é comparável; a coluna fica vazia.

**Pico não é hoje.** O valor corrente só existe na série, que é 1 chamada por papel — por
isso o drill-down. É o mesmo funil de três estágios, agora operável pela interface.

### Estados degradados

Cada código de erro do runtime tem uma saída própria, porque o conserto de cada um é
diferente: `server_not_connected` manda adicionar o conector, `needs_reauth` manda
reconectar, `blocked_by_policy` manda falar com o admin, `server_unavailable` é transitório
e ganha uma única retentativa. `authStatus` é testado **antes** da lista de ferramentas
vazia — um conector com credencial vencida também aparece sem ferramentas, e mandar
"adicione o conector" para quem só precisa reconectar leva a pessoa ao lugar errado.

`mock.js` + `test.mjs` exercitam todos esses ramos com a forma de resposta observada e
valores sintéticos (`node test.mjs`, precisa de playwright e do Chromium do ambiente).

## Terminal de crédito privado (`terminal.html`)

Substitui a dashboard de tabela única por uma ferramenta de quatro módulos, publicada como
Artifact com a capability `mcp` sobre o conector **Economatica Notícias**. Layout de três
zonas: barra de comando com busca global, rail com watchlist e cobertura, workspace com
abas por papel e por emissor.

| Módulo | O que faz | Ferramentas |
|---|---|---|
| Triagem | Universo por classe, filtros e ordenação | `debentures_screen`, `securitizations_screen` |
| Papel | Série de 12m, gate de marcação, crédito | `debentures_quote_history`, `credit_overview` |
| Comparar | Até 6 séries sobrepostas, absoluto ou vs contratual | `debentures_quote_history` |
| Emissor | Fundamento trimestral, notícia e fato relevante CVM | `equities_*`, `news_search` |

### Universo

| Classe | Papéis |
|---|---|
| Debêntures | 1.311 (604 DI+, 673 IPCA+, 28 pré, 6 outros) |
| CRI | 5.980 |
| CRA | 1.439 |

Debêntures são varridas por inteiro (27 chamadas). CRI/CRA vêm por lotes de 300 com
"carregar mais", porque 7.419 papéis são ~150 chamadas e não cabem numa tacada de browser.

### CRI e CRA não têm série histórica

Verificado: existe `debentures_quote_history`, **não existe equivalente para securitizações**.
As tools são apenas `securitizations_screen/get/search`, e `min_ytm` devolve zero em 7.419
papéis. O terminal mostra o aviso no lugar do gráfico em vez de deixar um painel vazio.

O que CRI/CRA entregam: `index_correction`, `ytm_max_12m_pct` (existe no `fields` do screen
mesmo não sendo filtrável), retorno 12m, prêmio vs CDI, drawdown, rating + agência,
subordinação, lastro, segmento e regime fiduciário.

### Parser de indexador tolerante

`index_correction` não tem formato único entre as bases: `"DI + 1,0500%"` nas debêntures,
mas `"IPCA + 3,5 %"` e `"3,80 a.a + IPCA"` nas securitizações. O parser detecta o índice por
palavra-chave e pega o primeiro número, em vez de assumir posição fixa. Percentual do DI
(`"DI x 108%"`) devolve spread nulo — não é spread aditivo e somá-lo seria erro.

### Armadilha de CSS que custou um bug

`button:hover:not(:disabled)` tem especificidade 0-2-1 e vence `.navb[aria-current=true]`
(0-2-0): o item ativo do menu perdia o fundo escuro no hover e ficava texto claro sobre
fundo claro. Os três estados ativos (`.navb`, `.tab`, `.seg button`) repetem o seletor com
`:hover` para chegar a 0-3-0. Vale para qualquer estado ativo que conviva com um seletor
genérico de `button`.

### Testes

`node t2.mjs` sobe o terminal com `mock2.js`, que injeta `window.claude.mcp` com a forma de
resposta observada nas oito ferramentas e exercita: boot, troca de classe, abertura de papel,
comparador com três séries, emissor completo, e os ramos `noconn` / `reauth` / `policy` /
`flaky` / `noseries`, mais dark mode e viewport de 390px.

### Cobertura de teste

`t2.mjs` cobre boot, varredura, troca de classe, papel, comparador, emissor e os ramos de
erro. `t3.mjs` cobre persistência de watchlist entre recargas, busca global por teclado,
papel de CRI/CRA sem série e papel sem marcação. `t4.mjs` cobre a interação que sobrou:
fechar aba sem deixar view órfã, inverter ordenação, filtro de setor, "mostrar mais",
"carregar mais 300" nos CRI/CRA, o teto de 6 papéis no comparador, a troca entre taxa
absoluta e vs contratual, abrir/remover pela watchlist e Escape na busca.

24 casos no total. O que nenhum deles cobre é a chamada real ao conector: o harness injeta
`window.claude.mcp` com a forma de resposta observada, então o que está testado é o código
do terminal, não o roteamento até a base. Isso só se verifica abrindo a página publicada.
