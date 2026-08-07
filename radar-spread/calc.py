import json, statistics as st
from series import SERIES, META

def pct_rank(vals, x):
    return 100.0 * sum(1 for v in vals if v <= x) / len(vals)

out = {}
for code, rows in SERIES.items():
    d = [r[0] for r in rows]; y = [r[1] for r in rows]
    pu = [r[2] for r in rows]; sd = [r[3] for r in rows]
    bid = [r[4] for r in rows]; ask = [r[5] for r in rows]
    m = META[code]

    atual = y[-1]
    mediana = st.median(y); media = st.mean(y); desvio = st.pstdev(y)
    mn, mx = min(y), max(y)
    i_mn, i_mx = y.index(mn), y.index(mx)

    # baseline pré-estresse: mediana das 12 primeiras semanas (ago-out/25, regime calmo)
    base = st.median(y[:12]); base_sd = st.pstdev(y[:12])

    # z-score na janela cheia (conservador: o proprio evento infla o desvio)
    z_full = (atual - media) / desvio if desvio else 0
    # z contra o regime calmo (mede o tamanho da abertura)
    z_base = (atual - base) / base_sd if base_sd else 0

    # deltas (serie semanal: ~4 sem = 1m, ~13 sem = 3m)
    d1m = (atual - y[-5]) * 100
    d3m = (atual - y[-14]) * 100
    d6m = (atual - y[-27]) * 100

    # gate de qualidade: limiar ABSOLUTO sobre a dispersao entre marcacoes (p.p. de taxa).
    # percentil sozinho gera falso positivo em papel de historia ultracalma (0,14 vira "alto"
    # so porque a mediana era 0,02), entao o absoluto manda e o percentil e' so contexto.
    sd_atual = sd[-1]; sd_p = pct_rank(sd, sd_atual)
    ba = (bid[-1] - ask[-1]) * 100 if ask[-1] is not None else None
    ba_hist = [(b - a) * 100 for b, a in zip(bid, ask) if a is not None]
    ba_p = pct_rank(ba_hist, ba) if ba is not None else None
    if sd_atual <= 0.30:   gate = "limpo"
    elif sd_atual <= 0.80: gate = "atencao"
    else:                  gate = "sujo"

    # estagio do movimento: o trade ja andou ou o spread segue aberto?
    if d1m > 25 or d3m > 75:      estagio = "abrindo"
    elif d3m < -150:              estagio = "fechando"
    else:                         estagio = "estacionado"

    out[code] = dict(
        code=code, **m,
        atual=round(atual, 4),
        vs_contratual_bps=round((atual - m["contratual"]) * 100),
        mediana=round(mediana, 4), base=round(base, 4),
        min=round(mn, 4), min_data=d[i_mn], max=round(mx, 4), max_data=d[i_mx],
        aberto_vs_base_bps=round((atual - base) * 100),
        aberto_vs_min_bps=round((atual - mn) * 100),
        retracao_do_pico_bps=round((mx - atual) * 100),
        pct_do_pico_retido=round(100 * (atual - base) / (mx - base), 1) if mx > base else None,
        percentil=round(pct_rank(y, atual), 1),
        z_full=round(z_full, 2), z_base=round(z_base, 2),
        d1m_bps=round(d1m), d3m_bps=round(d3m), d6m_bps=round(d6m),
        pu_par=pu[-1], pu_min=min(pu), pu_min_data=d[pu.index(min(pu))],
        sd_atual=sd_atual, sd_percentil=round(sd_p, 1), sd_max=max(sd),
        bid_ask_bps=round(ba) if ba is not None else None,
        bid_ask_percentil=round(ba_p, 1) if ba_p is not None else None,
        gate=gate, estagio=estagio, pontos=len(y), inicio=d[0], fim=d[-1],
        serie=[{"d": dd, "y": round(yy, 4), "pu": pp, "sd": ss} for dd, yy, pp, ss in zip(d, y, pu, sd)],
    )

hdr = f"{'code':8} {'atual':>6} {'calmo':>6} {'abriu':>7} {'retido':>7} {'pctl':>5} {'zjan':>5} {'d1m':>6} {'d3m':>6} {'disp':>5} {'b/a':>5} {'gate':>8} {'estagio':>12}"
print(hdr); print("-" * len(hdr))
for c, r in sorted(out.items(), key=lambda kv: -kv[1]["aberto_vs_base_bps"]):
    print(f"{c:8} {r['atual']:6.2f} {r['base']:6.2f} {r['aberto_vs_base_bps']:6}b "
          f"{str(r['pct_do_pico_retido'])+'%':>7} {r['percentil']:4.0f}% {r['z_full']:5.2f} "
          f"{r['d1m_bps']:5}b {r['d3m_bps']:5}b {r['sd_atual']:5.2f} {r['bid_ask_bps']:4}b "
          f"{r['gate']:>8} {r['estagio']:>12}")

json.dump(out, open("radar.json", "w"), ensure_ascii=False, indent=1)
print("\nradar.json escrito com", len(out), "papéis")
