import { chromium } from 'playwright';
import fs from 'fs';
const body = fs.readFileSync('dashboard.html','utf8');
const mock = fs.readFileSync('mock.js','utf8');
fs.writeFileSync('dash-preview.html',
`<!doctype html><html><head><meta charset="utf-8">
<style>*,*::before,*::after{box-sizing:border-box}body{margin:0}</style>
<script>${mock}<\/script></head><body>${body}</body></html>`);

const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const base = 'file://'+process.cwd()+'/dash-preview.html';

async function run(mode, fn, {shot, scheme='light', vp={width:1440,height:1100}}={}) {
  const p = await b.newPage({viewport:vp, colorScheme:scheme, deviceScaleFactor: shot?2:1});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto(base+'?mode='+mode);
  await p.waitForTimeout(1800);
  const out = await fn(p);
  if(shot) await p.screenshot({path:shot, fullPage:false});
  console.log(`[${mode}]`, JSON.stringify(out), errs.length?('ERR: '+errs.join(' | ')):'');
  await p.close();
  return out;
}

// 1. caminho feliz: varredura completa + KPIs
await run('ok', async p=>({
  status: await p.textContent('#status'),
  rows: await p.$$eval('#body tr', r=>r.length),
  kpis: await p.$$eval('.kpi .v', e=>e.map(x=>x.textContent)),
  more: (await p.textContent('#more')).trim().slice(0,40),
}), {shot:'dash-ok.png'});

// 2. ordenação + filtro + painel
await run('ok', async p=>{
  await p.click('#seg-idx button[data-v="DI"]');
  await p.waitForTimeout(200);
  const diOnly = await p.$$eval('#body tr .chip', e=>[...new Set(e.map(x=>x.textContent))]);
  await p.click('th[data-k="_abriu"]');           // ordena por abertura
  await p.waitForTimeout(200);
  const top = await p.$$eval('#body tr td:nth-child(6)', e=>e.slice(0,3).map(x=>x.textContent.trim()));
  await p.click('#body tr');                       // abre painel
  await p.waitForTimeout(700);
  return {diOnly, topAbriu: top,
    panelOpen: await p.$eval('#panel', e=>e.classList.contains('open')),
    panelHas: (await p.textContent('#panel-body')).includes('Marcação'),
    svg: await p.$$eval('#ser svg', e=>e.length)};
}, {shot:'dash-panel.png'});

// 3. retentativa: server_unavailable retryable no meio da paginação
await run('flaky', async p=>({rows: await p.$$eval('#body tr', r=>r.length),
  banner: (await p.textContent('#banner')).trim().slice(0,60)}));

// 4-6. ramos de erro
for (const m of ['noconn','reauth','toolerr','policy']) {
  await run(m, async p=>({banner:(await p.textContent('#banner')).trim().slice(0,72),
    empty: await p.$eval('#empty', e=>!e.hidden)}));
}

// 7. série vazia (papel ilíquido)
await run('noseries', async p=>{
  await p.click('#body tr'); await p.waitForTimeout(500);
  return {msg:(await p.textContent('#ser')).trim().slice(0,60)};
});

// 8. dark + mobile
await run('ok', async p=>({ok:true}), {shot:'dash-dark.png', scheme:'dark'});
await run('ok', async p=>({
  overflow: await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)
}), {shot:'dash-mobile.png', vp:{width:390,height:844}});

await b.close();
