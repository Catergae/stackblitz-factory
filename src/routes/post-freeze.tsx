import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill } from "@/components/ui";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/post-freeze")({
  head: () => ({ meta: [{ title: "Post Freeze · Procurement Planning" }] }),
  component: Page,
});

const REQS = Array.from({length: 9}, (_, i) => ({
  id: `PF-${String(1000+i)}`,
  origMP: `MP-${String(220+i)}`,
  desc: ["Aumento volumi cloud","Riduzione scope consulenza","Nuovo fornitore audit","Anticipo contratto SAP","Estensione manutenzione DC"][i%5],
  buyer: ["Mario Rossi","Giulia Verdi","Luca Bianchi"][i%3],
  delta: (i%2===0?1:-1) * (5000+i*2500),
  reason: ["Variazione perimetro","Riduzione costi","Cambio scope","Anticipo timing"][i%4],
  impact: ["Basso","Medio","Alto"][i%3],
  status: ["Pending","Approved","Pending","Rejected","Pending"][i%5],
}));

function Page() {
  return (
    <AppShell
      title="Post Freeze · gestione modifiche riga MasterPlan"
      breadcrumb={["Freeze & Approval","Post Freeze"]}
      actions={
        <>
          <button className="btn btn-ghost">📋 Storico modifiche</button>
          <button className="btn btn-primary">+ Richiesta modifica</button>
        </>
      }
      filters={
        <>
          <Filter label="Stato"><Select value="Pending" options={["Pending","Approved","Rejected","Tutti"]} /></Filter>
          <Filter label="Impatto"><Select value="Tutti" options={["Tutti","Alto","Medio","Basso"]} /></Filter>
          <Filter label="Buyer"><Select value="Tutti" options={["Tutti","Mario Rossi"]} /></Filter>
          <div className="p-2 bg-[#fde2dd] border border-[#e8c4be] rounded text-[11px] text-[#7a2e22]">
            <b>🧊 Plan freezed</b> dal 30/09/2026. Ogni modifica richiede approvazione del Responsabile SUPC e tracciatura audit.
          </div>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Richieste post-freeze" value={String(REQS.length)} />
        <Kpi label="Pending approval" value={String(REQS.filter(r=>r.status==="Pending").length)} delta="entro 5gg" trend="down" />
        <Kpi label="Δ Spesa cumulato" value={`€ ${fmt(REQS.reduce((s,r)=>s+r.delta,0))}`} delta="su Plan freezed" trend="up" />
        <Kpi label="Impatto Alto" value={String(REQS.filter(r=>r.impact==="Alto").length)} hint="richiede CFO sign-off" />
      </div>

      <Panel title="Richieste di modifica">
        <table className="btable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Riga MP originale</th>
              <th>Descrizione modifica</th>
              <th>Buyer</th>
              <th>Motivazione</th>
              <th className="num">Δ Spesa (€)</th>
              <th>Impatto</th>
              <th>Stato</th>
              <th>Workflow</th>
              <th>Azione</th>
            </tr>
          </thead>
          <tbody>
            {REQS.map(r=>(
              <tr key={r.id}>
                <td className="font-semibold">{r.id}</td>
                <td className="drill">{r.origMP}</td>
                <td className="edit"><input className="bg-transparent w-full" defaultValue={r.desc} /></td>
                <td>{r.buyer}</td>
                <td className="edit">{r.reason}</td>
                <td className={`num font-semibold ${r.delta>0?"text-[var(--danger)]":"text-[var(--success)]"}`}>{r.delta>0?"+":"-"}€ {fmt(Math.abs(r.delta))}</td>
                <td>
                  <span className={`chip ${r.impact==="Alto"?"!bg-[#fbe6e2] !text-[var(--danger)]":r.impact==="Medio"?"!bg-[#fff3dc] !text-[var(--warning)]":""}`}>{r.impact}</span>
                </td>
                <td><StatusPill status={r.status} /></td>
                <td className="text-[10px] text-[var(--muted-foreground)]">SUPC → CFO {r.impact==="Alto"?"→ Board":""}</td>
                <td>
                  {r.status==="Pending" ? (
                    <div className="flex gap-1">
                      <button className="btn btn-success text-[10px] py-0.5 px-1.5">Approva</button>
                      <button className="btn btn-danger text-[10px] py-0.5 px-1.5">Respingi</button>
                    </div>
                  ) : <span className="text-[var(--muted-foreground)] text-[10px]">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Panel title="Audit log · ultimi eventi">
          <div className="divide-y text-[11.5px]">
            {[
              ["18/06 09:32","M. Rossi","Approvata PF-1003","Δ +€7.500","Approved"],
              ["18/06 09:18","S. Neri","Respinta PF-1006","fuori scope","Rejected"],
              ["17/06 16:48","G. Verdi","Creata PF-1008","richiesta CFO","Pending"],
              ["17/06 14:02","Sistema","Lock MP-218 dopo freeze","auto","Info"],
            ].map((r,i)=>(
              <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                <span className="w-24 text-[var(--muted-foreground)]">{r[0]}</span>
                <span className="w-20">{r[1]}</span>
                <span className="flex-1">{r[2]}</span>
                <span className="text-[var(--muted-foreground)]">{r[3]}</span>
                <StatusPill status={r[4]} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Impatto su BDG annuale">
          <div className="p-3 space-y-2 text-[11.5px]">
            {["BDG 2026","BDG 2027","BDG 2028"].map((y,i)=>{
              const d = [+12400, -8800, +3200][i];
              return (
                <div key={y} className="flex items-center gap-2">
                  <span className="w-20 font-semibold">{y}</span>
                  <div className="flex-1 h-3 bg-[var(--muted)] rounded relative">
                    <div className="absolute top-0 bottom-0" style={{
                      left: "50%", width: `${Math.abs(d/300)}%`,
                      background: d>0?"var(--danger)":"var(--success)",
                      transform: d<0?"translateX(-100%)":""
                    }} />
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--border-strong)]" />
                  </div>
                  <span className={`w-24 text-right tabular-nums ${d>0?"text-[var(--danger)]":"text-[var(--success)]"}`}>{d>0?"+":""}€ {fmt(d)}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
