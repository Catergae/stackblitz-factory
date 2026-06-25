import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill, Modal } from "@/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/masterplan-supc")({
  head: () => ({ meta: [{ title: "MasterPlan SUPC · Procurement Planning" }] }),
  component: Page,
});

const COMPANIES = ["ABC", "DEF", "GHI"];
const BUYERS = ["Mario Rossi", "Giulia Verdi", "Luca Bianchi", "Sara Neri"];
const REFERENTI = ["A. Conti", "P. Russo", "M. Greco", "L. Marini"];
const BLSC = ["B", "L", "S", "C"] as const;
const BLSC_LABEL: Record<string, string> = { B: "Bottleneck", L: "Leverage", S: "Strategic", C: "Non-critical" };
const CATEGORIE = ["IT Services", "Consulenza", "Facility", "Logistica", "Legal", "Energy"];
const REGIMI = ["SS", "SO", "PR"] as const;
const PROCEDURE = ["Gara aperta", "Negoziata", "Affidamento diretto", "Framework"];
const QUALIFICA = ["Sì", "No", "Da creare", "Da rinnovare"] as const;
const STATUS_VALUES = ["Approvato", "Data RdA Approvata", "Freezato", "Rda inviata"] as const;

const NOTE_EXAMPLES: Record<number, string> = {
  0: "Strategia di gara competitiva confermata con CFO.",
  2: "Negoziazione diretta con incumbent, saving atteso 4%.",
  4: "Framework agreement in via di rinnovo.",
  6: "Verificare albo fornitori qualificati.",
};

const ROWS = Array.from({ length: 14 }, (_, i) => {
  const company = COMPANIES[i % COMPANIES.length];
  const blsc = BLSC[i % 4];
  const valore = 30000 + i * 7000;
  const isVincolato = i % 4 === 0;
  return {
    id: `202607${company}Z${String(i + 1).padStart(2, "0")}`,
    descrizione: ["Servizi cloud", "Consulenza M&A", "Audit ESG", "Manutenzione DC", "Implement. SAP", "Servizi legal"][i % 6],
    referente: REFERENTI[i % REFERENTI.length],
    buyer: BUYERS[i % BUYERS.length],
    blsc,
    categoria: CATEGORIE[i % CATEGORIE.length],
    valore,
    durata: [12, 24, 36, 18, 48][i % 5],
    importanza: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    dataRichStipula: `2026-${String(8 + (i % 4)).padStart(2, "0")}-${String(10 + (i % 18)).padStart(2, "0")}`,
    dataInizioVal: `2026-${String(10 + (i % 3)).padStart(2, "0")}-01`,
    fornitoreVincolato: isVincolato ? `Vendor ${i + 1}` : "",
    motivVincolo: isVincolato ? ["Esclusiva tecnologica", "Continuità servizio critico", "Brevetto / IP unico"][i % 3] : "",
    qualifica: QUALIFICA[i % 4],
    nQualificati: 1 + ((i * 3) % 8),
    regime: REGIMI[i % 3],
    procedura: PROCEDURE[i % PROCEDURE.length],
    complessita: (((i + 2) % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    dataRichRdA: `2026-${String(7 + (i % 5)).padStart(2, "0")}-${String(5 + (i % 20)).padStart(2, "0")}`,
    status: STATUS_VALUES[i % STATUS_VALUES.length],
    bdg26: valore,
    bdg27: i % 2 ? Math.round(valore * 0.6) : 0,
    bdg28: i % 3 === 0 ? Math.round(valore * 0.4) : 0,
    bdg29: i % 4 === 0 ? Math.round(valore * 0.3) : 0,
    bdg30: i % 5 === 0 ? Math.round(valore * 0.2) : 0,
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
          Esempi: strategia di gara · saving target · qualifica fornitore · framework attivo.
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
  const [valTab, setValTab] = useState<"count" | "value">("count");

  const approvati = ROWS.filter((r) => r.status === "Approvato" || r.status === "Data RdA Approvata");
  const freezati = ROWS.filter((r) => r.status === "Freezato");
  const totValue = ROWS.reduce((s, r) => s + r.valore, 0);
  const apprValue = approvati.reduce((s, r) => s + r.valore, 0);
  const freezValue = freezati.reduce((s, r) => s + r.valore, 0);
  const pctAppr = ROWS.length ? Math.round((approvati.length / ROWS.length) * 100) : 0;
  const pctFreez = ROWS.length ? Math.round((freezati.length / ROWS.length) * 100) : 0;

  // Kraljic 5x5 distribution (importanza row 1..5 top->bottom inverted, complessità col 1..5)
  const kraljic: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  ROWS.forEach((r) => { kraljic[r.importanza - 1][r.complessita - 1] += 1; });

  // B/L/S/C distribution
  const blscDist = BLSC.map((k) => ({
    key: k,
    label: BLSC_LABEL[k],
    count: ROWS.filter((r) => r.blsc === k).length,
    value: ROWS.filter((r) => r.blsc === k).reduce((s, r) => s + r.valore, 0),
  }));
  const blscColors: Record<string, string> = {
    B: "var(--warning)", L: "var(--success)", S: "var(--accent)", C: "var(--muted-foreground)",
  };
  const blscTotal = blscDist.reduce((s, d) => s + (valTab === "count" ? d.count : d.value), 0) || 1;

  const drillRow = ROWS.find((r) => r.id === drill);

  return (
    <AppShell
      title="MasterPlan · SUPC (Buyer)"
      breadcrumb={["Master Plan", "SUPC"]}
      filters={
        <>
          <Filter label="Società"><Select value="Tutte" options={["Tutte", ...COMPANIES]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte", "IT", "Finance", "Legal", "HR"]} /></Filter>
          <Filter label="Referente"><Select value="Tutti" options={["Tutti", ...REFERENTI]} /></Filter>
          <Filter label="ID Fabbisogno"><input className="w-full text-[12px] border rounded px-2 py-1" placeholder="es. 202607ABCZ12" /></Filter>
        </>
      }
      legend
    >
      {/* Top: 2 tabbed scorecards + 2 % scorecards */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="kpi">
          <div className="flex items-center justify-between mb-0.5">
            <div className="kpi-label">{valTab === "count" ? "Fabbisogni approvati" : "Spesa approvata"}</div>
          </div>
          <div className="kpi-value">{valTab === "count" ? `${approvati.length}/${ROWS.length}` : `€ ${fmt(apprValue)}`}</div>
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => setValTab("count")}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${valTab === "count" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border-strong)] text-[var(--muted-foreground)]"}`}
            >Conteggio</button>
            <button
              onClick={() => setValTab("value")}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${valTab === "value" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border-strong)] text-[var(--muted-foreground)]"}`}
            >Valore</button>
          </div>
        </div>
        <div className="kpi">
          <div className="flex items-center justify-between mb-0.5">
            <div className="kpi-label">{valTab === "count" ? "Fabbisogni freezati" : "Spesa freezata"}</div>
          </div>
          <div className="kpi-value">{valTab === "count" ? `${freezati.length}/${ROWS.length}` : `€ ${fmt(freezValue)}`}</div>
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => setValTab("count")}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${valTab === "count" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border-strong)] text-[var(--muted-foreground)]"}`}
            >Conteggio</button>
            <button
              onClick={() => setValTab("value")}
              className={`text-[10px] px-1.5 py-0.5 rounded border ${valTab === "value" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border-strong)] text-[var(--muted-foreground)]"}`}
            >Valore</button>
          </div>
        </div>
        <Kpi label="% Approvati" value={`${pctAppr}%`} />
        <Kpi label="% Freezata" value={`${pctFreez}%`} />
      </div>

      {/* Center: B/L/S/C bar + Tipo Procedura bar + Kraljic compact */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Panel title="Distribuzione per categoria B/L/S/C">
          <div className="p-3 flex items-center gap-4">
            <div className="flex-1 h-7 flex rounded overflow-hidden border">
              {blscDist.map((d) => {
                const v = valTab === "count" ? d.count : d.value;
                const pct = Math.round((v / blscTotal) * 100);
                return (
                  <div
                    key={d.key}
                    className="grid place-items-center text-white text-[11px] font-semibold"
                    style={{ width: `${pct}%`, background: blscColors[d.key] }}
                    title={`${d.key}: ${valTab === "count" ? d.count : `€ ${fmt(d.value)}`}`}
                  >
                    {pct > 6 ? `${d.key} ${pct}%` : ""}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-3 pb-3 flex gap-4 text-[11px]">
            {blscDist.map((d) => (
              <div key={d.key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: blscColors[d.key] }} />
                <span className="font-semibold">{d.key}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Distribuzione per Tipo Procedura">
          {(() => {
            const procDist = PROCEDURE.map((p, idx) => ({
              key: p,
              count: ROWS.filter((r) => r.procedura === p).length,
              value: ROWS.filter((r) => r.procedura === p).reduce((s, r) => s + r.valore, 0),
              color: ["var(--accent)", "var(--primary)", "var(--warning)", "var(--success)"][idx % 4],
            }));
            const tot = procDist.reduce((s, d) => s + (valTab === "count" ? d.count : d.value), 0) || 1;
            return (
              <>
                <div className="p-3 flex items-center gap-4">
                  <div className="flex-1 h-7 flex rounded overflow-hidden border">
                    {procDist.map((d) => {
                      const v = valTab === "count" ? d.count : d.value;
                      const pct = Math.round((v / tot) * 100);
                      return (
                        <div
                          key={d.key}
                          className="grid place-items-center text-white text-[11px] font-semibold"
                          style={{ width: `${pct}%`, background: d.color }}
                          title={`${d.key}: ${valTab === "count" ? d.count : `€ ${fmt(d.value)}`}`}
                        >
                          {pct > 8 ? `${pct}%` : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="px-3 pb-3 grid grid-cols-2 gap-1 text-[11px]">
                  {procDist.map((d) => (
                    <div key={d.key} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                      <span>{d.key}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </Panel>
        <Panel title="Matrice di Kraljic">
          <div className="p-2 flex justify-center">
            <div className="inline-flex flex-col items-center">
              <div className="text-[10px] text-[var(--muted-foreground)] mb-1">Complessità →</div>
              <div className="flex items-start gap-1">
                <div className="flex flex-col-reverse justify-between text-[10px] text-[var(--muted-foreground)] pr-1 h-[150px]">
                  {[1, 2, 3, 4, 5].map((n) => <div key={n}>{n}</div>)}
                </div>
                <div>
                  <div className="grid" style={{ gridTemplateColumns: "repeat(5, 22px)", gap: 2 }}>
                    {[5, 4, 3, 2, 1].flatMap((imp) =>
                      [1, 2, 3, 4, 5].map((cpl) => {
                        const c = kraljic[imp - 1][cpl - 1];
                        const intensity = Math.min(1, c / 4);
                        return (
                          <div
                            key={`${imp}-${cpl}`}
                            className="h-6 grid place-items-center text-[10px] font-semibold rounded-sm border"
                            style={{
                              background: c ? `rgba(96, 1, 209, ${0.1 + intensity * 0.55})` : "var(--muted)",
                              color: c && intensity > 0.45 ? "white" : "var(--foreground)",
                              borderColor: "var(--border)",
                            }}
                          >
                            {c || ""}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1 px-0.5">
                    {[1, 2, 3, 4, 5].map((n) => <div key={n}>{n}</div>)}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-1">↑ Importanza</div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="px-3 py-2 border-b flex items-center gap-2">
          <button className="btn btn-primary text-[11px]">✓ Conferma data richiesta RdA</button>
          <span className="text-[11px] text-[var(--muted-foreground)]">Seleziona una o più righe per confermare la data richiesta RdA</span>
        </div>
        <div className="overflow-auto max-h-[calc(100vh-260px)]">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h" style={{ width: 32 }}><input type="checkbox" /></th>
                <th className="frozen h" style={{ left: 32 }}>ID Fabbisogno</th>
                <th>Descrizione Fabbisogno</th>
                <th>Referente</th>
                <th>Category/Buyer di riferimento</th>
                <th>B/L/S/C</th>
                <th>Categoria merceologica</th>
                <th className="num">Importo stimato (€)</th>
                <th className="num">Durata contrattuale (mesi)</th>
                <th>Importanza (1-5)</th>
                <th>Data richiesta stipula contratto</th>
                <th>Data richiesta inizio validità</th>
                <th>Fornitore Vincolato</th>
                <th>Sistema di qualifica</th>
                <th className="num">N. fornitori qualificati</th>
                <th>Regime applicabile</th>
                <th>Tipo Procedura</th>
                <th>Complessità (1-5)</th>
                <th>Data richiesta approvazione RdA</th>
                <th>Status</th>
                <th>Note SUPC</th>
                <th>Drill</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.id}>
                  <td className="frozen"><input type="checkbox" /></td>
                  <td className="frozen font-semibold" style={{ left: 32 }}>{r.id}</td>
                  <td>{r.descrizione}</td>
                  <td>{r.referente}</td>
                  <td className="edit">{r.buyer}</td>
                  <td className="edit">
                    <select defaultValue={r.blsc} className="bg-transparent text-[11.5px] w-full">
                      {BLSC.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </td>
                  <td className="edit">
                    <select defaultValue={r.categoria} className="bg-transparent text-[11.5px] w-full">
                      {CATEGORIE.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="num">{fmt(r.valore)}</td>
                  <td className="num">{r.durata}</td>
                  <td className="text-center">{r.importanza}</td>
                  <td>{r.dataRichStipula}</td>
                  <td>{r.dataInizioVal}</td>
                  <td>{r.fornitoreVincolato || <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td>{r.qualifica}</td>
                  <td className="num">{r.nQualificati}</td>
                  <td className="edit">
                    <select defaultValue={r.regime} className="bg-transparent text-[11.5px] w-full">
                      {REGIMI.map((rg) => <option key={rg}>{rg}</option>)}
                    </select>
                  </td>
                  <td>{r.procedura}</td>
                  <td className="edit text-center">
                    <select defaultValue={r.complessita} className="bg-transparent text-[11.5px] w-full">
                      {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </td>
                  <td className="edit" style={{ color: "var(--danger)" }}>{r.dataRichRdA}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td className="text-center"><NoteCell idx={i} id={r.id} /></td>
                  <td className="drill" onClick={() => setDrill(r.id)}>Drill ▾</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={!!drill}
        onClose={() => setDrill(null)}
        title={`Dettaglio · ${drill ?? ""}`}
        subtitle="Distribuzione budget pluriennale e motivazioni"
      >
        {drillRow && (
          <>
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
            {drillRow.fornitoreVincolato && (
              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                  Motivazione fornitore vincolato
                </div>
                <div className="text-[12px] border border-[var(--border-strong)] rounded p-2 bg-[var(--muted)]">
                  <span className="font-semibold">{drillRow.fornitoreVincolato}</span> — {drillRow.motivVincolo}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </AppShell>
  );
}
