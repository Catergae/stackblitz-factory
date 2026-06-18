import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select, MultiChip } from "@/components/AppShell";
import { Panel, Kpi, StatusPill } from "@/components/ui";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/nuovi-fabbisogni")({
  head: () => ({ meta: [{ title: "Nuovi Fabbisogni · Procurement Planning" }] }),
  component: Page,
});

const NEW_NEEDS = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  attivita: ["Implementazione SAP S/4", "Manutenzione HW DC", "Servizi audit ESG", "Servizi cloud Azure", "Formazione compliance", "Servizi consulenza M&A", "Licenze Microsoft 365"][i % 7],
  desc: "Estensione perimetro per nuovo progetto di trasformazione digitale e operativa.",
  progetto: `PRJ-2026-${String(100 + i)}`,
  organo: ["Comitato Investimenti", "CFO", "CIO", "COO"][i % 4],
  magazzino: i % 4 === 0 ? "SI" : "NO",
  valore: 25000 + i * 8400,
  durata: [1, 2, 3][i % 3],
  bdg2026: 25000 + i * 8400,
  importanza: ["Alta", "Media", "Bassa"][i % 3],
  fornitoreVincolato: i % 3 === 0,
  status: ["Draft", "Pending", "Approved"][i % 3],
}));

function Page() {
  return (
    <AppShell
      title="Nuovi Fabbisogni (AN)"
      breadcrumb={["Demand Collection", "Nuovi Fabbisogni"]}
      actions={
        <>
          <button className="btn btn-ghost">+ Riga</button>
          <button className="btn btn-ghost">⤓ Import Excel</button>
          <button className="btn btn-ghost">↶ Reset</button>
          <button className="btn btn-primary">⚑ Sottometti</button>
        </>
      }
      filters={
        <>
          <Filter label="Società"><MultiChip items={["ABC"]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte","Finance","IT","HR"]} /></Filter>
          <Filter label="Owner"><Select value="Tutti" options={["Tutti","Mario Rossi"]} /></Filter>
          <Filter label="Mese creazione"><Select value="06/2026" options={["06/2026","05/2026"]} /></Filter>
          <Filter label="Importanza"><Select value="Tutte" options={["Tutte","Alta","Media","Bassa"]} /></Filter>
          <Filter label="Stato"><Select value="Tutti" options={["Tutti","Draft","Pending"]} /></Filter>
          <div className="p-2 bg-[#fff7d6] border border-[#e4d49a] rounded text-[11px]">
            <b>⚠ Data freeze:</b> 30/09/2026 — fabbisogni editabili fino a tale data.
          </div>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Nuovi fabbisogni" value={String(NEW_NEEDS.length)} hint="Periodo corrente" />
        <Kpi label="Valore totale" value={`€ ${fmt(NEW_NEEDS.reduce((s,n)=>s+n.valore,0))}`} delta="+18%" trend="up" />
        <Kpi label="Approvati" value={String(NEW_NEEDS.filter(n=>n.status==="Approved").length)} hint="Validati Organo" />
        <Kpi label="Pending freeze" value="12" delta="14gg" trend="down" hint="Lead time medio" />
      </div>

      <Panel title="Inserimento nuovi fabbisogni" right={
        <>
          <span className="chip">14/14 visibili</span>
          <button className="btn btn-ghost text-[11px]">Calcola Δ</button>
        </>
      }>
        <div className="overflow-auto max-h-[520px]">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h" style={{width:36}}><input type="checkbox" /></th>
                <th className="frozen h" style={{left:36}}>Mese Creazione</th>
                <th>Attività</th>
                <th>Descrizione</th>
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
                <th>Data Stipula</th>
                <th>Inizio Validità</th>
                <th>Importanza</th>
                <th>Forn. Vincolato</th>
                <th>Motivazione</th>
                <th>Note</th>
                <th>Stato</th>
                <th>ID Fabbisogno</th>
              </tr>
            </thead>
            <tbody>
              {NEW_NEEDS.map((n, i) => (
                <tr key={n.id}>
                  <td className="frozen edit"><input type="checkbox" defaultChecked={i%2===0} /></td>
                  <td className="frozen" style={{left:36}}>06/2026</td>
                  <td className="edit"><input className="bg-transparent w-full" defaultValue={n.attivita} /></td>
                  <td className="edit max-w-[240px] truncate" title={n.desc}>{n.desc}</td>
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
                  <td className="edit">{`2026-${String(7+(i%5)).padStart(2,"0")}-15`}</td>
                  <td className="edit">{`2026-${String(8+(i%4)).padStart(2,"0")}-01`}</td>
                  <td className="edit">{n.importanza}</td>
                  <td className="edit text-center"><input type="checkbox" defaultChecked={n.fornitoreVincolato} /></td>
                  <td className="edit">{n.fornitoreVincolato ? "Know-how specifico" : "—"}</td>
                  <td className="edit text-[var(--muted-foreground)]">{i%3===0 ? "Allineato CFO" : ""}</td>
                  <td><StatusPill status={n.status} /></td>
                  <td className="drill">{n.status!=="Draft" ? `2026${String(n.id).padStart(2,"0")}ABCN${n.id}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Panel title="Distribuzione fabbisogni per categoria">
          <div className="p-3 space-y-1.5">
            {[["IT & Cloud", 38],["Servizi professionali",24],["Logistica",16],["HR & Formazione",12],["Altro",10]].map(([k,v])=>(
              <div key={k as string} className="flex items-center gap-2 text-[11.5px]">
                <span className="w-32">{k}</span>
                <div className="flex-1 h-2.5 bg-[var(--muted)] rounded">
                  <div className="h-full bg-[var(--primary)] rounded" style={{width: `${v as number}%`}} />
                </div>
                <span className="w-8 text-right tabular-nums">{v}%</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Suggerimenti AI">
          <div className="divide-y text-[12px]">
            {[
              "Riga #3: descrizione simile a fabbisogno PRJ-2025-188 (consolidabile, -7% stima)",
              "Riga #7: importo > €100K richiede approvazione Comitato Investimenti",
              "Riga #12: data stipula in conflitto con lead time procurement (rischio slittamento)",
            ].map((s, i) => (
              <div key={i} className="flex gap-2 px-3 py-1.5">
                <span className="text-[var(--info)]">💡</span><span>{s}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
