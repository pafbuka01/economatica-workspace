#!/usr/bin/env node
// Passo 1 da atualização incremental: lê o data.json atual e imprime o plano
// de coleta — de que data em diante buscar e quais tickers. Um agente executa
// as chamadas MCP e grava os resultados em data/_upd/<TICKER>.json; depois
// update-apply.mjs funde tudo.
//
// Roda de trás para frente em relação à carga inicial: em vez de 749 pregões
// por papel, relê só a janela de sobreposição — barato o bastante para rodar
// sob demanda.
import { readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OVERLAP = 40;   // pregões relidos, para flagrar reajuste por provento

const db = JSON.parse(readFileSync(join(ROOT, 'data.json'), 'utf8'));
const from = db.dates[Math.max(0, db.dates.length - OVERLAP)];
const hoje = new Date().toISOString().slice(0, 10);
mkdirSync(join(ROOT, 'data', '_upd'), { recursive: true });

console.log(JSON.stringify({
  from, to: hoje,
  asofAtual: db.asof,
  ancora: 'PETR4',
  tickers: Object.keys(db.series),
  destino: join(ROOT, 'data', '_upd'),
}, null, 1));
