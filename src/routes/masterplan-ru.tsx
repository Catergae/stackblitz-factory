import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Pencil } from "lucide-react";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill, Modal } from "@/components/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/masterplan-ru")({
  head: () => ({ meta: [{ title: "MasterPlan Requesting Unit · Procurement Planning" }] }),
  component: Page,
});

const COMPANIES = ["ABC", "DEF", "GHI"];
const TIPO = ["AR", "NA"] as const;
const STATUS_VALUES = ["Da approvare", "Approvato", "Freezato", "Rda inviata"] as const;
const ORGANI = ["CdA", "Comitato Acquisti", "Direzione Generale", "AD"];

const NOTE_EXAMPLES: Record<number, string> = {
  0: "Allineato con strategia di categoria 2026.",
  2: "Verificare condizioni con vendor incumbent.",
  4: "Possibile sinergia con fabbisogno gemello DEF.",
  6: "Fabbisogno legato a progetto Polo Logistico.",
};

const ROWS = Array.from({ length: 14 }, (_, i) => {
  const company = COMPANIES[i % COMPANIES.length];
  const tipo = TIPO[i % 2];
  const status = STATUS_VALUES[i % STATUS_VALUES.length];
  const valore = 30000 + i * 7000;
  return {
    id: `202607${company}N${String(i + 1).padStart(2, "0")}`,
    descrizione: ["Servizi cloud Azure", "Consulenza M&A", "Audit ESG", "Manutenzione DC", "Implement. SAP", "Servizi legal"][i % 6],
    tipo,
    owner: ["Mario Rossi", "Giulia Verdi", "Luca Bianchi", "Sara Neri"][i % 4],
    fornitoreVincolato: i % 3 === 0 ? `Vendor ${i + 1}` : "",
    divisione: ["IT", "Finance", "Legal", "HR"][i % 4],
    company,
    progetto: `${company}2026${String.fromCharCode(65 + (i % 6))}${String.fromCharCode(65 + ((i + 3) % 6))}`,
    magazzino: i % 4 === 0 ? "Sì" : "No",
    organo: ORGANI[i % ORGANI.length],
    valore,
    durata: [12, 24, 36, 18, 48][i % 5],
    bdg26: valore,
    bdg27: i % 2 ? Math.round(valore * 0.6) : 0,
    bdg28: i % 3 === 0 ? Math.round(valore * 0.4) : 0,
    bdg29: i % 4 === 0 ? Math.round(valore * 0.3) : 0,
    bdg30: i % 5 === 0 ? Math.round(valore * 0.2) : 0,
    importanza: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    dataRichRdA: `2026-${String(7 + (i % 5)).padStart(2, "0")}-${String(5 + (i % 20)).padStart(2, "0")}`,
    dataRichStipula: `2026-${String(8 + (i % 4)).padStart(2, "0")}-${String(10 + (i % 18)).padStart(2, "0")}`,
    dataInizioVal: `2026-${String(10 + (i % 3)).padStart(2, "0")}-01`,
    status,
  };
});

function NoteCell({ idx, id }: { idx: number; id: string }) {
  const [val, setVal] = useState(NOTE_EXAMPLES[idx] ?? "");
  const has = val.trim().length > 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Note tecniche"
          className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[var(--accent-soft)] transition-colors ${
            has ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"
          }`}
        >
          <MessageCircle size={15} strokeWidth={has ? 2.4 : 1.8} fill={has ? "var(--accent-soft)" : "none"} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-1.5">
          Note tecniche · {id}
        </div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          rows={4}
          placeholder="Aggiungi una nota tecnica..."
          className="w-full text-[12px] border border-[var(--border-strong)] rounded p-2 outline-none focus:border-[var(--accent)] resize-none"
        />
        <div className="text-[10px] text-[var(--muted-foreground)] mt-1.5 mb-2">
          Esempi: allineamento strategia · vincoli tecnici · sinergia categoria · vendor incumbent.
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

  const freezati = ROWS.filter((r) => r.status === "Freezato");
  const totValue = ROWS.reduce((s, r) => s + r.valore, 0);
  const freezValue = freezati.reduce((s, r) => s + r.valore, 0);
  const pctCount = ROWS.length ? Math.round((freezati.length / ROWS.length) * 100) : 0;
  const pctValue = totValue ? Math.round((freezValue / totValue) * 100) : 0;

  const [scopeTab, setScopeTab] = useState<"scope" | "freeze">("scope");
  const [pctTab, setPctTab] = useState<"count" | "value">("count");

  return (
    <AppShell
      title="MasterPlan · Requesting Unit"
      breadcrumb={["Master Plan", "Requesting Unit"]}
      actions={
        <>
          <button className="btn btn-ghost">↻ Refresh</button>
          <button className="btn btn-ghost">⤓ Extract</button>
        </>
      }
      filters={
        <>
          <Filter label="Società"><Select value="Tutte" options={["Tutte", "ABC", "DEF", "GHI"]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte", "IT", "Finance", "Legal", "HR"]} /></Filter>
          <Filter label="Owner Fabbisogno"><Select value="Tutti" options={["Tutti", "Mario Rossi", "Giulia Verdi", "Luca Bianchi", "Sara Neri"]} /></Filter>
          <Filter label="Fornitore"><Select value="Tutti" options={["Tutti", "Vendor 1", "Vendor 2", "Vendor 3"]} /></Filter>
          <Filter label="Importanza"><Select value="Tutte" options={["Tutte", "1", "2", "3", "4", "5"]} /></Filter>
          <Filter label="Status"><Select value="Tutti" options={["Tutti", ...STATUS_VALUES]} /></Filter>
        </>
      }
      legend
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Fabbisogni freezati" value={`${freezati.length}/${ROWS.length}`} delta={`${pctCount}% sul totale`} trend="up" />
        <div className="kpi">
          <div className="flex items-center justify-between mb-0.5">
            <div className="kpi-label">{scopeTab === "scope" ? "Valore economico in scope" : "Valore economico freezato"}</div>
          </div>
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
        <Kpi label="Da approvare" value={String(ROWS.filter((r) => r.status === "Da approvare").length)} hint="vs SLA" />
        <Kpi label="Approvati" value={String(ROWS.filter((r) => r.status === "Approvato").length)} />
      </div>

      <Panel>
        <div className="px-3 py-2 border-b flex items-center gap-2">
          <button className="btn btn-primary text-[11px]">✓ Approva selezionati</button>
          <span className="text-[11px] text-[var(--muted-foreground)]">Seleziona una o più righe dalla colonna di sinistra per approvare in massa</span>
        </div>
        <div className="overflow-auto max-h-[calc(100vh-260px)]">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h" style={{ width: 32 }}><input type="checkbox" /></th>
                <th className="frozen h" style={{ left: 32, width: 36 }}></th>
                <th className="frozen h" style={{ left: 68 }}>ID Fabbisogno</th>
                <th>Descrizione fabbisogno</th>
                <th>Tipo fabbisogno (AR/NA)</th>
                <th>Owner</th>
                <th>Divisione</th>
                <th>Organo deliberante</th>
                <th>Cod. progetto / commessa</th>
                <th>Magazzino (sì/no)</th>
                <th>Fornitore Vincolato</th>
                <th className="num">Valore Stimato (€)</th>
                <th className="num">Durata contrattuale (mesi)</th>
                <th className="num">BDG 2026</th>
                <th className="num">BDG 2027</th>
                <th className="num">BDG 2028</th>
                <th className="num">BDG 2029</th>
                <th className="num">BDG 2030 e oltre</th>
                <th>Importanza (1-5)</th>
                <th>Data richiesta approvazione RdA</th>
                <th>Data richiesta stipula contratto</th>
                <th>Data inizio validità contratto</th>
                <th>Status</th>
                <th>Note tecniche</th>
                <th>Drill</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const editable = r.status !== "Freezato";
                return (
                  <tr key={r.id}>
                    <td className="frozen"><input type="checkbox" /></td>
                    <td className="frozen text-center" style={{ left: 32 }}>
                      {editable ? (
                        <button aria-label="Modifica fabbisogno" className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[var(--accent-soft)] text-[var(--accent)]">
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                      ) : (
                        <span className="text-[var(--muted-foreground)] text-[10px]">—</span>
                      )}
                    </td>
                    <td className="frozen font-semibold" style={{ left: 68 }}>{r.id}</td>
                    <td>{r.descrizione}</td>
                    <td><span className="chip">{r.tipo}</span></td>
                    <td>{r.owner}</td>
                    <td>{r.divisione}</td>
                    <td>{r.organo}</td>
                    <td>{r.progetto}</td>
                    <td className="text-center">{r.magazzino}</td>
                    <td>{r.fornitoreVincolato || <span className="text-[var(--muted-foreground)]">—</span>}</td>
                    <td className="num">{fmt(r.valore)}</td>
                    <td className="num">{r.durata}</td>
                    <td className="num">{fmt(r.bdg26)}</td>
                    <td className="num">{r.bdg27 ? fmt(r.bdg27) : "-"}</td>
                    <td className="num">{r.bdg28 ? fmt(r.bdg28) : "-"}</td>
                    <td className="num">{r.bdg29 ? fmt(r.bdg29) : "-"}</td>
                    <td className="num">{r.bdg30 ? fmt(r.bdg30) : "-"}</td>
                    <td className="edit text-center">{r.importanza}</td>
                    <td>{r.dataRichRdA}</td>
                    <td>{r.dataRichStipula}</td>
                    <td>{r.dataInizioVal}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td className="text-center"><NoteCell idx={i} id={r.id} /></td>
                    <td className="drill" onClick={() => r.tipo === "AR" && setDrill(r.id)}>
                      {r.tipo === "AR" ? "Drill ▾" : <span className="text-[var(--muted-foreground)]">—</span>}
                    </td>
                  </tr>
                );
              })}
              <tr className="total">
                <td colSpan={11} className="frozen">TOTALE</td>
                <td className="num">{fmt(ROWS.reduce((s, r) => s + r.valore, 0))}</td>
                <td></td>
                <td className="num">{fmt(ROWS.reduce((s, r) => s + r.bdg26, 0))}</td>
                <td className="num">{fmt(ROWS.reduce((s, r) => s + r.bdg27, 0))}</td>
                <td className="num">{fmt(ROWS.reduce((s, r) => s + r.bdg28, 0))}</td>
                <td className="num">{fmt(ROWS.reduce((s, r) => s + r.bdg29, 0))}</td>
                <td className="num">{fmt(ROWS.reduce((s, r) => s + r.bdg30, 0))}</td>
                <td colSpan={7}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={!!drill}
        onClose={() => setDrill(null)}
        title={`Drill AR · ${drill ?? ""}`}
        subtitle="Dettaglio contratto in scadenza collegato al fabbisogno AR"
      >
        <table className="btable">
          <thead>
            <tr>
              <th>Codice Contratto in scadenza</th>
              <th className="num">% Valore residuo contratto scadenza</th>
              <th className="num">Tempo residuo contratto scadenza (gg)</th>
              <th>Motivazione scostamento valore rinnovo</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>
                <td className="font-semibold">CTR{String(100 + i).padStart(3, "0")}</td>
                <td className="num suggest">{60 - i * 10}%</td>
                <td className="num">{180 - i * 40}</td>
                <td className="edit">{["Variazione perimetro +12%", "Indicizzazione IPC 2026", "Ampliamento SLA notturni"][i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </AppShell>
  );
}
