# Comparador de fundos — pipeline

Gera `artifacts/comparador-fundos.html`: uma página autocontida que compara fundos
brasileiros da base Economatica contra Ibovespa e CDI, com seletor de período
(30 dias, YTD, 12 meses, 5 anos) e as métricas de retorno e risco recalculadas
sobre a janela escolhida.

## Como o leitor monta a comparação

Os fundos escolhidos aparecem como pills, cada uma com um × para tirar da
comparação. Para adicionar, a busca aceita nome do fundo, nome da gestora ou
categoria, sem exigir acento — "acoes" acha "Ações", "genoa" acha o Genoa Capital
Radar. Setas navegam a lista, Enter adiciona, Esc fecha.

O limite é de seis fundos simultâneos, que é onde a paleta categórica ainda
separa as linhas com segurança para daltonismo. Cada fundo guarda seu slot de cor
enquanto estiver selecionado: remover um da lista não repinta os que ficaram, para
a leitura do gráfico não mudar de significado no meio da análise.

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
| Cotas diárias de 67 fundos CVM | `funds_quote_history` | `<fund_id>_a.json`, `<fund_id>_b.json` |
| Cadastro dos fundos | `funds_search` + `funds_indicators` | `funds.json`, `funds2.json`, `funds3.json` |
| Ibovespa diário | `benchmarks_history` | `ibov_1..5.json` |
| Taxa CDI diária | `benchmarks_history` | `cdi.json` |
| Métricas oficiais de risco | `risk_stats` | `checks.json` |

O catálogo veio em três rodadas — `funds.json` (19 nomes iniciais), `funds2.json`
(ampliação para 66) e `funds3.json` (inclusões pedidas caso a caso, hoje só o TC
Cosmos). São arquivos separados só para preservar a proveniência; o build mescla
os três e rejeita fund_id repetido.

Todo fundo passou pelo mesmo filtro: cota atualizada, retorno de 60 meses
plausível e volatilidade de 1 ano dentro da faixa. Ficaram de fora nomes cuja
classe ativa tinha cota parada (Tork Long Only, Truxt Valor, XP Macro, Kinea
Absoluto, Charles River, Quasar Advantage, Icatu Vanguarda Crédito) ou que não
apareceram ativos com histórico usável (Garde D'Artagnan, Mauá Macro, Miles Acer,
Empírica Lótus, Organon, Kinea Crédito Privado).

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
mesmas janelas. Divergência acima de 0,06 p.p. reprova o build. Hoje são 604
comparações cobrindo os 67 fundos, o Ibovespa e o CDI.

O `build.mjs` também barra série truncada antes de chegar lá: confere que a série
começa perto da data de início do fundo, que termina no pregão corrente e que a
densidade de pontos bate com o intervalo. Isso pega o caso silencioso de uma
fatia que voltou pela metade — que não dá erro em lugar nenhum, só produz métrica
errada.

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
