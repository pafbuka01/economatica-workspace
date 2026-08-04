# Comparador de fundos — pipeline

Gera `artifacts/comparador-fundos.html`: uma página autocontida que compara fundos
brasileiros da base Economatica contra Ibovespa e CDI, com seletor de período
(30 dias, YTD, 12 meses, 5 anos) e as métricas de retorno e risco recalculadas
sobre a janela escolhida.

## Rodar

```bash
node tools/comparador/build.mjs     # monta o dataset e o HTML
node tools/comparador/verify.mjs    # confere tudo contra o risk_stats da Economatica
```

`verify.mjs` roda o build antes de comparar, então na prática basta ele.

## Arquivos

```
tools/comparador/
  template.html   página (marcador __DATA__ recebe o dataset)
  build.mjs       consolida os dados brutos e injeta no template
  verify.mjs      compara o resultado com os números oficiais da Economatica
  checks.json     valores de referência do risk_stats (4 janelas)
  data/raw/       dados brutos, como vieram da Economatica
artifacts/
  comparador-fundos.html   saída — abre direto no navegador, sem servidor
```

## Origem dos dados

Todos os números vêm das ferramentas MCP da Economatica, capturados em 2026-08-04
(última cota disponível: 2026-08-03):

| Fonte | Ferramenta | Vira |
|---|---|---|
| Cotas diárias de 19 fundos CVM | `funds_quote_history` | `<fund_id>_a.json`, `<fund_id>_b.json` |
| Cadastro dos fundos | `funds_search` + `funds_indicators` | `funds.json` |
| Ibovespa diário | `benchmarks_history` | `ibov_1..5.json` |
| Taxa CDI diária | `benchmarks_history` | `cdi.json` |
| Métricas oficiais de risco | `risk_stats` | `checks.json` |

O CDI merece nota: a Economatica publica a **taxa anual** vigente em cada dia útil,
não um índice acumulado. `build.mjs` acumula a curva por `(1 + i)^(1/252)`,
convenção do mercado brasileiro. Como a taxa só muda após decisão do COPOM,
`cdi.json` guarda apenas os 27 pontos de mudança em 5 anos, e o build faz o
forward-fill sobre o calendário de pregões.

## Por que existe o verify

As séries foram transcritas das respostas da API, então erro de cópia é um risco
real — e um ponto errado no meio de 1.250 não aparece no gráfico, mas contamina
volatilidade e drawdown. `verify.mjs` recalcula retorno acumulado, retorno
anualizado, volatilidade, drawdown e número de pregões a partir dos dados
embarcados e compara com o que o `risk_stats` da Economatica devolveu para as
mesmas janelas. Divergência acima de 0,06 p.p. reprova o build.

A verificação também fixa duas convenções que não são óbvias:

- **Anualização** usa o número de retornos diários, não de pregões:
  `(1+r)^(252/(n−1)) − 1` para `n` cotas. Foi assim que os números do `risk_stats`
  fecharam nos três casos testados (fundo, índice e CDI).
- **Janela** do `risk_stats` abre um pregão depois da data pedida na chamada. Por
  isso `checks.json` guarda a data real de início de cada janela, e não a que foi
  passada como parâmetro. O artefato usa o corte inclusivo a partir do primeiro
  pregão da janela, que é o que o leitor espera ao escolher "12 meses".

## Atualizar os dados

Os arquivos em `data/raw/` são um retrato de 2026-08-04. Para atualizar, refaça as
chamadas da tabela acima com o novo intervalo, substitua os arquivos mantendo o
formato (`{"count": n, "series": [[data, valor], ...]}`), regrave `checks.json`
com um `risk_stats` novo e rode `verify.mjs`.
