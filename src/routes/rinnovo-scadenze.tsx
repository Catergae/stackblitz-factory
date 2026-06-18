import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Filter, Select, MultiChip } from "@/components/AppShell";
import { Panel, Kpi, StatusPill } from "@/components/ui";
import { CONTRACTS, fmt } from "@/lib/seed";

export const Route = createFileRoute("/rinnovo-scadenze")({
  head: () => ({ meta: [{ title: "Rinnovo Scadenze · Procurement Planning" }] }),
  component: Page,
});

const MOTIVAZIONI = ["Inflazione", "Allineamento prezzi", "Riduzione scope", "Espansione scope", "Cambio fornitore"];
const IMPORTANZA = ["Alta", "Media", "Bassa"];

function Page() {
  const rows = CONTRACTS.slice(0, 18);
  const [bulk, setBulk] = useState(false);

  return (
    <AppShell
      title="Rinnovo Scadenze (AR)"
      breadcrumb={["Demand Collection", "Rinnovo Scadenze"]}
      actions={
        <>
          <button className="btn btn-ghost">📋 Genera ID Fabbisogno</button>
          <button className="btn btn-ghost">↶ Reset</button>
          <button className="btn btn-ghost">💾 Salva bozza</button>
          <button className="btn btn-primary">⚑ Sottometti a MasterPlan</button>
        </>
      }
      filters={
        <>
          <Filter label="Società"><MultiChip items={["ABC", "DEF"]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte","Finance","HR","Legal"]} /></Filter>
          <Filter label="Owner contratto"><Select value="Tutti" options={["Tutti","Mario Rossi","Giulia Verdi"]} /></Filter>
          <Filter label="Fornitore"><Select value="Tutti" options={["Tutti","Vendor 1","Vendor 2"]} /></Filter>
          <Filter label="Mese inizio rinnovo"><Select value="Tutti" options={["Tutti","04/2026","05/2026"]} /></Filter>
          <Filter label="Stato creazione"><Select value="Tutti" options={["Tutti","SI","NO"]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Contratti in scadenza" value={String(rows.length)} hint="Periodo orizzonte" />
        <Kpi label="Sotto soglia" value="6" hint="< € 25.000" />
        <Kpi label="Già flaggati" value="9" delta="50%" trend="up" />
        <Kpi label="Δ stimato vs scadenza" value="-3,2%" trend="down" hint="su totale rinnovo" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <Panel title="Distribuzione scadenze (12M)" className="col-span-2">
          <div className="p-3 flex items-end gap-2 h-28">
            {Array.from({length:12},(_,i)=>2+Math.round(Math.abs(Math.sin(i*0.8))*8)).map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px]">{v}</div>
                <div className="w-full bg-[var(--accent)] opacity-90 rounded-sm" style={{ height: `${v*10}%` }} />
                <div className="text-[10px] text-[var(--muted-foreground)]">{["G","F","M","A","M","G","L","A","S","O","N","D"][i]}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Legenda celle">
          <div className="p-3 space-y-1.5 text-[11.5px]">
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[var(--cell-readonly)] border" /> Read-only (calcolato)</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[var(--cell-edit)] border" /> Editabile · data entry utente</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[var(--cell-suggest)] border" /> Suggerimento AI · modificabile</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-[var(--cell-drill)] border" /> Drill-down / dettaglio</div>
            <div className="pt-2 text-[var(--muted-foreground)]">Le righe flaggate generano automaticamente un nuovo ID fabbisogno e popolano il MasterPlan.</div>
          </div>
        </Panel>
      </div>

      <Panel title="Rinnovo contratti in scadenza" right={
        <>
          <label className="flex items-center gap-1.5 text-[11px]">
            <input type="checkbox" checked={bulk} onChange={e => setBulk(e.target.checked)} /> Flag massivo
          </label>
          <button className="btn btn-ghost text-[11px]">Calcola Δ</button>
        </>
      }>
        <div className="max-h-[480px] overflow-auto">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h" style={{width:36}}>
                  <input type="checkbox" checked={bulk} onChange={e=>setBulk(e.target.checked)} />
                </th>
                <th className="frozen h" style={{left:36}}>Nr Contratto</th>
                <th>Descrizione</th><th>Referente</th><th>Fornitore</th>
                <th>Forn. Vincolato</th><th>Tipologia</th>
                <th>Data Fine Att.</th>
                <th className="num">Val. Scad. (€)</th>
                <th className="num">% Residuo</th>
                <th>Data Stipula Rinnovo</th>
                <th>Data Inizio Nuovo</th>
                <th>Data Fine Nuovo</th>
                <th className="num">Durata (anni)</th>
                <th className="num">Val. Stimato (€)</th>
                <th>Motivazione Δ</th>
                <th className="num">BDG 2026</th>
                <th className="num">BDG 2027</th>
                <th className="num">BDG 2028</th>
                <th>Importanza</th>
                <th>Stato</th>
                <th>ID Fabbisogno</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => {
                const stimato = Math.round(c.value * (0.85 + (i%5)*0.05));
                const flag = bulk || i % 3 === 0;
                return (
                  <tr key={c.id}>
                    <td className="frozen edit"><input type="checkbox" defaultChecked={flag} /></td>
                    <td className="frozen font-semibold" style={{left:36}}>{c.id}</td>
                    <td>{c.description}</td>
                    <td>{c.owner}</td>
                    <td>{c.vendor}</td>
                    <td className="edit"><input type="checkbox" defaultChecked={i%2===0} /></td>
                    <td className="edit">
                      <select defaultValue={i%2?"CV":"CI"} className="bg-transparent text-[11.5px] w-full outline-none">
                        <option>CI</option><option>CV</option><option>OQ</option>
                      </select>
                    </td>
                    <td>{c.end}</td>
                    <td className="num">{fmt(c.value)}</td>
                    <td className="num">{(c.consumed*100).toFixed(0)}%</td>
                    <td className="suggest">{`2026-${String(((i%6)+4)).padStart(2,"0")}-15`}</td>
                    <td className="suggest">{`2026-${String(((i%6)+5)).padStart(2,"0")}-01`}</td>
                    <td className="suggest">{`2027-${String(((i%6)+5)).padStart(2,"0")}-01`}</td>
                    <td className="num edit">
                      <input className="bg-transparent w-10 text-right" defaultValue={1 + (i%3)} />
                    </td>
                    <td className="num edit"><input className="bg-transparent w-20 text-right" defaultValue={stimato} /></td>
                    <td className="edit">
                      <select defaultValue={MOTIVAZIONI[i%5]} className="bg-transparent text-[11.5px] w-full">
                        {MOTIVAZIONI.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="num suggest">{fmt(stimato)}</td>
                    <td className="num suggest">{i%3===0 ? fmt(Math.round(stimato/2)) : "-"}</td>
                    <td className="num suggest">{i%4===0 ? fmt(Math.round(stimato/3)) : "-"}</td>
                    <td className="edit">
                      <select defaultValue={IMPORTANZA[i%3]} className="bg-transparent text-[11.5px] w-full">
                        {IMPORTANZA.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </td>
                    <td><StatusPill status={flag ? "Approved" : "Draft"} /></td>
                    <td className="drill">{flag ? `2026${String(i+1).padStart(2,"0")}ABCZZ${i+1}` : "—"}</td>
                  </tr>
                );
              })}
              <tr className="total">
                <td className="frozen" colSpan={8}>TOTALE</td>
                <td className="num">{fmt(rows.reduce((s,c)=>s+c.value,0))}</td>
                <td colSpan={5}></td>
                <td className="num">{fmt(rows.reduce((s,c,i)=>s+c.value*0.9,0))}</td>
                <td colSpan={7}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
