import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi } from "@/components/ui";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/post-freeze")({
  head: () => ({ meta: [{ title: "Tracciamento modifiche post-freeze · Procurement Planning" }] }),
  component: Page,
});

const COMPANIES = ["ABC", "DEF", "GHI"];
const REFERENTI = ["A. Conti", "P. Russo", "M. Greco", "L. Marini"];
const CATEGORIE = ["IT Services", "Consulenza", "Facility", "Logistica", "Legal", "Energy"];
const DESCRIZIONI = [
  "Estensione perimetro SAP S/4",
  "Manutenzione evolutiva HW DC",
  "Audit ESG e reportistica CSRD",
  "Tenant cloud Azure produzione",
  "Programma formazione compliance",
  "Advisory M&A integrazione",
  "Rinnovo licenze Microsoft 365",
];

const ROWS = Array.from({ length: 12 }, (_, i) => {
  const company = COMPANIES[i % COMPANIES.length];
  const importoStimato = 40000 + i * 6500;
  const importoRdA = importoStimato + (i % 2 === 0 ? 1 : -1) * (2500 + i * 800);
  const baseMonth = 7 + (i % 4);
  const baseDay = 5 + (i % 18);
  const dataBoard = `2026-${String(baseMonth).padStart(2, "0")}-${String(baseDay).padStart(2, "0")}`;
  const deltaDays = (i % 2 === 0 ? 1 : -1) * (3 + (i % 12));
  const jaggaerDate = new Date(`${dataBoard}T00:00:00Z`);
  jaggaerDate.setUTCDate(jaggaerDate.getUTCDate() + deltaDays);
  const dataJag = jaggaerDate.toISOString().slice(0, 10);
  return {
    id: `202607${company}N${String(i + 1).padStart(2, "0")}`,
    descrizione: DESCRIZIONI[i % DESCRIZIONI.length],
    nrRdA: `RDA-2026-${String(2100 + i)}`,
    referente: REFERENTI[i % REFERENTI.length],
    categoria: CATEGORIE[i % CATEGORIE.length],
    importoStimato,
    importoRdA,
    deltaEuro: importoRdA - importoStimato,
    dataBoard,
    dataJag,
    deltaDays,
  };
});

function Page() {
  const totDelta = ROWS.reduce((s, r) => s + r.deltaEuro, 0);
  const totGiorni = ROWS.reduce((s, r) => s + Math.abs(r.deltaDays), 0);
  const dateMod = ROWS.filter((r) => r.deltaDays !== 0).length;

  return (
    <AppShell
      title="Tracciamento modifiche post-freeze"
      breadcrumb={["Tracciamento modifiche post-freeze", "Tracking"]}
      filters={
        <>
          <Filter label="Referente"><Select value="Tutti" options={["Tutti", ...REFERENTI]} /></Filter>
          <Filter label="Categoria"><Select value="Tutte" options={["Tutte", ...CATEGORIE]} /></Filter>
          <Filter label="ID Fabbisogno"><Select value="Tutti" options={["Tutti", ...ROWS.map((r) => r.id)]} /></Filter>
        </>
      }
      legend
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Fabbisogni modificati" value={String(ROWS.length)} />
        <Kpi label="Date modificate" value={String(dateMod)} />
        <Kpi label="Valore totale modifiche" value={`${totDelta >= 0 ? "+" : "-"}€ ${fmt(Math.abs(totDelta))}`} />
        <Kpi label="Totale giorni modifiche" value={String(totGiorni)} />
      </div>

      <Panel title="Modifiche post-freeze">
        <div className="overflow-auto max-h-[calc(100vh-260px)]">
          <table className="btable">
            <thead>
              <tr>
                <th>ID Fabbisogno</th>
                <th>Descrizione Fabbisogno</th>
                <th>Nr RdA</th>
                <th>Referente</th>
                <th className="num">Importo stimato fabbisogno (€)</th>
                <th className="num">Importo RdA (€)</th>
                <th className="num">Δ €</th>
                <th>Data Rich. Inizio Validità – Board</th>
                <th>Data Rich. Inizio Validità – Jaggaer</th>
                <th className="num">Δ giorni</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.id}</td>
                  <td>{r.descrizione}</td>
                  <td>{r.nrRdA}</td>
                  <td>{r.referente}</td>
                  <td className="num">{fmt(r.importoStimato)}</td>
                  <td className="num">{fmt(r.importoRdA)}</td>
                  <td className={`num font-semibold ${r.deltaEuro > 0 ? "text-[var(--danger)]" : r.deltaEuro < 0 ? "text-[var(--success)]" : ""}`}>
                    {r.deltaEuro > 0 ? "+" : r.deltaEuro < 0 ? "-" : ""}€ {fmt(Math.abs(r.deltaEuro))}
                  </td>
                  <td>{r.dataBoard}</td>
                  <td>{r.dataJag}</td>
                  <td className={`num font-semibold ${r.deltaDays > 0 ? "text-[var(--danger)]" : r.deltaDays < 0 ? "text-[var(--success)]" : ""}`}>
                    {r.deltaDays > 0 ? "+" : ""}{r.deltaDays}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
