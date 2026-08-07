#!/usr/bin/env node
// Injeta data.json no template e grava o HTML final no repositório.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || '/home/user/economatica-workspace/tools/long-short-ibov.html';
const tpl = readFileSync(join(ROOT, 'template.html'), 'utf8');
const data = readFileSync(join(ROOT, 'data.json'), 'utf8');
// </script> dentro de string JSON quebraria o parser HTML — escapa por segurança
const safe = data.replace(/</g, '\\u003c');
const marker = 'const DB=/*__DATA__*/null;';
if (!tpl.includes(marker)) throw new Error('marcador __DATA__ não encontrado');
const out = tpl.replace(marker, 'const DB=' + safe + ';');
writeFileSync(OUT, out);
console.log('gravado', OUT, (out.length / 1024).toFixed(0) + 'KB');
