// Harness do terminal. Injeta window.claude.mcp com a FORMA observada nas chamadas
// reais desta sessão (debentures_screen/quote_history, securitizations_screen/get,
// credit_overview, equities_screen/fundamentals_history, news_search). Valores
// sintéticos de propósito. Nada disso vai para a página publicada.
(function(){
  const MODE = new URLSearchParams(location.search).get("mode") || "ok";
  let seed = 11;
  const rnd = () => (seed = (seed*1103515245 + 12345) % 2147483648) / 2147483648;

  const SET = ["Geração, transmissão e distribuição de energia elétrica","Telecomunicações",
    "Água, esgoto e outros sistemas","Serviços ambulatoriais de saúde","Transporte ferroviário",
    "Locadora de automóveis","Indústria de papel, celulose e papelão","Mineração de metais"];
  const SEG = ["Grãos","Logística","Outros","Proteína animal","Açúcar e etanol","Papel e celulose"];
  const LAS = ["Título de Dívida","Créditos","Imobiliário","Agronegócio"];
  const RAT = [null,"AAA(bra) Fitch Ratings","AA+ (bra) Fitch Ratings","brAAA Standard & Poor's",
               "AA- (bra) Fitch Ratings",null,null];
  const CNPJ = i => String(10000000000000 + (i%40));

  const DEB = Array.from({length:1311},(_,i)=>{
    const kind = i%100<46?"DI":(i%100<88?"IPCA":"PREFIXADO");
    const spread = kind==="DI"?(0.3+rnd()*3.5):kind==="IPCA"?(5.5+rnd()*3):(11+rnd()*6);
    const liq = rnd()>0.28;
    const ab = kind==="DI" && rnd()>0.7 ? rnd()*620 : rnd()*40;
    const r = {cnpj:CNPJ(i), code:`DEB${String(i).padStart(4,"0")}`,
      debenture_id:`DEB${String(i).padStart(4,"0")}`,
      debenture_type: kind==="DI"?"DI Spread":kind==="IPCA"?"IPCA Spread":"Prefixado Taxa Pre",
      index_correction:`${kind} + ${spread.toFixed(4).replace(".",",")}%`,
      maturity_date:`20${27+(i%12)}-${String(1+(i%12)).padStart(2,"0")}-15`,
      name:`Emissora ${String.fromCharCode(65+(i%26))}${i%40}`,
      sector_naics:SET[i%SET.length],
      volume_brl:Math.round((3e9-i*2e6)/1e6)*1e6,
      max_drawdown_12m_pct:-Number((rnd()*(kind==="DI"?9:12)).toFixed(2))};
    if(liq){ r.ytm_max_12m_pct=Number((spread+ab/100).toFixed(4));
      r.premium_cdi_12m_pct=Number((60+rnd()*70).toFixed(2));
      r.sharpe_12m=Number((-1.5+rnd()*4).toFixed(2));
      r.volatility_12m_pct=Number((0.1+rnd()*7).toFixed(2)); }
    const rt=RAT[i%RAT.length];
    if(rt){ r.rating=rt; r.covenants_all_met=rnd()>0.12; r.default_event=rnd()>0.97 }
    return r;
  });

  const SEC = Array.from({length:7419},(_,i)=>{
    const cra = i%100<19;
    const ipca = rnd()>0.25;
    const taxa = ipca?(3+rnd()*6):(11+rnd()*6);
    // formato inconsistente de propósito: as duas variantes aparecem na base real
    const ic = ipca ? (i%2 ? `IPCA + ${taxa.toFixed(1).replace(".",",")} %`
                           : `${taxa.toFixed(2).replace(".",",")} a.a + IPCA`)
                    : `PREFIXADO + ${taxa.toFixed(2).replace(".",",")}%`;
    const r = {security_id:`${cra?"CRA":"CRI"}${String(i).padStart(6,"0")}`,
      code:`${cra?"CRA":"CRI"}${String(i).padStart(6,"0")}`,
      asset_class: cra?"cra":"cri",
      isin:`BR${String(i).padStart(9,"0")}`,
      name:`${cra?"Vert":"Opea"} Securitizadora-Série ${i%400}`,
      issuer_name: cra?"VERT Companhia Securitizadora":"Opea Securtizadora",
      index_correction: ic,
      collateral_type: LAS[i%LAS.length], segment: SEG[i%SEG.length],
      issue_date:`20${19+(i%7)}-${String(1+(i%12)).padStart(2,"0")}-15`,
      maturity_date:`20${28+(i%14)}-${String(1+(i%12)).padStart(2,"0")}-15`,
      fiduciary_regime: rnd()>0.1,
      total_certificates: Math.round(rnd()*900000)+50000,
      max_drawdown_12m_pct:-Number((rnd()*11).toFixed(2))};
    if(rnd()>0.35){ r.return_12m_pct=Number((4+rnd()*7).toFixed(2));
      r.premium_cdi_12m_pct=Number((20+rnd()*60).toFixed(2));
      r.ytm_max_12m_pct=Number((taxa+rnd()*2).toFixed(4)); }
    if(rnd()>0.78){ r.rating=["AAA","brAAA (sf)","AA+"][i%3];
      r.rating_agency="Fitch Ratings do Brasil Ltda" }
    if(rnd()>0.6) r.min_subordination_ratio=Number((rnd()*0.35).toFixed(4));
    return r;
  });

  const err=(code,x={})=>Object.assign(new Error(code),{code,message:"mock "+code},x);
  let flaked=false;

  function page(arr, input, idKey){
    const size=input.size||25;
    const start=input.cursor?Number(atob(input.cursor)):0;
    const hits=arr.slice(start,start+size);
    const out={hits,size,total:arr.length};
    if(start+size<arr.length) out.next_cursor=btoa(String(start+size));
    return out;
  }

  window.claude={mcp:{
    async listTools(){
      if(MODE==="noconn") return {servers:[]};
      if(MODE==="reauth") return {servers:[{server:"Economatica Notícias",
        authStatus:"needs_reauth",tools:[]}]};
      return {servers:[{server:"Economatica Notícias",authStatus:"connected",
        tools:["debentures_screen","debentures_quote_history","securitizations_screen",
               "securitizations_get","credit_overview","equities_screen",
               "equities_fundamentals_history","news_search"].map(n=>({name:n,description:""}))}]};
    },
    async callTool(server,tool,input,opts){
      await new Promise(r=>setTimeout(r,12));
      if(MODE==="policy") throw err("blocked_by_policy");
      if(MODE==="toolerr" && tool==="debentures_screen")
        throw err("tool_error",{message:"campo inválido em fields"});
      if(MODE==="flaky" && tool==="debentures_screen" && !flaked){
        flaked=true; throw err("server_unavailable",{retryable:true,retryAfterMs:150});
      }
      const cache = opts&&opts.cache&&!opts.cache.refresh
        ? {storedAt:1785600000000,revalidating:false} : undefined;

      if(tool==="debentures_screen")      return {content:[],payload:page(DEB,input),cache};
      if(tool==="securitizations_screen") return {content:[],payload:page(SEC,input),cache};

      if(tool==="debentures_quote_history"){
        if(MODE==="noseries") return {content:[],payload:{code:input.code,count:0,series:[]}};
        const b=DEB.find(x=>x.code===input.code);
        if(!b) return {content:[],payload:{code:input.code,count:0,series:[]}};
        const sp=parseFloat(b.index_correction.match(/([\d.,]+)%/)[1].replace(",","."));
        const series=Array.from({length:54},(_,k)=>{
          const boom=k>28&&k<40?(k-28)*0.42:(k>=40?2.1-(k-40)*0.07:0);
          const y=Math.max(0.05,sp+boom+rnd()*0.07);
          return {date:new Date(Date.UTC(2025,7,1)+k*7*864e5).toISOString().slice(0,10),
            ytm:Number(y.toFixed(4)),pu_par:Number((100-boom*3).toFixed(2)),
            std_dev:Number((k>30&&k<38?1.5:0.11).toFixed(2)),
            bid_rate:Number((y+0.55).toFixed(4)),ask_rate:Number((y-0.45).toFixed(4)),
            pu:1000,duration_du:880};
        });
        return {content:[],payload:{code:input.code,count:54,granularity:"weekly",series},cache};
      }
      if(tool==="credit_overview"){
        return {content:[],payload:{
          issuer:{cnpj:input.cnpj,name:"Emissora mock",listed:true,sector:"Energia"},
          attention_band:["baixa","média","alta"][Math.floor(rnd()*3)],
          composite_score:Math.round(rnd()*60),
          subscores:{covenant:20,coverage:25,leverage:30,refinancing:10,market_implied:40},
          debentures:[{code:"DEB0001",covenants_all_met:true,default_event:false,
            rating:"AAA(bra) Fitch Ratings",maturity_date:"2030-01-15"}],
          notes:["fundamentos parciais no recorte"],
          disclaimer:"Indicador quantitativo — não é rating."},cache};
      }
      if(tool==="equities_screen"){
        return {content:[],payload:{hits:Array.from({length:100},(_,i)=>({
          ticker:`TCK${i}`,name:`Cia ${i}`,share_class:"ON",cnpj:CNPJ(i)}))},cache};
      }
      if(tool==="equities_fundamentals_history"){
        const qs=["1T2024","2T2024","3T2024","4T2024","1T2025","2T2025","3T2025","4T2025","1T2026"];
        return {content:[],payload:{total:qs.length,hits:qs.map((q,i)=>({
          ticker:input.ticker,name:"Cia mock",quarter_label:q,
          quarter_end_date:`20${q.slice(-2)}-${["03","06","09","12"][i%4]}-30`,
          net_debt_ebitda_ltm:Number((1.1+i*0.22).toFixed(2)),
          roe_ltm_pct:Number((12-i*1.7).toFixed(1)),
          net_margin_ltm_pct:Number((8-i*1.2).toFixed(1)),
          ebitda_margin_ltm_pct:Number((20-i*0.4).toFixed(1)),
          pb_ltm:Number((1.4-i*0.1).toFixed(2)), pe_ltm:Number((14-i*0.8).toFixed(1))}))},cache};
      }
      if(tool==="news_search"){
        const cvm=input.channel==="fato_relevante";
        return {content:[],payload:{total:6,hits:Array.from({length:cvm?4:6},(_,i)=>({
          _id:`m${i}`, title: cvm?`[Fato Relevante] Comunicado ${i}`:`Manchete de mercado ${i}`,
          source: cvm?"CVM":["InfoMoney","Money Times","Mover"][i%3],
          created_at_iso:`2026-0${8-(i%3)}-${String(10+i).padStart(2,"0")}T10:00:00-03:00`,
          sentiment:["negative","neutral","positive"][i%3], impact_score:40+i*7,
          summary:"Resumo sintético para exercitar o layout da lista de notícias do terminal.",
          link: cvm?"https://www.rad.cvm.gov.br/exemplo":"https://exemplo.com/n",
          tickers:[input.tickers?input.tickers[0]:"TCK0"]}))},cache};
      }
      if(tool==="securitizations_get"){
        const s=SEC.find(x=>x.security_id===input.id)||SEC[0];
        return {content:[],payload:{...s,custodian:"Oliveira Trust",offer_type:"Qualificados",
          payment_frequency:"Anual",revolving:false,status:"ativo"},cache};
      }
      throw err("not_in_manifest");
    },
    async invalidate(){}
  }};
})();
