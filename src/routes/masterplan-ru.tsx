import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Filter, Select, MultiChip } from "@/components/AppShell";
import { Panel, Kpi, StatusPill, Modal, Tabs } from "@/components/ui";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/masterplan-ru")({
  head: () => ({ meta: [{ title: "MasterPlan Requesting Unit · Procurement Planning" }] }),
  component: Page,
});

const ROWS = Array.from({ length: 12 }, (_, i) => ({
  id: `MP-${String(i+1).padStart(4,"0")}`,
  attivita: ["Servizi cloud Azure","Consulenza M&A","Audit ESG","Manutenzione DC","Implement. SAP","Servizi legal"][i%6],
  owner: ["Mario Rossi","Giulia Verdi","Luca Bianchi","Sara Neri"][i%4],
  fornitore: `Vendor ${i+1}`,
  divisione: ["IT","Finance","Legal","HR"][i%4],
  valore: 30000 + i*7000,
  bdg26: 30000 + i*7000,
  importanza: ["Alta","Media","Bassa"][i%3],
  status: ["Pending","Approved","Draft","Pending","Approved"][i%5],
}));

function Page() {
  const [tab, setTab] = useState("Vista Aggregata");
  const [drill, setDrill] = useState<string | null>(null);

  return (
    <AppShell
      title="MasterPlan · Requesting Unit"
      breadcrumb={["Master Plan", "Requesting Unit"]}
      actions={
        <>
          <button className="btn btn-ghost">↻ Refresh</button>
          <button className="btn btn-ghost">⤓ Export</button>
          <button className="btn btn-danger">Reject All</button>
          <button className="btn btn-primary">✓ Approve All</button>
          <button className="btn btn-success">⚑ Sign-Off Workflow</button>
        </>
      }
      filters={
        <>
          <Filter label="Società"><MultiChip items={["ABC","DEF"]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte","IT","Finance"]} /></Filter>
          <Filter label="Owner Fabbisogno"><Select value="Tutti" options={["Tutti","Mario Rossi"]} /></Filter>
          <Filter label="Fornitore"><Select value="Tutti" options={["Tutti","Vendor 1"]} /></Filter>
          <Filter label="Importanza"><Select value="Tutte" options={["Tutte","Alta","Media","Bassa"]} /></Filter>
          <Filter label="Stato Workflow"><Select value="Tutti" options={["Tutti","Draft","Pending","Approved"]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Fabbisogni assegnati" value={String(ROWS.length)} />
        <Kpi label="Da approvare" value={String(ROWS.filter(r=>r.status==="Pending").length)} delta="14gg residui" trend="down" hint="vs SLA" />
        <Kpi label="Approvati" value={String(ROWS.filter(r=>r.status==="Approved").length)} />
        <Kpi label="Valore in scope" value={`€ ${fmt(ROWS.reduce((s,r)=>s+r.valore,0))}`} />
        <Kpi label="Avanzamento WF" value="62%" delta="+8%" trend="up" />
      </div>

      <Panel>
        <div className="px-3 pt-2">
          <Tabs tabs={["Vista Aggregata", "Drill per Owner", "Drill per Divisione", "Timeline"]} active={tab} onChange={setTab} />
        </div>
        <div className="overflow-auto max-h-[480px]">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h" style={{width:32}}><input type="checkbox" /></th>
                <th className="frozen h" style={{left:32}}>ID Fabbisogno</th>
                <th>Attività</th>
                <th>Owner</th>
                <th>Divisione</th>
                <th>Fornitore Indicato</th>
                <th className="num">Valore Stimato (€)</th>
                <th className="num">BDG 2026</th>
                <th className="num">BDG 2027</th>
                <th className="num">BDG 2028</th>
                <th>Importanza</th>
                <th>Workflow</th>
                <th>Note</th>
                <th>Drill</th>
                <th>Azione</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.id}>
                  <td className="frozen"><input type="checkbox" /></td>
                  <td className="frozen font-semibold" style={{left:32}}>{r.id}</td>
                  <td>{r.attivita}</td>
                  <td>{r.owner}</td>
                  <td>{r.divisione}</td>
                  <td>{r.fornitore}</td>
                  <td className="num">{fmt(r.valore)}</td>
                  <td className="num">{fmt(r.bdg26)}</td>
                  <td className="num">{i%2 ? fmt(Math.round(r.bdg26*0.6)) : "-"}</td>
                  <td className="num">{i%3===0 ? fmt(Math.round(r.bdg26*0.4)) : "-"}</td>
                  <td>{r.importanza}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td className="edit text-[var(--muted-foreground)]">{i%2===0 ? "OK strategia" : ""}</td>
                  <td className="drill" onClick={()=>setDrill(r.id)}>Drill ▾</td>
                  <td>
                    {r.status==="Pending" ? (
                      <div className="flex gap-1">
                        <button className="btn btn-success text-[10px] py-0.5 px-1.5">✓</button>
                        <button className="btn btn-danger text-[10px] py-0.5 px-1.5">✕</button>
                      </div>
                    ) : <span className="text-[var(--muted-foreground)] text-[10px]">—</span>}
                  </td>
                </tr>
              ))}
              <tr className="total">
                <td colSpan={6} className="frozen">TOTALE</td>
                <td className="num">{fmt(ROWS.reduce((s,r)=>s+r.valore,0))}</td>
                <td className="num">{fmt(ROWS.reduce((s,r)=>s+r.bdg26,0))}</td>
                <td colSpan={7}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={!!drill} onClose={()=>setDrill(null)} title={`Drill by Product · ${drill ?? ""}`} subtitle="Distribuzione settimanale · Step di drill-down 2/3">
        <table className="btable">
          <thead><tr><th>Settimana</th><th>Plant</th><th className="num">Procurement (U)</th><th className="num">Cost (€)</th><th className="num">% Coverage</th><th>Stato</th><th>Azione</th></tr></thead>
          <tbody>
            {Array.from({length:8}).map((_,i)=>(
              <tr key={i}>
                <td>Week {32+i}-2026</td>
                <td>Poland Mfg Site</td>
                <td className="num">{fmt(1500+i*60)}</td>
                <td className="num">{fmt(8500+i*400)}</td>
                <td className="num suggest">{60+i*3}%</td>
                <td><StatusPill status={i%2===0?"Approved":"Pending"} /></td>
                <td>
                  <button className="btn btn-success text-[10px] py-0.5 px-1.5">Approve</button>
                  <button className="btn btn-danger text-[10px] py-0.5 px-1.5 ml-1">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </AppShell>
  );
}
