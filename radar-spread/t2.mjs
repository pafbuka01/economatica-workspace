import { chromium } from 'playwright';
import fs from 'fs';
fs.writeFileSync('term-preview.html',
`<!doctype html><html><head><meta charset="utf-8">
<style>*,*::before,*::after{box-sizing:border-box}body{margin:0}</style>
<script>${fs.readFileSync('mock2.js','utf8')}<\/script></head><body>${fs.readFileSync('terminal.html','utf8')}</body></html>`);
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const base='file://'+process.cwd()+'/term-preview.html';
async function run(mode, fn, {shot,scheme='light',vp={width:1600,height:1000}}={}){
  const p=await b.newPage({viewport:vp,colorScheme:scheme,deviceScaleFactor:shot?2:1});
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});
  await p.goto(base+'?mode='+mode);
  await p.waitForTimeout(2600);
  let out={}; try{ out=await fn(p) }catch(e){ out={testErr:String(e).slice(0,120)} }
  if(shot) await p.screenshot({path:shot,fullPage:false});
  console.log(`[${mode}]`, JSON.stringify(out), errs.length?('JS: '+errs.join(' | ')):'');
  await p.close(); return out;
}
// 1. boot + triagem debêntures
await run('ok', async p=>({
  stat: await p.textContent('#stat'),
  tabs: await p.$$eval('.tab', e=>e.map(x=>x.textContent.replace('×',''))),
  rows: await p.$$eval('#views .view.on tbody tr', r=>r.length),
  cov: await p.textContent('#cov'),
}), {shot:'t-triagem.png'});

// 2. troca para CRI/CRA + parser de indexador inconsistente
await run('ok', async p=>{
  await p.click('.seg button[aria-pressed=false]');
  await p.waitForTimeout(500);
  return {rows:await p.$$eval('#views .view.on tbody tr',r=>r.length),
    hasWarn: await p.$$eval('.note.warn', n=>n.length),
    idxChips: await p.$$eval('#views .view.on tbody tr td:nth-child(4)',
      e=>[...new Set(e.slice(0,20).map(x=>x.textContent.trim()))]),
    taxa: await p.$$eval('#views .view.on tbody tr td:nth-child(5)',
      e=>e.slice(0,3).map(x=>x.textContent.trim()))};
}, {shot:'t-cri.png'});

// 3. abrir papel (debênture) → série + gate + crédito
await run('ok', async p=>{
  await p.click('#views .view.on tbody tr');
  await p.waitForTimeout(1400);
  const v='#views .view.on';
  return {tab:(await p.$$eval('.tab[aria-selected=true]',e=>e[0].textContent))?.replace('×',''),
    panes: await p.$$eval(v+' .pane h3', e=>e.map(x=>x.textContent)),
    svg: await p.$$eval(v+' svg', e=>e.length),
    gate: await p.$$eval(v+' .chip', e=>e.map(x=>x.textContent).slice(-1))};
}, {shot:'t-papel.png'});

// 4. comparar: adiciona 3 papéis e sobrepõe
await run('ok', async p=>{
  for(const i of [0,1,2]){
    await p.click(`#views .view.on tbody tr:nth-child(${i+1})`);
    await p.waitForTimeout(900);
    const btn = await p.$('#views .view.on button:has-text("+ Comparar")');
    if(btn) await btn.click();
    await p.click('.navb[data-open="triagem"]'); await p.waitForTimeout(250);
  }
  await p.click('.navb[data-open="comparar"]'); await p.waitForTimeout(2200);
  const v='#views .view.on';
  return {legend: await p.$$eval(v+' .legend span', e=>e.length),
    paths: await p.$$eval(v+' svg path', e=>e.length),
    tblRows: await p.$$eval(v+' tbody tr', e=>e.length)};
}, {shot:'t-comparar.png'});

// 5. emissor: fundamentos + notícia + CVM
await run('ok', async p=>{
  await p.click('#views .view.on tbody tr'); await p.waitForTimeout(1200);
  const eb = await p.$('#views .view.on button:has-text("Ver emissor")');
  if(!eb) return {noBtn:true};
  await eb.click(); await p.waitForTimeout(2200);
  const v='#views .view.on';
  return {h3: await p.$$eval(v+' h3', e=>e.map(x=>x.textContent.slice(0,26))),
    cvmLinks: await p.$$eval(v+' .tl a', e=>e.length),
    svgs: await p.$$eval(v+' svg', e=>e.length)};
}, {shot:'t-emissor.png'});

// 6. erros + dark + mobile
for(const m of ['noconn','reauth','policy']) await run(m, async p=>({
  banner:(await p.textContent('#views .view.on')).trim().slice(0,54)}));
await run('flaky', async p=>({rows:await p.$$eval('#views .view.on tbody tr',r=>r.length)}));
await run('ok', async p=>({ok:1}), {shot:'t-dark.png', scheme:'dark'});
await run('ok', async p=>({
  ovf: await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)
}), {shot:'t-mobile.png', vp:{width:390,height:844}});
await b.close();
