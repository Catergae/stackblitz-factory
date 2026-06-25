import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill } from "@/components/ui";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Search } from "lucide-react";


export const Route = createFileRoute("/attivita")({
  head: () => ({ meta: [{ title: "Attività in corso · Procurement Planning" }] }),
  component: Page,
});

const STATUS_VALUES = [
  "Fabbisogno in Freeze",
  "RdA generata",
  "RdA in approvazione",
  "RdA approvata",
  "Sourcing in corso",
  "Creazione contratto in corso",
  "Contrattualizzato",
  "Contratto in scadenza",
  "Contratto Scaduto",
  "Rinnovato",
  "Non rinnovato",
];
const REGIMI = ["SS","SO","PR"];
const PROCEDURE = ["Aperta","Negoziata","RdO MePA","Affidamento Diretto","Accordo Quadro"];
const CATEGORIE = ["IT - Cloud","Energy","HR Services","Logistica","Servizi Professionali","Hardware"];
const REFERENTI = ["Mario Rossi","Giulia Verdi","Luca Bianchi","Sara Neri","Paolo Conti"];
const COMPANIES = ["ABC","DEF","GHI"];

function makeId(i: number) {
  const company = COMPANIES[i % COMPANIES.length];
  const l1 = String.fromCharCode(65 + (i % 26));
  const l2 = String.fromCharCode(65 + ((i * 3) % 26));
  const month = String(5 + (i % 6)).padStart(2, "0");
  return `2026${month}${company}${l1}${l2}${10 + i}`;
}

const FUNNEL_STEPS = [
  { k: "Freezato", n: 142, color: "var(--info)" },
  { k: "In attesa di approvazione RdA", n: 118, color: "var(--primary)" },
  { k: "In gestione", n: 96, color: "var(--accent)" },
  { k: "In gara", n: 74, color: "var(--warning)" },
  { k: "In aggiudicazione", n: 52, color: "#a855f7" },
  { k: "In contrattualizzazione", n: 38, color: "var(--success)" },
  { k: "Contratto stipulato", n: 27, color: "#0ea5e9" },
  { k: "PO rilasciato", n: 19, color: "var(--danger)" },
];

const BUYERS_SAL = [
  { name: "Mario Rossi", total: 42, done: 31, late: 4 },
  { name: "Giulia Verdi", total: 38, done: 22, late: 7 },
  { name: "Luca Bianchi", total: 51, done: 29, late: 12 },
  { name: "Sara Neri", total: 27, done: 24, late: 1 },
  { name: "Paolo Conti", total: 33, done: 18, late: 5 },
];

const ACTIVITIES = Array.from({ length: 22 }, (_, i) => {

  const start = new Date(2026, 6 + (i % 6), 1 + (i % 25));
  const end = new Date(start); end.setDate(end.getDate() + 30 + (i % 8) * 7);
  const delta = [-3, 0, 0, 2, 5, -1, 0, 7, 0][i % 9];
  return {
    id: makeId(i),
    rda: `RDA-${String(78000 + i * 3)}`,
    buyer: ["Mario Rossi","Giulia Verdi","Luca Bianchi","Sara Neri"][i % 4],
    regime: REGIMI[i % REGIMI.length],
    procedura: PROCEDURE[i % PROCEDURE.length],
    importanza: 1 + (i % 5),
    complessita: 1 + ((i + 2) % 5),
    status: STATUS_VALUES[i % STATUS_VALUES.length],
    dataInizio: start.toISOString().slice(0, 10),
    dataFine: end.toISOString().slice(0, 10),
    delta,
    desc: ["Gara energia 2027","Framework cloud DR","Rinnovo licenze SAP","Consulenza M&A advisory","Audit ESG annuale","RDA HW datacenter"][i % 6],
    referente: REFERENTI[i % REFERENTI.length],
    categoria: CATEGORIE[i % CATEGORIE.length],
    valore: 25000 + i * 4500,
    note: ["Approvazione CFO pendente","Allineamento con Legal in corso","Da rivedere SLA","Contratto quadro applicabile","RFI completata, RFP in stesura","Vendor lock-in da verificare"][i % 6],
  };
});

function Page() {
  return (
    <AppShell
      title="Attività in corso"
      breadcrumb={["Procurement Execution","Attività in corso"]}
      filters={
        <>
          <Filter label="Buyer"><Select value="Tutti" options={["Tutti","Mario Rossi","Giulia Verdi","Luca Bianchi"]} /></Filter>
          <Filter label="Status"><Select value="Tutti" options={["Tutti", ...STATUS_VALUES]} /></Filter>
          <Filter label="Regime"><Select value="Tutti" options={["Tutti", ...REGIMI]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Attività in pipeline" value={String(ACTIVITIES.length)} />
        <Kpi label="RdA in approvazione" value={String(ACTIVITIES.filter(a => a.status === "RdA in approvazione").length)} />
        <Kpi label="Sourcing in corso" value={String(ACTIVITIES.filter(a => a.status === "Sourcing in corso").length)} />
        <Kpi label="Delta medio (gg)" value={(ACTIVITIES.reduce((s,a)=>s+a.delta,0)/ACTIVITIES.length).toFixed(1)} />
        <Kpi label="Chiusure previste Q3" value="11" />
      </div>

      <Panel title="Funnel di processo" className="mb-3">
        <div className="p-3 flex items-end justify-between gap-2">
          {FUNNEL_STEPS.map((s, i) => {
            const w = 100 - i * 8;
            return (
              <div key={s.k} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[11px] font-semibold tabular-nums">{s.n}</div>
                <div className="h-20 w-full rounded grid place-items-center text-white text-[12px] font-semibold" style={{ background: s.color, width: `${w}%` }}>
                  Step {i + 1}
                </div>
                <div className="text-[11px] text-center">{s.k}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">{Math.round(s.n / FUNNEL_STEPS[0].n * 100)}%</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Attività in corso · vista tabellare" className="mb-3">

        <table className="btable">
          <thead>
            <tr>
              <th>ID Fabbisogno</th>
              <th>Numero RdA</th>
              <th>Buyer</th>
              <th>Regime (SS/SO/PR)</th>
              <th>Tipologia procedura</th>
              <th className="num">Importanza (1-5)</th>
              <th className="num">Complessità (1-5)</th>
              <th>Status</th>
              <th>Data inizio attività</th>
              <th className="num">Δ gg fine att.</th>
              <th>Data fine attività</th>
              <th>Drill</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVITIES.map(a => (
              <tr key={a.id}>
                <td className="font-semibold">{a.id}</td>
                <td>{a.rda}</td>
                <td>{a.buyer}</td>
                <td><span className="chip">{a.regime}</span></td>
                <td>{a.procedura}</td>
                <td className="num">{a.importanza}</td>
                <td className="num">{a.complessita}</td>
                <td><span className="chip">{a.status}</span></td>
                <td>{a.dataInizio}</td>
                <td className={`num ${a.delta > 0 ? "text-[var(--danger)] font-semibold" : a.delta < 0 ? "text-[var(--success)]" : ""}`}>
                  {a.delta > 0 ? `+${a.delta}` : a.delta}
                </td>
                <td>{a.dataFine}</td>
                <td>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="btn btn-ghost text-[10px] inline-flex items-center gap-1">
                        <Search className="w-3 h-3" /> Drill
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-3 text-[11px]">
                      <div className="font-semibold text-[12px] mb-2 pb-1 border-b">{a.id} · Dettaglio</div>
                      <div className="grid grid-cols-[110px_1fr] gap-y-1.5">
                        <div className="text-[var(--muted-foreground)]">Descrizione</div><div>{a.desc}</div>
                        <div className="text-[var(--muted-foreground)]">Referente</div><div>{a.referente}</div>
                        <div className="text-[var(--muted-foreground)]">Cat. merceologica</div><div>{a.categoria}</div>
                        <div className="text-[var(--muted-foreground)]">Valore stimato</div><div className="font-semibold">€ {a.valore.toLocaleString("it-IT")}</div>
                        <div className="text-[var(--muted-foreground)]">Note</div><div className="italic">{a.note}</div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Avanzamento per Buyer">
        <table className="btable">
          <thead><tr><th>Buyer</th><th className="num">Totale</th><th className="num">Completati</th><th className="num">In Ritardo</th><th>Avanzamento</th><th>SLA</th></tr></thead>
          <tbody>
            {BUYERS_SAL.map(b => {
              const pct = Math.round(b.done / b.total * 100);
              return (
                <tr key={b.name}>
                  <td className="font-medium">{b.name}</td>
                  <td className="num">{b.total}</td>
                  <td className="num">{b.done}</td>
                  <td className="num"><span className={b.late > 5 ? "text-[var(--danger)] font-semibold" : ""}>{b.late}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[var(--muted)] rounded">
                        <div className="h-full rounded" style={{ width: `${pct}%`, background: pct > 70 ? "var(--success)" : pct > 50 ? "var(--warning)" : "var(--danger)" }} />
                      </div>
                      <span className="w-10 text-right tabular-nums text-[11px]">{pct}%</span>
                    </div>
                  </td>
                  <td><StatusPill status={b.late > 6 ? "Rejected" : b.late > 3 ? "Pending" : "Approved"} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </AppShell>

  );
}
