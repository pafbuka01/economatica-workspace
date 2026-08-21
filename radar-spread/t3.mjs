import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const base='file://'+process.cwd()+'/term-preview.html';
const ctx = await b.newContext({viewport:{width:1600,height:1000}});
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,140)));

// --- 1. persistência: marca watchlist, recarrega, confere se sobreviveu
await p.goto(base+'?mode=ok'); await p.waitForTimeout(2400);
await p.click('#views .view.on tbody tr:nth-child(1) .star');
await p.click('#views .view.on tbody tr:nth-child(2) .star');
await p.waitForTimeout(300);
const antes = await p.$$eval('#wl .wl .c', e=>e.map(x=>x.textContent));
await p.reload(); await p.waitForTimeout(2400);
const depois = await p.$$eval('#wl .wl .c', e=>e.map(x=>x.textContent));
console.log('persistência watchlist:', JSON.stringify({antes, depois,
  igual: JSON.stringify(antes)===JSON.stringify(depois)}));

// --- 2. busca global por código
await p.fill('#q','DEB0500'); await p.waitForTimeout(400);
const sugg = await p.$$eval('#sugg div[data-code]', e=>e.map(x=>x.dataset.code).slice(0,3));
await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
const abriu = await p.$eval('.tab[aria-selected=true]', e=>e.textContent.replace('×',''));
console.log('busca global:', JSON.stringify({sugg, abriu}));

// --- 3. papel CRI/CRA deve avisar que não há série, sem gráfico
await p.click('.navb[data-open="triagem"]'); await p.waitForTimeout(400);
await p.click('#views .view.on .seg button[aria-pressed=false]'); await p.waitForTimeout(700);
await p.click('#views .view.on tbody tr:nth-child(1)'); await p.waitForTimeout(1400);
const cri = await p.evaluate(()=>{
  const v=document.querySelector('#views .view.on');
  return {aviso:(v.querySelector('.note.warn h4')||{}).textContent||null,
    graficos:v.querySelectorAll('svg').length,
    temSubord:[...v.querySelectorAll('dt')].some(d=>/Subordina/.test(d.textContent))};
});
console.log('papel CRI/CRA:', JSON.stringify(cri));
await p.close(); await ctx.close();

// --- 4. papel sem marcação (modo noseries)
const p2 = await b.newPage({viewport:{width:1600,height:1000}});
p2.on('pageerror',e=>errs.push(String(e).slice(0,140)));
await p2.goto(base+'?mode=noseries'); await p2.waitForTimeout(2400);
await p2.click('#views .view.on tbody tr:nth-child(1)'); await p2.waitForTimeout(1300);
const ns = await p2.evaluate(()=>{
  const v=document.querySelector('#views .view.on');
  return {txt:(v.textContent.match(/Sem marcação[^.]*\./)||[null])[0],
    graficos:v.querySelectorAll('svg').length};
});
console.log('papel sem série:', JSON.stringify(ns));
await p2.close();
console.log('erros JS:', errs.length?errs.join(' | '):'nenhum');
await b.close();
