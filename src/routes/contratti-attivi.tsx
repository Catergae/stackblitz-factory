import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Filter, Select, MultiChip } from "@/components/AppShell";
import { Panel, Kpi, StatusPill, Modal, MiniBars } from "@/components/ui";
import { CONTRACTS, fmtEur, fmt } from "@/lib/seed";

export const Route = createFileRoute("/contratti-attivi")({
  head: () => ({ meta: [{ title: "Contratti Attivi · Procurement Planning" }] }),
  component: Page,
});

function Page() {
  const [sel, setSel] = useState<string | null>(null);
  const selected = CONTRACTS.find((c) => c.id === sel);
  const expiring90 = CONTRACTS.filter((c) => c.daysToEnd < 180).length;
  const monthly = Array.from({ length: 12 }, (_, m) =>
    CONTRACTS.filter((c) => parseInt(c.end.slice(5, 7)) === m + 1).length
  );

  return (
    <AppShell
      title="Lista Contratti Attivi"
      breadcrumb={["Demand Collection", "Contratti Attivi"]}
      actions={
        <>
          <button className="btn btn-ghost">↻ Refresh</button>
          <button className="btn btn-ghost">⤓ Export</button>
          <button className="btn btn-primary">→ Crea Rinnovo Massivo</button>
        </>
      }
      filters={
        <>
          <Filter label="Società"><MultiChip items={["ABC", "DEF"]} /></Filter>
          <Filter label="Divisione"><Select value="Tutte" options={["Tutte", ...new Set(CONTRACTS.map(c => c.division))]} /></Filter>
          <Filter label="Owner Contratto"><Select value="Tutti" options={["Tutti", "Mario Rossi", "Giulia Verdi", "Luca Bianchi"]} /></Filter>
          <Filter label="Fornitore"><Select value="Tutti" options={["Tutti", "Vendor 1", "Vendor 2", "Vendor 3"]} /></Filter>
          <Filter label="Mese Inizio (da)"><Select value="01/2024" options={["01/2024", "06/2024", "01/2025"]} /></Filter>
          <Filter label="Mese Fine (a)"><Select value="12/2027" options={["12/2026", "12/2027", "12/2028"]} /></Filter>
          <Filter label="Soglia importo (€)">
            <input type="number" defaultValue={10000} className="w-full text-[12px] border rounded px-2 py-1" />
          </Filter>
          <Filter label="Stato Rinnovo"><Select value="Tutti" options={["Tutti", "Da Rinnovare", "Non Rinnovare", "Pending"]} /></Filter>
          <button className="btn btn-primary w-full justify-center">Applica filtri</button>
        </>
      }
    >
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Contratti attivi" value={String(CONTRACTS.length)} hint="Totali nel perimetro" />
        <Kpi label="In scadenza < 180gg" value={String(expiring90)} delta={`+${Math.round(expiring90/2)} vs Q-1`} trend="up" />
        <Kpi label="Valore in scadenza" value={fmtEur(CONTRACTS.reduce((s,c)=>s+c.value,0))} hint="Spesa annualizzata" />
        <Kpi label="Valore residuo" value={fmtEur(CONTRACTS.reduce((s,c)=>s+c.residual,0))} delta="-12%" trend="down" />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <Panel title="Scadenze per mese (12M)" className="col-span-2">
          <div className="p-3 flex items-end gap-2 h-32">
            {monthly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] text-[var(--muted-foreground)]">{v}</div>
                <div className="w-full bg-[var(--primary)] opacity-90 rounded-sm" style={{ height: `${(v / Math.max(...monthly)) * 90}%`, minHeight: 4 }} />
                <div className="text-[10px] text-[var(--muted-foreground)]">{["G","F","M","A","M","G","L","A","S","O","N","D"][i]}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Concentrazione fornitori">
          <div className="p-3 space-y-1.5">
            {["Vendor 1","Vendor 2","Vendor 3","Vendor 4","Vendor 5"].map((v, i) => {
              const pct = [28,22,17,12,9][i];
              return (
                <div key={v} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-16 truncate">{v}</span>
                  <div className="flex-1 h-2 bg-[var(--muted)] rounded">
                    <div className="h-full bg-[var(--accent)] rounded" style={{ width: `${pct * 2}%` }} />
                  </div>
                  <span className="w-8 text-right tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title={`Contratti (${CONTRACTS.length})`} right={
        <>
          <input placeholder="Cerca..." className="text-[11px] border rounded px-2 py-0.5 w-40" />
          <button className="btn btn-ghost text-[11px]">≡ Colonne</button>
          <button className="btn btn-ghost text-[11px]">⬇ Ordina</button>
        </>
      }>
        <div className="max-h-[480px] overflow-auto">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h" style={{minWidth:32}}><input type="checkbox" /></th>
                <th className="frozen h" style={{left:32}}>Nr Contratto</th>
                <th>Società</th><th>Divisione</th><th>Referente</th>
                <th>Descrizione</th><th>Fornitore Uscente</th>
                <th>Inizio</th><th>Fine</th>
                <th className="num">Valore (€)</th>
                <th className="num">Residuo (€)</th>
                <th className="num">% Consumo</th>
                <th className="num">gg Scadenza</th>
                <th>Trend</th>
                <th>Flag Rinnovo</th>
                <th>Drill</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACTS.map((c) => (
                <tr key={c.id}>
                  <td className="frozen"><input type="checkbox" /></td>
                  <td className="frozen font-semibold" style={{left:32}}>{c.id}</td>
                  <td>{c.company}</td><td>{c.division}</td><td>{c.owner}</td>
                  <td>{c.description}</td><td>{c.vendor}</td>
                  <td>{c.start}</td><td>{c.end}</td>
                  <td className="num">{fmt(c.value)}</td>
                  <td className="num">{fmt(c.residual)}</td>
                  <td className="num">
                    <span className="inline-flex items-center gap-1">
                      <span className={`dot ${c.consumed > 0.85 ? "dot-red" : c.consumed > 0.6 ? "dot-amber" : "dot-green"}`} />
                      {(c.consumed*100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="num">
                    <span className={c.daysToEnd < 90 ? "text-[var(--danger)] font-semibold" : c.daysToEnd < 180 ? "text-[var(--warning)]" : ""}>
                      {c.daysToEnd}
                    </span>
                  </td>
                  <td><MiniBars values={[3,5,4,7,6,8,5,4,6,5,7,9]} /></td>
                  <td>
                    <StatusPill status={c.renew ? "Approved" : "Pending"} />
                  </td>
                  <td className="drill" onClick={() => setSel(c.id)}>Dettaglio</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={!!selected}
        onClose={() => setSel(null)}
        title={`Contratto ${selected?.id}`}
        subtitle={`${selected?.vendor} · ${selected?.description} · ${selected?.company} / ${selected?.division}`}
      >
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <Kpi label="Valore originario" value={fmtEur(selected.value)} />
              <Kpi label="Residuo" value={fmtEur(selected.residual)} />
              <Kpi label="% Consumo" value={`${(selected.consumed*100).toFixed(0)}%`} />
              <Kpi label="gg Scadenza" value={String(selected.daysToEnd)} />
            </div>
            <Panel title="Schedule di consumo (mensile)">
              <div className="p-3 flex items-end gap-1 h-24">
                {Array.from({length:24},(_,i)=>i).map(i => (
                  <div key={i} className="flex-1 bg-[var(--primary)] opacity-80 rounded-sm" style={{ height: `${20+Math.abs(Math.sin(i))*70}%` }} />
                ))}
              </div>
            </Panel>
            <div className="flex justify-end gap-2">
              <button className="btn btn-danger">Non Rinnovare</button>
              <button className="btn btn-ghost">Aggiungi nota</button>
              <button className="btn btn-primary">→ Genera Fabbisogno di Rinnovo</button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
