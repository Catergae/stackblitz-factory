import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill } from "@/components/ui";

export const Route = createFileRoute("/attivita")({
  head: () => ({ meta: [{ title: "Planning Attività · Procurement Planning" }] }),
  component: Page,
});

const PHASES = ["Backlog","Scoping","RFx","Negoziazione","Contratto","Chiuso"];

const ACTIVITIES = Array.from({length: 22}, (_, i) => ({
  id: `ACT-${String(1000+i)}`,
  desc: ["Gara energia 2027","Framework cloud DR","Rinnovo licenze SAP","Consulenza M&A advisory","Audit ESG annuale","RDA HW datacenter"][i%6],
  buyer: ["Mario Rossi","Giulia Verdi","Luca Bianchi","Sara Neri"][i%4],
  category: ["IT","Energy","HR","Logistica","Servizi"][i%5],
  phase: PHASES[i%PHASES.length],
  due: `2026-${String(7+(i%6)).padStart(2,"0")}-${String(1+(i%27)).padStart(2,"0")}`,
  value: 25000+i*4500,
  effort: 1 + (i%5)*0.5,
  status: ["On-Track","On-Track","Late","On-Track","Risk"][i%5],
}));

function Page() {
  return (
    <AppShell
      title="Planning Attività (Pipeline Buyer)"
      breadcrumb={["Procurement Execution","Planning Attività"]}
      actions={
        <>
          <button className="btn btn-ghost">📅 Vista Calendar</button>
          <button className="btn btn-ghost">📊 Vista Kanban</button>
          <button className="btn btn-primary">+ Nuova Attività</button>
        </>
      }
      filters={
        <>
          <Filter label="Vista"><Select value="Le mie attività" options={["Le mie attività","Tutta categoria","Team"]} /></Filter>
          <Filter label="Buyer"><Select value="Mario Rossi" options={["Mario Rossi","Giulia Verdi","Luca Bianchi"]} /></Filter>
          <Filter label="Fase"><Select value="Tutte" options={["Tutte",...PHASES]} /></Filter>
          <Filter label="Stato"><Select value="Tutti" options={["Tutti","On-Track","Late","Risk"]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Attività in pipeline" value={String(ACTIVITIES.length)} />
        <Kpi label="In ritardo" value={String(ACTIVITIES.filter(a=>a.status==="Late").length)} delta="vs prev." trend="down" />
        <Kpi label="A rischio" value={String(ACTIVITIES.filter(a=>a.status==="Risk").length)} />
        <Kpi label="Effort totale (FTE)" value={ACTIVITIES.reduce((s,a)=>s+a.effort,0).toFixed(1)} />
        <Kpi label="Chiusure previste Q3" value="11" delta="+3" trend="up" />
      </div>

      <Panel title="Pipeline · Kanban view" className="mb-3">
        <div className="p-2 grid grid-cols-6 gap-2">
          {PHASES.map(ph => {
            const items = ACTIVITIES.filter(a=>a.phase===ph);
            return (
              <div key={ph} className="bg-[var(--surface-2)] rounded border p-2 min-h-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] font-semibold">{ph}</div>
                  <span className="chip">{items.length}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map(a=>(
                    <div key={a.id} className="bg-white border rounded p-1.5 text-[11px] shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{a.id}</span>
                        <StatusPill status={a.status==="Late"?"Rejected":a.status==="Risk"?"Pending":"Approved"} />
                      </div>
                      <div className="truncate mt-0.5" title={a.desc}>{a.desc}</div>
                      <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
                        <span>{a.buyer.split(" ")[0]}</span>
                        <span>{a.due}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Attività in corso · vista tabellare">
        <table className="btable">
          <thead><tr><th>ID</th><th>Attività</th><th>Buyer</th><th>Categoria</th><th>Fase</th><th>Due Date</th><th className="num">Valore (€)</th><th className="num">Effort (FTE)</th><th>Status</th><th>Azione</th></tr></thead>
          <tbody>
            {ACTIVITIES.map(a=>(
              <tr key={a.id}>
                <td className="font-semibold">{a.id}</td>
                <td>{a.desc}</td>
                <td>{a.buyer}</td>
                <td>{a.category}</td>
                <td><StatusPill status={a.phase==="Chiuso"?"Approved":a.phase==="Backlog"?"Draft":"In Progress"} /></td>
                <td>{a.due}</td>
                <td className="num">{a.value.toLocaleString("it-IT")}</td>
                <td className="num">{a.effort.toFixed(1)}</td>
                <td>
                  <span className={`chip ${a.status==="Late"?"!bg-[#fbe6e2] !text-[var(--danger)]":a.status==="Risk"?"!bg-[#fff3dc] !text-[var(--warning)]":"!bg-[#e3f1e6] !text-[var(--success)]"}`}>{a.status}</span>
                </td>
                <td><button className="btn btn-ghost text-[10px]">Apri</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </AppShell>
  );
}
