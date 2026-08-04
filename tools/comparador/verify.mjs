#!/usr/bin/env node
/**
 * Confere o dataset embarcado contra o risk_stats da Economatica.
 *
 *   node tools/comparador/verify.mjs [dirDadosBrutos]
 *
 * Recalcula retorno acumulado, retorno anualizado, volatilidade, drawdown e
 * número de pregões com as mesmas fórmulas do artefato e compara com os valores
 * oficiais gravados em checks.json. Qualquer divergência acima da tolerância
 * indica erro de transcrição da série ou de fórmula — e derruba o build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assets, metricsFor, windowValues } from './build.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHECKS = JSON.parse(fs.readFileSync(path.join(HERE, 'checks.json'), 'utf8'));
const TOL = CHECKS.tolerance.pct;

const FIELDS = [
  ['cum_return_pct', 'cum', 'retorno'],
  ['annualized_return_pct', 'cagr', 'CAGR   '],
  ['volatility_annual_pct', 'vol', 'vol    '],
  ['max_drawdown_pct', 'maxdd', 'drawdown']
];

let failures = 0;
let comparisons = 0;

console.log('\nVerificação contra risk_stats (Economatica)\n' + '='.repeat(64));

for (const win of CHECKS.windows) {
  const bad = [];
  let assetsChecked = 0;

  for (const [id, expect] of Object.entries(win.expect)) {
    const asset = assets[id];
    if (!asset) {
      bad.push(`  ${id}: ausente no dataset`);
      failures++;
      continue;
    }
    /* O risk_stats abre a janela um pregão depois para os fundos, mas não para o
       Ibovespa — daí o override por ativo. É diferença de convenção da API, não
       do dataset: a série embarcada é a mesma nos dois casos. */
    const from = (win.from_overrides && win.from_overrides[id]) || win.from;
    const values = windowValues(asset, from, win.to);
    if (values.length < 2) {
      bad.push(`  ${id}: janela sem dados`);
      failures++;
      continue;
    }
    const got = metricsFor(values);
    assetsChecked++;

    if (got.days !== expect.trading_days) {
      bad.push(`  ${id} pregões: ${got.days} vs ${expect.trading_days} esperados`);
      failures++;
    }

    for (const [key, mine, label] of FIELDS) {
      comparisons++;
      /* O risk_stats devolve o drawdown como magnitude positiva. */
      const ours = key === 'max_drawdown_pct' ? Math.abs(got[mine]) : got[mine];
      const diff = Math.abs(ours - expect[key]);
      const tol = (CHECKS.tolerance.pct_by_asset && CHECKS.tolerance.pct_by_asset[id]) || TOL;
      if (diff > tol) {
        bad.push(
          `  ${id} ${label}: ${ours.toFixed(2)} vs ${expect[key].toFixed(2)} esperado (Δ ${diff.toFixed(2)})`
        );
        failures++;
      }
    }
  }

  const status = bad.length ? 'FALHOU' : 'ok';
  console.log(
    `\n[${status}] janela ${win.id.padEnd(4)} ${win.from} → ${win.to}  ` +
      `(${assetsChecked} ativos)`
  );
  bad.forEach((b) => console.log(b));
}

/* O CDI reconstruído também tem de reproduzir a taxa livre de risco do período. */
console.log('\n' + '-'.repeat(64));
for (const win of CHECKS.windows) {
  const values = windowValues(assets.CDI, win.from, win.to);
  const cagr = metricsFor(values).cagr;
  const diff = Math.abs(cagr - win.risk_free_pct);
  comparisons++;
  const ok = diff <= 0.1;
  if (!ok) failures++;
  console.log(
    `[${ok ? 'ok' : 'FALHOU'}] taxa livre de risco ${win.id.padEnd(4)}: ` +
      `CDI reconstruído ${cagr.toFixed(2)}% vs ${win.risk_free_pct}% do risk_stats`
  );
}

console.log('\n' + '='.repeat(64));
if (failures) {
  console.error(`${failures} divergência(s) em ${comparisons} comparações — build reprovado.`);
  process.exit(1);
}
console.log(`${comparisons} comparações, nenhuma divergência acima de ${TOL} p.p.\n`);
