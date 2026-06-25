import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi } from "@/components/ui";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/savings")({
  head: () => ({ meta: [{ title: "Savings & Performance · Procurement Planning" }] }),
  component: Page,
});

const COMPANIES = ["ABC", "DEF", "GHI"];
const BUYERS = ["Mario Rossi", "Giulia Verdi", "Luca Bianchi", "Sara Neri"];
const FORNITORI = ["Vendor Alpha", "Vendor Beta", "Vendor Gamma", "Vendor Delta", "Vendor Epsilon", "Vendor Zeta"];
const PROCEDURE = ["Gara aperta", "Negoziata", "Affidamento diretto", "Framework"];
const BLSC = ["B", "L", "S", "C"] as const;
const BLSC_LABEL: Record<string, string> = { B: "Bottleneck", L: "Leverage", S: "Strategic", C: "Non-critical" };
const BLSC_COLOR: Record<string, string> = {
  B: "var(--warning)", L: "var(--success)", S: "var(--accent)", C: "var(--muted-foreground)",
};
const DESCR = [
  "Servizi cloud Azure", "Consulenza M&A", "Audit ESG", "Manutenzione DC",
  "Implement. SAP", "Servizi legal", "Licenze MS 365", "Energy supply",
];

const ROWS = Array.from({ length: 14 }, (_, i) => {
  const company = COMPANIES[i % COMPANIES.length];
  const stimato = 50000 + i * 9200;
  const contratto = Math.round(stimato * (0.78 + (i % 5) * 0.03));
  const hard = stimato - contratto;
  return {
    id: `202607${company}N${String(i + 1).padStart(2, "0")}`,
    descrizione: DESCR[i % DESCR.length],
    nrRdA: `RDA-2026-${String(2100 + i)}`,
    nrContratto: `CTR-2026-${String(500 + i)}`,
    stimato,
    contratto,
    fornitore: FORNITORI[i % FORNITORI.length],
    buyer: BUYERS[i % BUYERS.length],
    hard,
    pct: stimato ? hard / stimato : 0,
    blsc: BLSC[i % 4],
  };
});

function Page() {
  const totHard = ROWS.reduce((s, r) => s + r.hard, 0);

  const blscSavings = BLSC.map((k) => ({
    key: k,
    label: BLSC_LABEL[k],
    value: ROWS.filter((r) => r.blsc === k).reduce((s, r) => s + r.hard, 0),
  }));
  const blscTotal = blscSavings.reduce((s, d) => s + d.value, 0) || 1;

  const vendorSavings = FORNITORI.map((f) => ({
    name: f,
    value: ROWS.filter((r) => r.fornitore === f).reduce((s, r) => s + r.hard, 0),
  })).sort((a, b) => b.value - a.value).slice(0, 5);
  const maxVendor = vendorSavings[0]?.value || 1;

  return (
    <AppShell
      title="Savings & Performance"
      breadcrumb={["Tracciamento modifiche post-freeze", "Savings"]}
      filters={
        <>
          <Filter label="Società"><Select value="Tutte" options={["Tutte", ...COMPANIES]} /></Filter>
          <Filter label="Buyer"><Select value="Tutti" options={["Tutti", ...BUYERS]} /></Filter>
          <Filter label="Fornitore"><Select value="Tutti" options={["Tutti", ...FORNITORI]} /></Filter>
          <Filter label="Nr Fabbisogno"><Select value="Tutti" options={["Tutti", ...ROWS.map((r) => r.id)]} /></Filter>
          <Filter label="Tipologia procedura"><Select value="Tutte" options={["Tutte", ...PROCEDURE]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Kpi label="Totale Hard Savings" value={`€ ${fmt(totHard)}`} />
        <Panel title="Savings per categoria (B/L/S/C)">
          <div className="p-3 space-y-1.5">
            {blscSavings.map((d) => {
              const pct = Math.round((d.value / blscTotal) * 100);
              return (
                <div key={d.key} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-5 font-semibold">{d.key}</span>
                  <div className="flex-1 h-3 bg-[var(--muted)] rounded">
                    <div className="h-full rounded" style={{ width: `${pct}%`, background: BLSC_COLOR[d.key] }} />
                  </div>
                  <span className="w-24 text-right tabular-nums">€ {fmt(d.value)}</span>
                  <span className="w-10 text-right text-[var(--muted-foreground)]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Top 5 fornitori per migliori savings">
          <div className="p-3 space-y-1.5">
            {vendorSavings.map((v) => {
              const pct = maxVendor ? Math.round((v.value / maxVendor) * 100) : 0;
              return (
                <div key={v.name} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-24 truncate">{v.name}</span>
                  <div className="flex-1 h-3 bg-[var(--muted)] rounded">
                    <div className="h-full bg-[var(--accent)] rounded" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-24 text-right tabular-nums">€ {fmt(v.value)}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="Dettaglio savings per fabbisogno">
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <table className="btable">
            <thead>
              <tr>
                <th>ID Fabbisogno</th>
                <th>Descrizione Fabbisogno</th>
                <th>Nr RdA</th>
                <th>Nr Contratto</th>
                <th className="num">Importo stimato fabbisogno (€)</th>
                <th className="num">Valore contratto (€)</th>
                <th>Fornitore aggiudicatario</th>
                <th>Buyer</th>
                <th className="num">Hard savings (€)</th>
                <th className="num">% savings</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.id}</td>
                  <td>{r.descrizione}</td>
                  <td>{r.nrRdA}</td>
                  <td>{r.nrContratto}</td>
                  <td className="num">{fmt(r.stimato)}</td>
                  <td className="num">{fmt(r.contratto)}</td>
                  <td>{r.fornitore}</td>
                  <td>{r.buyer}</td>
                  <td className={`num font-semibold ${r.hard >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                    € {fmt(Math.abs(r.hard))}
                  </td>
                  <td className="num">{(r.pct * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
