# Long & Short · Pares B3

Ferramenta autocontida (HTML único) para identificar distorções de spread
entre pares de ações da B3, com base Economatica.

## Como usar

Abra `long-short-ibov.html` em qualquer navegador. Não há build, servidor
nem dependência externa: preços e metadados vão embutidos no arquivo.

Três blocos:

- **Radar de distorções** — varre os pares do mesmo setor B3 e destaca os que
  estão a 2σ ou mais da própria média e acima da referência do setor. É o bloco
  proativo: aponta oportunidades sem que o usuário precise procurar.
- **Análise do par** — ratio histórico A/B com média móvel e banda ±2σ, série
  do z-score, e o painel com correlação, volatilidade do spread, meia-vida de
  reversão e os múltiplos das duas pernas.
- **Scanner** — três modos: pares do mesmo setor, todas as combinações do
  universo, e descorrelacionados (correlação abaixo de um limite ajustável),
  para spreads independentes do beta de mercado.

O par corrente vive na URL (`#ITUB4/BBDC4@252`), então dá para compartilhar
uma leitura específica.

## Base

- Universo: as ~100 ações mais líquidas da B3 por volume médio trimestral,
  cobrindo a carteira do Ibovespa, mais o índice IBOV como perna opcional.
- Preços: fechamento diário ajustado por proventos, 749 pregões (3 anos).

Um detalhe da fonte que vale registrar: a API devolve uma linha por dia de
calendário, inclusive feriados da B3, com preço nulo. O calendário da
ferramenta é ancorado nos pregões reais e os 35 feriados são descartados —
preencher feriado com o preço anterior criaria pregão inexistente e
distorceria volatilidade, correlação e z-score.

## Regeneração

Os scripts que montam a base ficam fora do repositório (scratchpad da sessão).
Para atualizar os preços, rebaixe as séries com `equities_quote_history`
(Economatica MCP), monte o `data.json` e injete no template.

## Aviso

Simulação quantitativa sobre dados históricos. Distorção estatística não
implica convergência: fusões, quebras, diluições e eventos de crédito deslocam
o ratio de forma permanente. Não é recomendação de investimento
(Res. CVM 20/2021).
