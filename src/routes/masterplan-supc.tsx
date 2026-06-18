import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select, MultiChip } from "@/components/AppShell";
import { Panel, Kpi, StatusPill, Sparkline } from "@/components/ui";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/masterplan-supc")({
  head: () => ({ meta: [{ title: "MasterPlan SUPC · Procurement Planning" }] }),
  component: Page,
});

const STRATEGIES = ["Gara competitiva", "Negoziazione diretta", "Estensione contratto", "Framework agreement"];
const BUYERS = ["Mario Rossi","Giulia Verdi","Luca Bianchi","Sara Neri"];

const ROWS = Array.from({ length: 14 }, (_, i) => ({
  id: `MP-${String(i+101).padStart(4,"0")}`,
  attivita: ["Servizi cloud","Consulenza M&A","Audit ESG","Manutenzione DC","Implement. SAP","Servizi legal"][i%6],
  buyer: BUYERS[i%4],
  fornitore: `Vendor ${i+1}`,
  leadTime: 30 + (i%5)*15,
  strategia: STRATEGIES[i%4],
  valore: 30000 + i*7000,
  tco: Math.round((30000+i*7000) * (1 + (i%5)*0.04)),
  saving: Math.round((30000+i*7000) * 0.05),
  status: ["Pending","Approved","Draft","In Progress"][i%4],
  esg: 60 + (i%4)*10,
  risk: ["Bassa","Media","Alta"][i%3],
}));

function Page() {
  return (
    <AppShell
      title="MasterPlan · SUPC (Buyer)"
      breadcrumb={["Master Plan", "SUPC"]}
      actions={
        <>
          <button className="btn btn-ghost">↻ Simula What-if</button>
          <button className="btn btn-ghost">📎 Allega RFI</button>
          <button className="btn btn-primary">💾 Salva strategia</button>
          <button className="btn btn-success">⚑ Sottometti a Consolidato</button>
        </>
      }
      filters={
        <>
          <Filter label="Buyer"><Select value="Mario Rossi" options={BUYERS} /></Filter>
          <Filter label="Categoria"><MultiChip items={["IT","Servizi"]} /></Filter>
          <Filter label="Lead Time max (gg)"><input type="number" defaultValue={120} className="w-full text-[12px] border rounded px-2 py-1" /></Filter>
          <Filter label="Strategia"><Select value="Tutte" options={["Tutte",...STRATEGIES]} /></Filter>
          <Filter label="Rischio fornitore"><Select value="Tutti" options={["Tutti","Bassa","Media","Alta"]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Fabbisogni in carico" value={String(ROWS.length)} />
        <Kpi label="Spesa pilotata" value={`€ ${fmt(ROWS.reduce((s,r)=>s+r.valore,0))}`} />
        <Kpi label="Saving stimato" value={`€ ${fmt(ROWS.reduce((s,r)=>s+r.saving,0))}`} delta="+5,2%" trend="up" />
        <Kpi label="ESG medio" value="74/100" delta="+3pt" trend="up" />
        <Kpi label="Lead time medio" value="68 gg" delta="-6gg vs Plan" trend="up" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <Panel title="Strategia di procurement (mix)" className="col-span-2">
          <div className="p-3 flex items-center gap-4">
            <div className="flex-1 h-7 flex rounded overflow-hidden border">
              {[["Gara competitiva", 42, "var(--primary)"], ["Negoziazione diretta", 28, "var(--accent)"], ["Estensione", 18, "var(--warning)"], ["Framework", 12, "var(--success)"]].map(([k,v,c])=>(
                <div key={k as string} className="grid place-items-center text-white text-[11px] font-semibold" style={{ width: `${v}%`, background: c as string }}>{v}%</div>
              ))}
            </div>
          </div>
          <div className="px-3 pb-3 grid grid-cols-4 gap-2 text-[11px]">
            {["Gara competitiva","Negoziazione diretta","Estensione","Framework"].map((k,i)=>(
              <div key={k} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{background:["var(--primary)","var(--accent)","var(--warning)","var(--success)"][i]}} />{k}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Kraljic matrix (snapshot)">
          <div className="p-3">
            <div className="grid grid-cols-2 gap-px bg-[var(--border)] aspect-square">
              {[["Leverage","var(--success)"],["Strategic","var(--danger)"],["Non-critical","var(--muted-foreground)"],["Bottleneck","var(--warning)"]].map(([k,c])=>(
                <div key={k as string} className="bg-white p-1.5 flex flex-col">
                  <div className="text-[10px] uppercase tracking-wide" style={{color:c as string}}>{k}</div>
                  <div className="flex-1 grid place-items-center text-[20px] font-bold">{Math.round(Math.random()*40+5)}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Pianificazione SUPC">
        <div className="overflow-auto max-h-[420px]">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h">ID</th>
                <th>Attività</th>
                <th>Buyer</th>
                <th>Fornitore primario</th>
                <th className="num">Lead Time (gg)</th>
                <th>Strategia</th>
                <th className="num">Valore (€)</th>
                <th className="num">TCO (€)</th>
                <th className="num">Δ Saving (€)</th>
                <th className="num">ESG</th>
                <th>Rischio</th>
                <th>Trend prezzo</th>
                <th>Stato</th>
                <th>Note Buyer</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.id}>
                  <td className="frozen font-semibold">{r.id}</td>
                  <td>{r.attivita}</td>
                  <td>{r.buyer}</td>
                  <td className="edit"><input className="bg-transparent w-full" defaultValue={r.fornitore} /></td>
                  <td className="num edit"><input className="bg-transparent w-12 text-right" defaultValue={r.leadTime} /></td>
                  <td className="edit"><select defaultValue={r.strategia} className="bg-transparent text-[11.5px] w-full">{STRATEGIES.map(s=><option key={s}>{s}</option>)}</select></td>
                  <td className="num">{fmt(r.valore)}</td>
                  <td className="num suggest">{fmt(r.tco)}</td>
                  <td className="num suggest">{fmt(r.saving)}</td>
                  <td className="num">
                    <span className="inline-flex items-center gap-1">
                      <span className={`dot ${r.esg>75?"dot-green":r.esg>65?"dot-amber":"dot-red"}`} />{r.esg}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${r.risk==="Alta"?"!bg-[#fbe6e2] !text-[var(--danger)]":r.risk==="Media"?"!bg-[#fff3dc] !text-[var(--warning)]":"!bg-[#e3f1e6] !text-[var(--success)]"}`}>{r.risk}</span>
                  </td>
                  <td><Sparkline values={[10,12,11,13,12,14,15,13,12,14,16,15]} /></td>
                  <td><StatusPill status={r.status} /></td>
                  <td className="edit text-[var(--muted-foreground)]">{i%3===0 ? "Allineato CFO" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
