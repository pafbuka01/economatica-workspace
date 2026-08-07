// Harness de teste: injeta um window.claude.mcp com a FORMA de resposta observada
// nas chamadas reais desta sessão. Os valores são sintéticos de propósito — serve
// para exercitar paginação, render, ordenação, filtros, painel e os ramos de erro.
// Nada disso vai para a página publicada.
(function(){
  const MODE = new URLSearchParams(location.search).get("mode") || "ok";
  const N = 1311;
  const SET = ["Geração, transmissão e distribuição de energia elétrica","Telecomunicações",
    "Água, esgoto e outros sistemas","Serviços ambulatoriais de saúde","Transporte ferroviário",
    "Locadora de automóveis","Indústria de papel, celulose e papelão","Mineração de metais"];
  const RAT = [null,"AAA(bra) Fitch Ratings","AA+ (bra) Fitch Ratings","brAAA Standard & Poor's",
               "AA- (bra) Fitch Ratings",null,null];
  // gerador determinístico (sem Math.random, pra o teste ser reproduzível)
  let seed = 7;
  const rnd = () => (seed = (seed*1103515245 + 12345) % 2147483648) / 2147483648;

  const ALL = Array.from({length:N}, (_,i)=>{
    const kind = i%100 < 46 ? "DI" : (i%100 < 88 ? "IPCA" : "PREFIXADO");
    const spread = kind==="DI" ? (0.3 + rnd()*3.5) : kind==="IPCA" ? (5.5+rnd()*3) : (11+rnd()*6);
    const liquido = rnd() > 0.28;
    const abriuBps = kind==="DI" && rnd()>0.72 ? rnd()*600 : rnd()*40;
    const row = {
      cnpj: String(10000000000000+i),
      code: `PAP${String(i).padStart(4,"0")}`,
      debenture_id: `PAP${String(i).padStart(4,"0")}`,
      debenture_type: kind==="DI"?"DI Spread":kind==="IPCA"?"IPCA Spread":"Prefixado Taxa Pre",
      index_correction: `${kind} + ${spread.toFixed(4).replace(".",",")}%`,
      maturity_date: `20${27+(i%12)}-${String(1+(i%12)).padStart(2,"0")}-15`,
      name: `Emissor ${String.fromCharCode(65+(i%26))}${i%40}`,
      sector_naics: SET[i%SET.length],
      volume_brl: Math.round((3e9 - i*2e6)/1e6)*1e6,
      max_drawdown_12m_pct: -Number((rnd()*(kind==="DI"?8:12)).toFixed(2)),
    };
    if(liquido){
      row.ytm_max_12m_pct = Number((spread + abriuBps/100).toFixed(4));
      row.premium_cdi_12m_pct = Number((60+rnd()*70).toFixed(2));
      row.sharpe_12m = Number((-1.5+rnd()*4).toFixed(2));
      row.volatility_12m_pct = Number((0.1+rnd()*7).toFixed(2));
    }
    const r = RAT[i%RAT.length];
    if(r){ row.rating = r; row.covenants_all_met = rnd()>0.12; row.default_event = rnd()>0.97; }
    return row;
  });

  const err = (code, extra={}) => Object.assign(new Error(code), {code, message:"mock "+code}, extra);
  let unavailCount = 0;

  window.claude = {
    mcp: {
      async listTools(){
        if(MODE==="noconn") return {servers:[]};
        if(MODE==="reauth") return {servers:[{server:"Economatica Notícias",
          authStatus:"needs_reauth", tools:[]}]};
        if(MODE==="listfail") throw err("upstream_error");
        return {servers:[{server:"Economatica Notícias", authStatus:"connected",
          tools:[{name:"debentures_screen",description:""},
                 {name:"debentures_quote_history",description:""}]}]};
      },
      async callTool(server, tool, input, opts){
        await new Promise(r=>setTimeout(r, 30));
        if(MODE==="toolerr") throw err("tool_error", {message:"parâmetro inválido"});
        if(MODE==="policy") throw err("blocked_by_policy");
        if(MODE==="flaky" && tool==="debentures_screen" && unavailCount++ === 1)
          throw err("server_unavailable", {retryable:true, retryAfterMs:200});
        if(tool==="debentures_screen"){
          const size = input.size || 25;
          const start = input.cursor ? Number(atob(input.cursor)) : 0;
          const hits = ALL.slice(start, start+size);
          const next = start+size < ALL.length ? btoa(String(start+size)) : undefined;
          const out = {hits, size, total: ALL.length};
          if(next) out.next_cursor = next;
          return {content:[], payload: out,
                  cache: opts && opts.cache && !opts.cache.refresh
                    ? {storedAt: 1785000000000, revalidating:false} : undefined};
        }
        if(tool==="debentures_quote_history"){
          if(MODE==="noseries") return {content:[], payload:{code:input.code, count:0, series:[]}};
          const base = ALL.find(x=>x.code===input.code);
          const sp = parseFloat(base.index_correction.match(/([\d.,]+)%/)[1].replace(",","."));
          const series = Array.from({length:54},(_,k)=>{
            const boom = k>28 && k<40 ? (k-28)*0.45 : (k>=40 ? 2.2 - (k-40)*0.08 : 0);
            const y = Math.max(0.05, sp + boom + rnd()*0.08);
            const dt = new Date(Date.UTC(2025,7,1) + k*7*864e5);
            return {date: dt.toISOString().slice(0,10),
              ytm:Number(y.toFixed(4)), pu_par:Number((100-boom*3).toFixed(2)),
              std_dev:Number((k>30&&k<38?1.4:0.12).toFixed(2)),
              bid_rate:Number((y+0.6).toFixed(4)), ask_rate:Number((y-0.5).toFixed(4)),
              pu:1000, duration_du:900};
          });
          return {content:[], payload:{code:input.code, count:series.length,
            granularity:"weekly", series}};
        }
        throw err("not_in_manifest");
      },
      async invalidate(){}
    }
  };
})();
