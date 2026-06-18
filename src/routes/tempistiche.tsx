import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, Tabs } from "@/components/ui";
import { useState } from "react";

export const Route = createFileRoute("/tempistiche")({
  head: () => ({ meta: [{ title: "Tempistiche ed Effort · Settings" }] }),
  component: Page,
});

const PROC = [
  ["CI - Contratto Indipendente", 30, 14, 0.4, "Bassa"],
  ["CV - Contratto Vincolato", 60, 28, 0.8, "Media"],
  ["OQ - Open Quotation", 90, 45, 1.2, "Alta"],
  ["Gara competitiva > €100K", 120, 60, 2.0, "Alta"],
  ["Framework agreement", 150, 75, 2.5, "Alta"],
];

function Page() {
  const [tab, setTab] = useState("Lead Time");
  return (
    <AppShell
      title="Tempistiche ed Effort · Settings amministratore"
      breadcrumb={["Admin","Tempistiche ed Effort"]}
      actions={
        <>
          <button className="btn btn-ghost">↶ Annulla</button>
          <button className="btn btn-primary">💾 Salva configurazione</button>
          <button className="btn btn-success">📤 Pubblica parametri</button>
        </>
      }
      filters={
        <>
          <Filter label="Versione parametri"><Select value="v.2026.06" options={["v.2026.06 (draft)","v.2026.05 (current)"]} /></Filter>
          <Filter label="Categoria"><Select value="Tutte" options={["Tutte","IT","Energy"]} /></Filter>
          <div className="p-2 bg-[#fff7d6] border border-[#e4d49a] rounded text-[11px]">
            <b>⚙ Settings:</b> i parametri impattano lead time, capacity buyer, calcolo SLA e alert workflow.
          </div>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Tipologie contratto" value={String(PROC.length)} />
        <Kpi label="Lead time medio" value="90 gg" />
        <Kpi label="Effort medio" value="1,4 FTE" />
        <Kpi label="Buffer planning" value="14 gg" hint="su data freeze" />
      </div>

      <Panel>
        <div className="px-3 pt-2">
          <Tabs tabs={["Lead Time","Effort","Capacity Model","SLA & Alert","Calendar"]} active={tab} onChange={setTab} />
        </div>
        {tab === "Lead Time" && (
          <table className="btable">
            <thead><tr><th>Tipologia procurement</th><th className="num">Lead time std (gg)</th><th className="num">Min (gg)</th><th className="num">Effort (FTE)</th><th>Complessità</th><th>Note</th></tr></thead>
            <tbody>
              {PROC.map((r,i)=>(
                <tr key={i}>
                  <td className="font-semibold">{r[0]}</td>
                  <td className="num edit"><input className="bg-transparent w-12 text-right" defaultValue={r[1] as number} /></td>
                  <td className="num edit"><input className="bg-transparent w-12 text-right" defaultValue={r[2] as number} /></td>
                  <td className="num edit"><input className="bg-transparent w-12 text-right" defaultValue={r[3] as number} step={0.1} /></td>
                  <td className="edit"><select defaultValue={r[4] as string} className="bg-transparent w-full text-[11.5px]"><option>Bassa</option><option>Media</option><option>Alta</option></select></td>
                  <td className="edit text-[var(--muted-foreground)]">{i===2 ? "Richiede comitato investimenti se > €50K" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "Effort" && (
          <div className="p-3 grid grid-cols-2 gap-4">
            <Panel title="Effort std per fase">
              <table className="btable">
                <thead><tr><th>Fase</th><th className="num">Effort (gg)</th></tr></thead>
                <tbody>
                  {[["Scoping",5],["RFx",12],["Negoziazione",10],["Contratto",7]].map(([k,v])=>(
                    <tr key={k as string}><td>{k}</td><td className="num edit"><input defaultValue={v as number} className="bg-transparent w-12 text-right" /></td></tr>
                  ))}
                </tbody>
              </table>
            </Panel>
            <Panel title="Pesatura per categoria">
              <table className="btable">
                <thead><tr><th>Categoria</th><th className="num">Peso (x)</th></tr></thead>
                <tbody>
                  {[["IT",1.2],["Energy",1.4],["Servizi",1.0],["HR",0.8]].map(([k,v])=>(
                    <tr key={k as string}><td>{k}</td><td className="num edit"><input defaultValue={v as number} step={0.1} className="bg-transparent w-12 text-right" /></td></tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        )}
        {tab === "Capacity Model" && (
          <div className="p-4 space-y-3 text-[12px]">
            <div className="flex items-center gap-3">
              <label className="w-48">Capacity standard buyer (FTE)</label>
              <input defaultValue={1.0} step={0.05} className="border rounded px-2 py-1 w-24" />
              <span className="text-[var(--muted-foreground)]">FTE equivalente al 100%</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-48">Soglia overflow (%)</label>
              <input defaultValue={110} className="border rounded px-2 py-1 w-24" />
              <span className="text-[var(--muted-foreground)]">attiva alert se superato</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-48">Soglia sotto-utilizzo (%)</label>
              <input defaultValue={70} className="border rounded px-2 py-1 w-24" />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-48">Buffer team (FTE)</label>
              <input defaultValue={0.4} step={0.1} className="border rounded px-2 py-1 w-24" />
            </div>
          </div>
        )}
        {tab === "SLA & Alert" && (
          <table className="btable">
            <thead><tr><th>Evento</th><th className="num">SLA (gg)</th><th>Canale notifica</th><th>Escalation</th></tr></thead>
            <tbody>
              {[["Approvazione MP RU",5,"Email + In-app","Responsabile SUPC"],
                ["Sign-off SUPC",7,"Email","CFO"],
                ["Post-freeze pending",3,"In-app","CFO + Board"],
                ["Rinnovo contratto < 30gg",30,"Email","Owner contratto"]].map((r,i)=>(
                <tr key={i}><td>{r[0]}</td><td className="num edit"><input defaultValue={r[1] as number} className="bg-transparent w-12 text-right" /></td><td>{r[2]}</td><td>{r[3]}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "Calendar" && (
          <div className="p-4 text-[12px] grid grid-cols-3 gap-3">
            {[["Apertura ciclo","01/06/2026"],["Data freeze","30/09/2026"],["Sign-off CFO","15/10/2026"],["Publish snapshot","31/10/2026"],["Apertura post-freeze","01/11/2026"],["Chiusura ciclo","31/12/2026"]].map(([k,v])=>(
              <div key={k} className="panel p-3">
                <div className="text-[10px] uppercase text-[var(--muted-foreground)]">{k}</div>
                <div className="text-[14px] font-semibold mt-1">{v}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
