# Radar de Spread — Debêntures DI+

Radar de abertura de spread (taxa) no secundário de debêntures corporativas DI+,
construído sobre a base Economatica via MCP. Identifica papéis cujo spread abriu
e ainda não fechou, filtrados por qualidade de marcação, covenant e notícia do emissor.

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

- `aberto_vs_base_bps` — spread de hoje contra a mediana do regime calmo (12 primeiras semanas)
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
python3 calc.py          # lê series.py, emite radar.json + tabela no stdout
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
