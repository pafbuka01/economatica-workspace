# Long & Short · Pares B3

Ferramenta autocontida (HTML único) para identificar distorções de spread entre
pares de ações da B3, com base Economatica.

## Como usar

Abra `long-short-ibov.html` em qualquer navegador. Não há build, servidor nem
dependência externa: preços e metadados vão embutidos no arquivo.

Três blocos:

- **Radar de distorções** — varre os pares do mesmo setor B3 e destaca os que
  estão a 2σ ou mais da própria média e acima da referência do setor. É o bloco
  proativo: aponta oportunidades sem que o usuário precise procurar.
- **Análise do par** — ratio histórico A/B com média móvel e banda ±2σ, série do
  z-score, e o painel com correlação, volatilidade do spread, meia-vida de
  reversão e os múltiplos das duas pernas.
- **Scanner** — três modos: pares do mesmo setor, todas as combinações do
  universo, e descorrelacionados (correlação abaixo de um limite ajustável),
  para spreads independentes do beta de mercado.

O par corrente vive na URL (`#ITUB4/BBDC4@252`), então dá para compartilhar uma
leitura específica.

## Atualização

Há dois caminhos, e eles resolvem problemas diferentes.

**Botão "Atualizar dados", dentro da ferramenta.** Relê a janela recente de cada
ativo pelo conector Economatica e estende as séries na hora. Vale para a sessão
aberta: a página não regrava o próprio arquivo, então ao reabrir volta à base
embutida. Depende de a Economatica estar disponível como conector da claude.ai
para quem abriu a página; se não estiver, o botão fica desabilitado e explica o
que fazer, e os dados embutidos seguem válidos.

**Scripts em `build/`, para gravar os dados novos no arquivo.** É o caminho
durável, executado por um agente com acesso ao MCP da Economatica:

1. `node build/update-plan.mjs` — imprime de que data buscar e quais tickers.
2. Um agente coleta com `equities_quote_history` e grava
   `build/data/_upd/<TICKER>.json` no formato `{"t":TICKER,"rows":[{date,close_adj}]}`.
3. `node build/update-apply.mjs` — funde em `build/data.json`.
4. `node build/inject.mjs tools/long-short-ibov.html` — regenera o HTML.

Para recarga total (universo novo, série do zero), o caminho é
`build/assemble.mjs`, que reconstrói `data.json` a partir de `build/data/<TICKER>.json`.

### Por que a atualização não é um simples append

`close_adj` é série total-return: a Economatica a recalcula **para trás** a cada
provento, JCP ou split. Anexar cegamente misturaria duas escalas de preço na
mesma série e envenenaria justamente o que a ferramenta mede — o ratio e o
z-score de longo prazo — sem nenhum sintoma visível.

Por isso toda rodada relê 40 pregões de sobreposição e compara com o que está
gravado. Divergiu além de 0,2% em boa parte da janela, aquele papel foi
reajustado e sua série é reconstruída por inteiro. Na prática são poucos papéis
por rodada, então o custo continua baixo.

## Base

- Universo: as ~100 ações mais líquidas da B3 por volume médio trimestral,
  cobrindo a carteira do Ibovespa, mais o índice IBOV como perna opcional.
- Preços: fechamento diário ajustado por proventos, 749 pregões (3 anos).
- Dado é T-1: a Economatica gera durante a madrugada, então uma atualização por
  dia útil é o teto do que faz sentido.

Outro detalhe da fonte que vale registrar: a API devolve uma linha por dia de
calendário, inclusive feriados da B3, com preço nulo. O calendário é ancorado
nos pregões reais e os 35 feriados são descartados — preencher feriado com a
cotação anterior criaria pregão inexistente e distorceria volatilidade,
correlação e z-score.

O universo em si também envelhece: a carteira do Ibovespa é rebalanceada a cada
quatro meses, então periodicamente o screener precisa rodar de novo, não só os
preços.

## Aviso

Simulação quantitativa sobre dados históricos. Distorção estatística não implica
convergência: fusões, quebras, diluições e eventos de crédito deslocam o ratio de
forma permanente. Não é recomendação de investimento (Res. CVM 20/2021).
