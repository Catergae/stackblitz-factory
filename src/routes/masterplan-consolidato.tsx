import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill, Modal } from "@/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/masterplan-consolidato")({
  head: () => ({ meta: [{ title: "MasterPlan Consolidato · Procurement Planning" }] }),
  component: Page,
});

const COMPANIES = ["ABC", "DEF", "GHI"];
const TIPO = ["AR", "NA"] as const;
const STATUS_VALUES = ["Da approvare", "Approvato", "Freezato", "Rda inviata"] as const;
const BLSC = ["B", "L", "S", "C"] as const;
const PROCEDURE = ["Gara aperta", "Negoziata", "Affidamento diretto", "Accordo quadro"];
const CATEGORIE = ["IT & Cloud", "Servizi Prof.", "Logistica", "HR & Formazione", "Marketing", "Manutenzione", "Energy"];
const DIVISIONI = ["IT", "Finance", "Legal", "HR", "Operations"];
const REFERENTI = ["Mario Rossi", "Giulia Verdi", "Luca Bianchi", "Sara Neri"];
const BUYERS = ["A. Conti", "F. Marini", "P. Galli", "S. Romano"];

const NOTE_EXAMPLES: Record<number, string> = {
  0: "Allineato con strategia di categoria 2026.",
  3: "Verificare condizioni con vendor incumbent.",
  5: "Possibile sinergia con fabbisogno gemello DEF.",
  8: "Fabbisogno legato a progetto Polo Logistico.",
};

const MOTIVAZIONI_FV = [
  "Unico fornitore certificato sul mercato",
  "Continuità tecnologica su piattaforma esistente",
  "Vincolo contrattuale pluriennale in essere",
  "Know-how proprietario non replicabile",
];

const ROWS = Array.from({ length: 16 }, (_, i) => {
  const company = COMPANIES[i % COMPANIES.length];
  const tipo = TIPO[i % 2];
  const status = STATUS_VALUES[i % STATUS_VALUES.length];
  const valore = 30000 + i * 9500;
  const hasFV = i % 4 === 0;
  return {
    id: `202607${company}N${String(i + 1).padStart(2, "0")}`,
    descrizione: ["Servizi cloud Azure", "Consulenza M&A", "Audit ESG", "Manutenzione DC", "Implementazione SAP", "Servizi legal", "Trasporti EU", "Formazione managers"][i % 8],
    tipo,
    company,
    divisione: DIVISIONI[i % DIVISIONI.length],
    referente: REFERENTI[i % REFERENTI.length],
    buyer: BUYERS[i % BUYERS.length],
    valore,
    durata: [12, 24, 36, 18, 48][i % 5],
    dataRichRdA: `2026-${String(7 + (i % 5)).padStart(2, "0")}-${String(5 + (i % 20)).padStart(2, "0")}`,
    blsc: BLSC[i % 4],
    procedura: PROCEDURE[i % PROCEDURE.length],
    fornitoreVincolato: hasFV ? `Vendor ${i + 1}` : "",
    motivazioneFV: hasFV ? MOTIVAZIONI_FV[i % MOTIVAZIONI_FV.length] : "",
    status,
    nrRda: status === "Rda inviata" ? `RDA-2026-${String(1000 + i).padStart(4, "0")}` : "",
    dataRichStipula: `2026-${String(8 + (i % 4)).padStart(2, "0")}-${String(10 + (i % 18)).padStart(2, "0")}`,
    dataInizioVal: `2026-${String(10 + (i % 3)).padStart(2, "0")}-01`,
    bdg26: valore,
    bdg27: i % 2 ? Math.round(valore * 0.6) : 0,
    bdg28: i % 3 === 0 ? Math.round(valore * 0.4) : 0,
    bdg29: i % 4 === 0 ? Math.round(valore * 0.3) : 0,
    bdg30: i % 5 === 0 ? Math.round(valore * 0.2) : 0,
    importanza: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    complessita: (((i + 2) % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    categoria: CATEGORIE[i % CATEGORIE.length],
  };
});

function NoteCell({ idx, id }: { idx: number; id: string }) {
  const [val, setVal] = useState(NOTE_EXAMPLES[idx] ?? "");
  const has = val.trim().length > 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Note SUPC"
          className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[var(--accent-soft)] transition-colors ${
            has ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"
          }`}
        >
          <MessageCircle size={15} strokeWidth={has ? 2.4 : 1.8} fill={has ? "var(--accent-soft)" : "none"} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5">
          Note SUPC · {id}
        </div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          rows={4}
          placeholder="Aggiungi una nota SUPC..."
          className="w-full text-[12px] border border-[var(--border-strong)] rounded p-2 outline-none focus:border-[var(--accent)] resize-none"
        />
        <div className="text-[10px] text-[var(--muted-foreground)] mt-1.5 mb-2">
          Esempi: strategia categoria · vincoli tecnici · sinergia · vendor incumbent.
        </div>
        <div className="flex justify-end gap-1.5">
          <button className="btn btn-ghost text-[11px]">Annulla</button>
          <button className="btn btn-primary text-[11px]">Salva</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Page() {
  const [drill, setDrill] = useState<string | null>(null);

  const drillRow = ROWS.find((r) => r.id === drill);

  const freezati = ROWS.filter((r) => r.status === "Freezato");
  const totValue = ROWS.reduce((s, r) => s + r.valore, 0);
  const freezValue = freezati.reduce((s, r) => s + r.valore, 0);
  const pctCount = ROWS.length ? Math.round((freezati.length / ROWS.length) * 100) : 0;
  const pctValue = totValue ? Math.round((freezValue / totValue) * 100) : 0;

  const [scopeTab, setScopeTab] = useState<"scope" | "freeze">("scope");
  const [pctTab, setPctTab] = useState<"count" | "value">("count");

  // Top vendor (aggregato per fornitore vincolato — simulato per fabbisogno)
  const vendorMap: Record<string, number> = {};
  ROWS.forEach((r, i) => {
    const v = r.fornitoreVincolato || `Vendor ${(i % 7) + 1}`;
    vendorMap[v] = (vendorMap[v] || 0) + r.valore;
  });
  const topVendors = Object.entries(vendorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  const maxVendor = topVendors[0]?.[1] || 1;

  // 5-year spend distribution
  const yearTot = {
    "BDG 2026": ROWS.reduce((s, r) => s + r.bdg26, 0),
    "BDG 2027": ROWS.reduce((s, r) => s + r.bdg27, 0),
    "BDG 2028": ROWS.reduce((s, r) => s + r.bdg28, 0),
    "BDG 2029": ROWS.reduce((s, r) => s + r.bdg29, 0),
    "BDG ≥2030": ROWS.reduce((s, r) => s + r.bdg30, 0),
  };
  const maxYear = Math.max(...Object.values(yearTot));

  const insights = [
    "Concentrazione categoria 'IT & Cloud' su Vendor 1 al 42% — rischio lock-in elevato.",
    "Spesa 2026 sovra-pesata (61% del totale 5y): valutare slittamenti su 2027/2028.",
    "5 fabbisogni AR oltre soglia con fornitore vincolato senza motivazione registrata.",
    "Divisione Finance: 3 fabbisogni con data richiesta RdA in ritardo > 15gg.",
    "Risparmio potenziale stimato € 1,2M consolidando 4 fabbisogni 'Servizi Prof.' su accordo quadro.",
  ];

  return (
    <AppShell
      title="MasterPlan Consolidato"
      breadcrumb={["Master Plan", "Consolidato"]}
      actions={
        <>
          <button className="btn btn-ghost">↻ Refresh</button>
          <button className="btn btn-ghost">⤓ Export</button>
        </>
      }
      filters={
        <>
          <Filter label="Società"><Select value="Tutte" options={["Tutte", ...COMPANIES]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte", ...DIVISIONI]} /></Filter>
          <Filter label="Referente"><Select value="Tutti" options={["Tutti", ...REFERENTI]} /></Filter>
          <Filter label="Nr Fabbisogno"><Select value="Tutti" options={["Tutti", ...ROWS.map((r) => r.id)]} /></Filter>
          <Filter label="Status"><Select value="Tutti" options={["Tutti", ...STATUS_VALUES]} /></Filter>
          <Filter label="B/L/S/C"><Select value="Tutti" options={["Tutti", "B", "L", "S", "C"]} /></Filter>
          <Filter label="Importanza"><Select value="Tutte" options={["Tutte", "1", "2", "3", "4", "5"]} /></Filter>
          <Filter label="Complessità"><Select value="Tutte" options={["Tutte", "1", "2", "3", "4", "5"]} /></Filter>
          <Filter label="Regime applicabile"><Select value="Tutti" options={["Tutti", "SS", "SO", "PR"]} /></Filter>
        </>
      }
      legend
    >
      {/* KPIs allineati a Requesting Unit */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Fabbisogni freezati" value={`${freezati.length}/${ROWS.length}`} />
        <div className="kpi">
          <div className="kpi-label">{scopeTab === "scope" ? "Valore economico in scope" : "Valore economico freezato"}</div>
          <div className="kpi-value">€ {fmt(scopeTab === "scope" ? totValue : freezValue)}</div>
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => setScopeTab("scope")}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${scopeTab === "scope" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border-strong)] text-[var(--muted-foreground)]"}`}
            >In scope</button>
            <button
              onClick={() => setScopeTab("freeze")}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${scopeTab === "freeze" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border-strong)] text-[var(--muted-foreground)]"}`}
            >Freezato</button>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">{pctTab === "count" ? "% Freeze (conteggio)" : "% Freeze (valore)"}</div>
          <div className="kpi-value">{pctTab === "count" ? pctCount : pctValue}%</div>
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => setPctTab("count")}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${pctTab === "count" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border-strong)] text-[var(--muted-foreground)]"}`}
            >Conteggio</button>
            <button
              onClick={() => setPctTab("value")}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${pctTab === "value" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border-strong)] text-[var(--muted-foreground)]"}`}
            >Valore</button>
          </div>
        </div>
        <Kpi label="Da approvare" value={String(ROWS.filter((r) => r.status === "Da approvare").length)} />
        <Kpi label="Approvati" value={String(ROWS.filter((r) => r.status === "Approvato").length)} />
      </div>

      <Panel title="MasterPlan">
        <div className="overflow-auto max-h-[480px]">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h">ID Fabbisogno</th>
                <th>Descrizione fabbisogno</th>
                <th>Tipologia (AR/NA)</th>
                <th>Società</th>
                <th>Divisione</th>
                <th>Referente</th>
                <th>Buyer</th>
                <th className="num">Importo stimato (€)</th>
                <th className="num">Durata (mesi)</th>
                <th>Data rich. approvazione RdA</th>
                <th>B/L/S/C</th>
                <th>Tipologia procedura</th>
                <th>Fornitore Vincolato</th>
                <th>Status</th>
                <th>NR RdA</th>
                <th>Note SUPC</th>
                <th>Drill</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.id}>
                  <td className="frozen font-semibold">{r.id}</td>
                  <td>{r.descrizione}</td>
                  <td><span className="chip">{r.tipo}</span></td>
                  <td>{r.company}</td>
                  <td>{r.divisione}</td>
                  <td>{r.referente}</td>
                  <td>{r.buyer}</td>
                  <td className="num">{fmt(r.valore)}</td>
                  <td className="num">{r.durata}</td>
                  <td>{r.dataRichRdA}</td>
                  <td className="text-center"><span className="chip">{r.blsc}</span></td>
                  <td>{r.procedura}</td>
                  <td>{r.fornitoreVincolato || <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td>{r.nrRda || <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="text-center"><NoteCell idx={i} id={r.id} /></td>
                  <td className="drill" onClick={() => setDrill(r.id)}>Drill ▾</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Spazio sotto: top vendor + distribuzione 5y + AI insights */}
      <div className="grid grid-cols-3 gap-3 mt-3">
        <Panel title="Top Vendor (€)">
          <div className="p-3 space-y-1.5">
            {topVendors.map(([v, val]) => (
              <div key={v} className="flex items-center gap-2 text-[11.5px]">
                <span className="w-24 truncate" title={v}>{v}</span>
                <div className="flex-1 h-3 bg-[var(--muted)] rounded">
                  <div className="h-full rounded bg-[var(--primary)]" style={{ width: `${(val / maxVendor) * 100}%` }} />
                </div>
                <span className="w-20 text-right tabular-nums">€ {fmt(val)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Distribuzione spesa 5 anni">
          <div className="p-3 flex items-end gap-2 h-40">
            {Object.entries(yearTot).map(([y, v]) => (
              <div key={y} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full bg-[var(--accent)] opacity-90 rounded-t-sm flex items-start justify-center text-[10px] text-white font-semibold pt-0.5"
                  style={{ height: `${(v / maxYear) * 100}%`, minHeight: 16 }}
                >
                  € {fmt(v)}
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)]">{y}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="AI Insights · Top 5 suggerimenti">
          <div className="divide-y text-[12px]">
            {insights.map((s, i) => (
              <div key={i} className="flex gap-2 px-3 py-2">
                <span className="text-[var(--accent)] font-bold">{i + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Modal
        open={!!drill}
        onClose={() => setDrill(null)}
        title={`Drill fabbisogno · ${drill ?? ""}`}
        subtitle="Dettaglio economico, tempistiche e classificazione"
      >
        {drillRow && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data richiesta stipula contratto" value={drillRow.dataRichStipula} />
              <Field label="Data richiesta inizio validità contratto" value={drillRow.dataInizioVal} />
              <Field label="Importanza (1-5)" value={String(drillRow.importanza)} />
              <Field label="Complessità (1-5)" value={String(drillRow.complessita)} />
              <Field label="Categoria merceologica" value={drillRow.categoria} />
              <Field label="Fornitore vincolato" value={drillRow.fornitoreVincolato || "—"} />
            </div>

            {drillRow.fornitoreVincolato && (
              <div>
                <div className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)] mb-1">Motivazione fornitore vincolato</div>
                <div className="text-[12px] border rounded p-2 bg-[var(--muted)]">{drillRow.motivazioneFV}</div>
              </div>
            )}

            <div>
              <div className="text-[11px] font-semibold mb-1.5">Budget pluriennale</div>
              <table className="btable">
                <thead>
                  <tr>
                    <th className="num">BDG 2026</th>
                    <th className="num">BDG 2027</th>
                    <th className="num">BDG 2028</th>
                    <th className="num">BDG 2029</th>
                    <th className="num">BDG 2030 e oltre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="num">{fmt(drillRow.bdg26)}</td>
                    <td className="num">{drillRow.bdg27 ? fmt(drillRow.bdg27) : "-"}</td>
                    <td className="num">{drillRow.bdg28 ? fmt(drillRow.bdg28) : "-"}</td>
                    <td className="num">{drillRow.bdg29 ? fmt(drillRow.bdg29) : "-"}</td>
                    <td className="num">{drillRow.bdg30 ? fmt(drillRow.bdg30) : "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)] mb-1">Note SUPC</div>
              <div className="text-[12px] border rounded p-2 bg-[var(--muted)]">
                {NOTE_EXAMPLES[ROWS.findIndex((r) => r.id === drillRow.id)] ?? "—"}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

const CATEGORIES_FOR_VIEW = ["IT & Cloud", "Servizi Prof.", "Logistica", "HR & Formazione", "Marketing", "Manutenzione", "Energy"];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)]">{label}</div>
      <div className="text-[12px] font-medium">{value}</div>
    </div>
  );
}
