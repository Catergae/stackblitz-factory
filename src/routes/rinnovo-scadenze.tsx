import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill } from "@/components/ui";
import { CONTRACTS, fmt } from "@/lib/seed";

export const Route = createFileRoute("/rinnovo-scadenze")({
  head: () => ({ meta: [{ title: "Rinnovo Scadenze · Procurement Planning" }] }),
  component: Page,
});

const MOTIVAZIONI = ["Inflazione", "Allineamento prezzi", "Riduzione scope", "Espansione scope", "Cambio fornitore"];
const MOTIV_FV = ["Esclusiva tecnologica", "Know-how proprietario", "Contratto quadro", "Certificazioni richieste", "Nessun vincolo"];
const IMPORTANZA = ["1", "2", "3", "4", "5"];
const HORIZON = ["Lug 26","Ago 26","Set 26","Ott 26","Nov 26","Dic 26","Gen 27","Feb 27","Mar 27","Apr 27","Mag 27","Giu 27","Lug 27","Ago 27","Set 27","Ott 27","Nov 27","Dic 27"];

function Page() {
  const rows = CONTRACTS.slice(0, 18);
  const [bulk, setBulk] = useState(false);

  return (
    <AppShell
      title="Rinnovo Scadenze (AR)"
      breadcrumb={["Demand Collection", "Rinnovo Scadenze"]}
      filters={
        <>
          <Filter label="Società"><Select value="Tutte" options={["Tutte","ABC","DEF"]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte","Finance","HR","Legal"]} /></Filter>
          <Filter label="Owner contratto"><Select value="Tutti" options={["Tutti","Mario Rossi","Giulia Verdi"]} /></Filter>
          <Filter label="Fornitore"><Select value="Tutti" options={["Tutti","Vendor 1","Vendor 2"]} /></Filter>
          <Filter label="Mese inizio rinnovo"><Select value="Tutti" options={["Tutti", ...HORIZON]} /></Filter>
          <Filter label="Stato creazione"><Select value="Tutti" options={["Tutti","SI","NO"]} /></Filter>
        </>
      }
      legend
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Contratti in scadenza" value={String(rows.length)} />
        <Kpi label="Sotto soglia" value="6" />
        <Kpi label="Già flaggati" value="9" />
        <Kpi label="Δ stimato vs scadenza" value="-3,2%" />
      </div>

      <div className="grid grid-cols-1 gap-3 mb-3">
        <Panel title="Distribuzione scadenze (Lug 26 → Dic 27, 18M)">
          <div className="p-3 flex items-end gap-2 h-40">
            {HORIZON.map((m, i) => {
              const v = 2 + Math.round(Math.abs(Math.sin(i * 0.7)) * 8);
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full bg-[var(--accent)] opacity-90 rounded-t-sm flex items-start justify-center text-[10px] text-white font-semibold pt-0.5"
                    style={{ height: `${v * 10}%`, minHeight: 14 }}
                  >
                    {v}
                  </div>
                  <div className="text-[9.5px] text-[var(--muted-foreground)]">{m}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel
        title="Rinnovo contratti in scadenza"
        right={<button className="btn btn-ghost text-[11px]">📋 Crea Fabbisogno</button>}
      >
        <div className="max-h-[calc(100vh-360px)] overflow-auto">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h" style={{width:36}}>
                  <input type="checkbox" checked={bulk} onChange={e=>setBulk(e.target.checked)} />
                </th>
                <th className="frozen h" style={{left:36}}>Nr Contratto</th>
                <th>Descrizione</th><th>Referente</th><th>Fornitore</th>
                <th>Forn. Vincolato</th>
                <th>Motivazione Forn. Vincolato</th>
                <th>Tipologia</th>
                <th>Data Inizio Contratto</th>
                <th>Data Fine Contratto</th>
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
                <th>Importanza (1-5)</th>
                <th>Stato</th>
                <th>ID Fabbisogno</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => {
                const stimato = Math.round(c.value * (0.85 + (i%5)*0.05));
                const flag = bulk || i % 3 === 0;
                const vincolato = i%2===0;
                return (
                  <tr key={c.id}>
                    <td className="frozen edit"><input type="checkbox" defaultChecked={flag} /></td>
                    <td className="frozen font-semibold" style={{left:36}}>{c.id}</td>
                    <td>{c.description}</td>
                    <td>{c.owner}</td>
                    <td>{c.vendor}</td>
                    <td className="edit"><input type="checkbox" defaultChecked={vincolato} /></td>
                    <td className="edit">
                      <select defaultValue={vincolato ? MOTIV_FV[i%4] : "Nessun vincolo"} className="bg-transparent text-[11.5px] w-full outline-none">
                        {MOTIV_FV.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="edit">
                      <select defaultValue={i%2?"CV":"CI"} className="bg-transparent text-[11.5px] w-full outline-none">
                        <option>CI</option><option>CV</option><option>OQ</option>
                      </select>
                    </td>
                    <td>{c.start}</td>
                    <td>{c.end}</td>
                    <td className="num">{fmt(c.value)}</td>
                    <td className="num">{(c.consumed*100).toFixed(0)}%</td>
                    <td className="suggest">{`2026-${String(((i%6)+4)).padStart(2,"0")}-15`}</td>
                    <td className="suggest">{`2026-${String(((i%6)+5)).padStart(2,"0")}-01`}</td>
                    <td className="suggest">{`2027-${String(((i%6)+5)).padStart(2,"0")}-01`}</td>
                    <td className="num suggest">
                      <input className="bg-transparent w-10 text-right" defaultValue={1 + (i%3)} />
                    </td>
                    <td className="num suggest"><input className="bg-transparent w-20 text-right" defaultValue={stimato} /></td>
                    <td className="edit">
                      <select defaultValue={MOTIVAZIONI[i%5]} className="bg-transparent text-[11.5px] w-full">
                        {MOTIVAZIONI.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="num suggest">{fmt(stimato)}</td>
                    <td className="num suggest">{i%3===0 ? fmt(Math.round(stimato/2)) : "-"}</td>
                    <td className="num suggest">{i%4===0 ? fmt(Math.round(stimato/3)) : "-"}</td>
                    <td className="edit">
                      <select defaultValue={IMPORTANZA[i%5]} className="bg-transparent text-[11.5px] w-full">
                        {IMPORTANZA.map(m => <option key={m}>{m}</option>)}
                      </select>
                    </td>
                    <td><StatusPill status={flag ? "Approved" : "Draft"} /></td>
                    <td className="drill">{flag ? `2026${String(i+1).padStart(2,"0")}ABCZZ${i+1}` : "—"}</td>
                  </tr>
                );
              })}
              <tr className="total">
                <td className="frozen" colSpan={10}>TOTALE</td>
                <td className="num">{fmt(rows.reduce((s,c)=>s+c.value,0))}</td>
                <td colSpan={5}></td>
                <td className="num">{fmt(rows.reduce((s,c)=>s+c.value*0.9,0))}</td>
                <td colSpan={7}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
