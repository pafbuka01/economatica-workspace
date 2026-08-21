import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx = await b.newContext({viewport:{width:1600,height:1000}});
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,150))});
const V='#views .view.on';
const base='file://'+process.cwd()+'/term-preview.html?mode=ok';
await p.goto(base); await p.waitForTimeout(2500);
const R={};

// A. abrir 3 papéis e FECHAR o do meio pelo ×
for(const n of [1,2,3]){ await p.click(`${V} tbody tr:nth-child(${n})`); await p.waitForTimeout(700);
  await p.click('.navb[data-open="triagem"]'); await p.waitForTimeout(200); }
const antesTabs = await p.$$eval('.tab', e=>e.map(x=>x.textContent.replace('×','')));
await p.click('.tab:nth-child(4) .x'); await p.waitForTimeout(400);
R.fecharAba = {antes:antesTabs.length, depois:(await p.$$eval('.tab',e=>e.length)),
  sobrouViewOrfa: await p.$$eval('#views section', e=>e.length)};

// B. ordenação: clicar 2x inverte direção e o topo muda
await p.click('.navb[data-open="triagem"]'); await p.waitForTimeout(300);
await p.click('th[data-k="volume_brl"]'); await p.waitForTimeout(400);
const desc = await p.$eval(`${V} tbody tr:first-child td:nth-child(10)`, e=>e.textContent.trim());
await p.click('th[data-k="volume_brl"]'); await p.waitForTimeout(400);
const asc = await p.$eval(`${V} tbody tr:first-child td:nth-child(10)`, e=>e.textContent.trim());
R.ordenacao = {desc, asc, inverteu: desc!==asc,
  aria: await p.$eval('th[data-k="volume_brl"]', e=>e.getAttribute('aria-sort'))};

// C. filtro de setor reduz o conjunto
const setorAntes = await p.$$eval(`${V} tbody tr`, e=>e.length);
const setorNome = await p.$eval(`${V} #tsec option:nth-child(3)`, e=>e.value);
await p.selectOption(`${V} #tsec`, {index:2}); await p.waitForTimeout(500);
const setores = await p.$$eval(`${V} tbody tr td:nth-child(2) .nm`, e=>[...new Set(e.map(x=>x.textContent))]);
R.filtroSetor = {linhasAntes:setorAntes, linhasDepois:await p.$$eval(`${V} tbody tr`, e=>e.length),
  setoresDistintos:setores.length, bateComFiltro: setores.length===1 && setores[0]===setorNome};
await p.selectOption(`${V} #tsec`, {index:0}); await p.waitForTimeout(400);

// D. "Mostrar mais" aumenta as linhas
const l1 = await p.$$eval(`${V} tbody tr`, e=>e.length);
await p.click(`${V} button:has-text("Mostrar mais")`); await p.waitForTimeout(600);
R.mostrarMais = {antes:l1, depois:await p.$$eval(`${V} tbody tr`, e=>e.length)};

// E. CRI/CRA: "Carregar mais 300"
await p.click(`${V} .seg button[aria-pressed=false]`); await p.waitForTimeout(700);
const cov1 = await p.$eval('#cov', e=>e.textContent);
await p.click('#more-sec'); await p.waitForTimeout(2200);
R.carregarMais = {antes:cov1.match(/CRI \+ CRA(\d+)/)?.[1],
  depois:(await p.$eval('#cov',e=>e.textContent)).match(/CRI \+ CRA(\d+)/)?.[1]};

// F. comparador: teto de 6 papéis
await p.click('.navb[data-open="triagem"]'); await p.waitForTimeout(300);
await p.click(`${V} .seg button[aria-pressed=false]`); await p.waitForTimeout(600); // volta p/ deb
await p.evaluate(()=>{ // adiciona 8 direto no estado, exercitando o corte
  const codes = S.deb.rows.slice(0,8).map(r=>r._code);
  codes.forEach(c=>addToCompare(c));
});
await p.click('.navb[data-open="comparar"]'); await p.waitForTimeout(3000);
R.tetoComparar = {noEstado: await p.evaluate(()=>S.cmp.length),
  linhas: await p.$$eval(`${V} tbody tr`, e=>e.length),
  paths: await p.$$eval(`${V} svg path`, e=>e.length)};

// G. modo "vs contratual" muda os valores plotados
const yAbs = await p.$$eval(`${V} svg text`, e=>e.slice(0,5).map(x=>x.textContent));
await p.click(`${V} .seg button:has-text("vs contratual")`); await p.waitForTimeout(2500);
const yRel = await p.$$eval(`${V} svg text`, e=>e.slice(0,5).map(x=>x.textContent));
R.vsContratual = {absoluto:yAbs.slice(0,3), relativo:yRel.slice(0,3), mudou: yAbs.join()!==yRel.join()};

// H. abrir papel pela watchlist + remover pelo ×
await p.click('.navb[data-open="triagem"]'); await p.waitForTimeout(400);
await p.click(`${V} tbody tr:first-child .star`); await p.waitForTimeout(300);
const wlCode = await p.$eval('#wl .wl .c', e=>e.textContent);
await p.click('#wl .wl .c'); await p.waitForTimeout(1200);
R.watchlist = {abriu: (await p.$eval('.tab[aria-selected=true]',e=>e.textContent.replace('×',''))) === wlCode};
await p.hover('#wl .wl'); await p.click('#wl .wl .rm'); await p.waitForTimeout(400);
R.watchlist.removeu = (await p.$$eval('#wl .wl', e=>e.length)) === 0;

// I. Escape fecha sugestão
await p.fill('#q','DEB'); await p.waitForTimeout(400);
const sOn = await p.$eval('#sugg', e=>e.classList.contains('on'));
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
R.escape = {abriu:sOn, fechou: !(await p.$eval('#sugg', e=>e.classList.contains('on')))};

for(const [k,v] of Object.entries(R)) console.log(k.padEnd(14), JSON.stringify(v));
console.log('erros JS:', errs.length?errs.join(' | '):'nenhum');
await b.close();
