import json, statistics as st
from series import SERIES, META
from series2 import SERIES2, META2

ALL = {**SERIES, **SERIES2}
ALLMETA = {**META, **META2}

# Janela do regime calmo, por DATA e não por índice: o HAPVA0 só passa a ser
# marcado em 28/nov/25 e uma base por posição pegaria o estresse como "calmaria".
BASE_ATE = "2025-11-01"

def pct_rank(vals, x):
    return 100.0 * sum(1 for v in vals if v <= x) / len(vals)

out = {}
for code, rows in ALL.items():
    d = [r[0] for r in rows]; y = [r[1] for r in rows]
    pu = [r[2] for r in rows]; sd = [r[3] for r in rows]
    bid = [r[4] for r in rows]; ask = [r[5] for r in rows]
    m = ALLMETA[code]

    atual = y[-1]
    media = st.mean(y); desvio = st.pstdev(y); mediana = st.median(y)
    mn, mx = min(y), max(y)
    i_mn, i_mx = y.index(mn), y.index(mx)

    calmo = [v for dd, v in zip(d, y) if dd < BASE_ATE]
    base_parcial = len(calmo) < 8
    if base_parcial:                 # sem regime calmo observado: usa o mínimo da série
        base = mn                    # como piso conservador e sinaliza a limitação
    else:
        base = st.median(calmo)

    z_full = (atual - media) / desvio if desvio else 0

    d1m = (atual - y[-5]) * 100
    d3m = (atual - y[-14]) * 100
    d6m = (atual - y[-27]) * 100 if len(y) >= 27 else None

    sd_atual = sd[-1]; sd_p = pct_rank(sd, sd_atual)
    ba = (bid[-1] - ask[-1]) * 100 if ask[-1] is not None else None
    ba_hist = [(b - a) * 100 for b, a in zip(bid, ask) if a is not None]
    ba_p = pct_rank(ba_hist, ba) if ba is not None else None

    # gate por limiar ABSOLUTO de dispersão; o bid/ask entra como segunda trava,
    # porque papel pode ter dispersão baixa e mesmo assim não ter mercado dos dois lados.
    if sd_atual <= 0.30 and (ba is None or ba <= 200):   gate = "limpo"
    elif sd_atual <= 0.80 and (ba is None or ba <= 300): gate = "atencao"
    else:                                                gate = "sujo"

    # "abrindo" = subindo no curto E sem estar devolvendo no médio. O teste de 1 mês
    # sozinho confunde repique com tendência; o de 3 meses sozinho perde a virada recente.
    if (d1m > 15 and d3m > 0) or d3m > 75: estagio = "abrindo"
    elif d3m < -150:                       estagio = "fechando"
    else:                                  estagio = "estacionado"

    out[code] = dict(
        code=code, **m,
        atual=round(atual, 4),
        vs_contratual_bps=round((atual - m["contratual"]) * 100),
        mediana=round(mediana, 4), base=round(base, 4), base_parcial=base_parcial,
        min=round(mn, 4), min_data=d[i_mn], max=round(mx, 4), max_data=d[i_mx],
        aberto_vs_base_bps=round((atual - base) * 100),
        retracao_do_pico_bps=round((mx - atual) * 100),
        pct_do_pico_retido=round(100 * (atual - base) / (mx - base), 1) if mx > base else None,
        percentil=round(pct_rank(y, atual), 1),
        z_full=round(z_full, 2),
        d1m_bps=round(d1m), d3m_bps=round(d3m), d6m_bps=round(d6m) if d6m is not None else None,
        pu_par=pu[-1], pu_min=min(pu), pu_min_data=d[pu.index(min(pu))],
        sd_atual=sd_atual, sd_percentil=round(sd_p, 1), sd_max=max(sd),
        bid_ask_bps=round(ba) if ba is not None else None,
        bid_ask_percentil=round(ba_p, 1) if ba_p is not None else None,
        gate=gate, estagio=estagio, pontos=len(y), inicio=d[0], fim=d[-1],
        serie=[{"d": dd, "y": round(yy, 4), "sd": ss} for dd, yy, ss in zip(d, y, sd)],
    )

hdr = (f"{'code':8} {'emissor':22} {'atual':>6} {'calmo':>6} {'abriu':>7} {'retido':>7} "
       f"{'pctl':>5} {'d1m':>6} {'d3m':>6} {'disp':>5} {'b/a':>6} {'gate':>8} {'estagio':>12}")
print(hdr); print("-" * len(hdr))
for c, r in sorted(out.items(), key=lambda kv: -kv[1]["aberto_vs_base_bps"]):
    ba = f"{r['bid_ask_bps']:5}b" if r["bid_ask_bps"] is not None else "    —"
    ret = f"{r['pct_do_pico_retido']}%" if r["pct_do_pico_retido"] is not None else "—"
    print(f"{c:8} {r['nome'][:22]:22} {r['atual']:6.2f} {r['base']:6.2f} "
          f"{r['aberto_vs_base_bps']:6}b {ret:>7} {r['percentil']:4.0f}% "
          f"{r['d1m_bps']:5}b {r['d3m_bps']:5}b {r['sd_atual']:5.2f} {ba} "
          f"{r['gate']:>8} {r['estagio']:>12}" + ("  [base parcial]" if r["base_parcial"] else ""))

json.dump(out, open("radar.json", "w"), ensure_ascii=False, indent=1)
print(f"\nradar.json: {len(out)} papéis | "
      f"limpos {sum(1 for r in out.values() if r['gate']=='limpo')} | "
      f"abrindo {sum(1 for r in out.values() if r['estagio']=='abrindo')}")
