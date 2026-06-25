import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill } from "@/components/ui";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/nuovi-fabbisogni")({
  head: () => ({ meta: [{ title: "Nuovi Fabbisogni · Procurement Planning" }] }),
  component: Page,
});

const IMPORTANZA = ["1", "2", "3", "4", "5"];
const FORNITORI_VINCOLATI = ["—", "Oracle Italia", "SAP Italia", "Microsoft", "IBM", "Accenture", "Deloitte"];

const NEW_NEEDS = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  desc: [
    "Estensione perimetro SAP S/4 per nuova legal entity",
    "Manutenzione evolutiva HW Data Center primario",
    "Servizi audit ESG e reportistica CSRD",
    "Estensione tenant cloud Azure produzione",
    "Programma formazione compliance GDPR/AML",
    "Advisory M&A per progetto integrazione",
    "Rinnovo licenze Microsoft 365 E5",
  ][i % 7],
  progetto: `PRJ-2026-${String(100 + i)}`,
  organo: ["Comitato Investimenti", "CFO", "CIO", "COO"][i % 4],
  magazzino: i % 4 === 0 ? "SI" : "NO",
  valore: 25000 + i * 8400,
  durata: [1, 2, 3][i % 3],
  bdg2026: 25000 + i * 8400,
  importanza: IMPORTANZA[i % 5],
  fornitoreVincolato: i % 3 === 0 ? FORNITORI_VINCOLATI[1 + (i % 5)] : "—",
  status: ["Draft", "Pending", "Approved"][i % 3],
  // simulate that ~30% of dates are too tight → red + proposta
  dataStipulaTight: i % 3 === 0,
  dataInizioTight: i % 4 === 0,
}));

function Page() {
  return (
    <AppShell
      title="Nuovi Fabbisogni (AN)"
      breadcrumb={["Definizione Fabbisogno", "Nuovi Fabbisogni"]}
      filters={
        <>
          <Filter label="Società"><Select value="Tutte" options={["Tutte","ABC","DEF","GHI"]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte","Finance","IT","HR"]} /></Filter>
          <Filter label="Owner"><Select value="Tutti" options={["Tutti","Mario Rossi"]} /></Filter>
          <Filter label="Mese creazione"><Select value="06/2026" options={["06/2026","05/2026"]} /></Filter>
          <Filter label="Importanza"><Select value="Tutte" options={["Tutte","1","2","3","4","5"]} /></Filter>
          <Filter label="Stato"><Select value="Tutti" options={["Tutti","Draft","Pending","Approved"]} /></Filter>
        </>
      }
      legend
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Nuovi fabbisogni" value={String(NEW_NEEDS.length)} hint="Periodo corrente" />
        <Kpi label="Valore totale" value={`€ ${fmt(NEW_NEEDS.reduce((s,n)=>s+n.valore,0))}`} delta="+18%" trend="up" />
        <Kpi label="Approvati" value={String(NEW_NEEDS.filter(n=>n.status==="Approved").length)} hint="Validati Organo" />
        <Kpi label="Pending freeze" value="12" delta="14gg" trend="down" hint="Lead time medio" />
      </div>

      {/* QUICK ENTRY ROW — usata anche per import Excel */}
      <Panel
        title="Caricamento singola riga / Import Excel"
        right={
          <>
            <button className="btn btn-ghost text-[11px]">⤓ Import Excel</button>
            <button className="btn btn-ghost text-[11px]">↶ Reset</button>
            <button className="btn btn-primary text-[11px]">+ Creazione Fabbisogno</button>
          </>
        }
      >
        <div className="overflow-auto">
          <table className="btable">
            <thead>
              <tr>
                <th>Mese Creazione</th>
                <th>Descrizione Fabbisogno</th>
                <th>Cod. Progetto/Commessa</th>
                <th>Organo Deliberante</th>
                <th>Magazzino</th>
                <th className="num">Valore Stimato (€)</th>
                <th className="num">Durata (anni)</th>
                <th>Data Richiesta Stipula</th>
                <th>Inizio Validità</th>
                <th>Importanza (1-5)</th>
                <th>Fornitore Vincolato</th>
                <th>Motivazione</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="edit"><input className="bg-transparent w-20" placeholder="06/2026" /></td>
                <td className="edit"><input className="bg-transparent w-56" placeholder="Descrizione fabbisogno…" /></td>
                <td className="edit"><input className="bg-transparent w-28" placeholder="PRJ-2026-…" /></td>
                <td className="edit">
                  <select className="bg-transparent text-[11.5px] w-full outline-none" defaultValue="">
                    <option value="" disabled>—</option>
                    <option>Comitato Investimenti</option><option>CFO</option><option>CIO</option><option>COO</option>
                  </select>
                </td>
                <td className="edit">
                  <select className="bg-transparent text-[11.5px] w-full" defaultValue="NO"><option>SI</option><option>NO</option></select>
                </td>
                <td className="num edit"><input className="bg-transparent w-24 text-right" placeholder="0" /></td>
                <td className="num edit"><input className="bg-transparent w-12 text-right" placeholder="1" /></td>
                <td className="edit"><input className="bg-transparent w-28" placeholder="aaaa-mm-gg" /></td>
                <td className="edit"><input className="bg-transparent w-28" placeholder="aaaa-mm-gg" /></td>
                <td className="edit">
                  <select className="bg-transparent text-[11.5px] w-full" defaultValue="3">
                    {IMPORTANZA.map(v => <option key={v}>{v}</option>)}
                  </select>
                </td>
                <td className="edit">
                  <select className="bg-transparent text-[11.5px] w-full" defaultValue="—">
                    {FORNITORI_VINCOLATI.map(f => <option key={f}>{f}</option>)}
                  </select>
                </td>
                <td className="edit"><input className="bg-transparent w-40" placeholder="Motivazione…" /></td>
                <td className="edit"><input className="bg-transparent w-40" placeholder="Note…" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Elenco fabbisogni"
        right={<span className="chip">14/14 visibili</span>}
      >
        <div className="overflow-auto max-h-[calc(100vh-260px)]">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h" style={{width:36}}><input type="checkbox" /></th>
                <th className="frozen h" style={{left:36}}>Mese Creazione</th>
                <th>Descrizione Fabbisogno</th>
                <th>Cod. Progetto/Commessa</th>
                <th>Organo Deliberante</th>
                <th>Magazzino</th>
                <th className="num">Valore Stimato (€)</th>
                <th className="num">Durata (anni)</th>
                <th className="num">BDG 2026</th>
                <th className="num">BDG 2027</th>
                <th className="num">BDG 2028</th>
                <th className="num">BDG 2029</th>
                <th className="num">BDG ≥2030</th>
                <th>Data Richiesta Stipula</th>
                <th>Data Stipula · Proposta</th>
                <th>Inizio Validità</th>
                <th>Inizio Validità · Proposta</th>
                <th>Importanza (1-5)</th>
                <th>Fornitore Vincolato</th>
                <th>Motivazione</th>
                <th>Note</th>
                <th>Stato</th>
                <th>ID Fabbisogno</th>
              </tr>
            </thead>
            <tbody>
              {NEW_NEEDS.map((n, i) => {
                const m = String(7 + (i % 5)).padStart(2, "0");
                const mInizio = String(8 + (i % 4)).padStart(2, "0");
                const stipulaDate = `2026-${m}-15`;
                const stipulaProposta = `2026-${String(Number(m) + 1).padStart(2,"0")}-30`;
                const inizioDate = `2026-${mInizio}-01`;
                const inizioProposta = `2026-${String(Number(mInizio) + 1).padStart(2,"0")}-15`;
                return (
                  <tr key={n.id}>
                    <td className="frozen edit"><input type="checkbox" defaultChecked={i%2===0} /></td>
                    <td className="frozen" style={{left:36}}>06/2026</td>
                    <td className="edit max-w-[260px] truncate" title={n.desc}>{n.desc}</td>
                    <td className="edit">{n.progetto}</td>
                    <td className="edit">{n.organo}</td>
                    <td className="edit">{n.magazzino}</td>
                    <td className="num edit"><input className="bg-transparent w-20 text-right" defaultValue={n.valore} /></td>
                    <td className="num edit">{n.durata}</td>
                    <td className="num suggest">{fmt(Math.round(n.bdg2026/n.durata))}</td>
                    <td className="num suggest">{n.durata>1 ? fmt(Math.round(n.bdg2026/n.durata)) : "-"}</td>
                    <td className="num suggest">{n.durata>2 ? fmt(Math.round(n.bdg2026/n.durata)) : "-"}</td>
                    <td className="num suggest">-</td>
                    <td className="num suggest">-</td>
                    <td className={"edit " + (n.dataStipulaTight ? "alert-date" : "")}>
                      {n.dataStipulaTight ? <span className="text-[var(--danger)] font-semibold">{stipulaDate}</span> : stipulaDate}
                    </td>
                    <td className="suggest text-[11px]">
                      {n.dataStipulaTight ? <span title="Lead time insufficiente: posticipo consigliato">▶ {stipulaProposta}</span> : "—"}
                    </td>
                    <td className={"edit " + (n.dataInizioTight ? "alert-date" : "")}>
                      {n.dataInizioTight ? <span className="text-[var(--danger)] font-semibold">{inizioDate}</span> : inizioDate}
                    </td>
                    <td className="suggest text-[11px]">
                      {n.dataInizioTight ? <span title="Allineamento con data stipula proposta">▶ {inizioProposta}</span> : "—"}
                    </td>
                    <td className="edit">
                      <select defaultValue={n.importanza} className="bg-transparent text-[11.5px] w-full">
                        {IMPORTANZA.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </td>
                    <td className="edit">
                      <select defaultValue={n.fornitoreVincolato} className="bg-transparent text-[11.5px] w-full">
                        {FORNITORI_VINCOLATI.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </td>
                    <td className="edit">{n.fornitoreVincolato !== "—" ? "Know-how specifico" : "—"}</td>
                    <td className="edit text-[var(--muted-foreground)]">{i%3===0 ? "Allineato CFO" : ""}</td>
                    <td><StatusPill status={n.status} /></td>
                    <td className="drill">{n.status!=="Draft" ? `2026${String(n.id).padStart(2,"0")}ABCN${n.id}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
