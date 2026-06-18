import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, StatusPill } from "@/components/ui";

export const Route = createFileRoute("/monitoraggio")({
  head: () => ({ meta: [{ title: "Monitoraggio SAL · Procurement Planning" }] }),
  component: Page,
});

const STEPS = [
  { k: "Demand", n: 427, color: "var(--info)" },
  { k: "MP RU Approval", n: 312, color: "var(--primary)" },
  { k: "SUPC Assignment", n: 268, color: "var(--accent)" },
  { k: "Strategy Sign-Off", n: 198, color: "var(--warning)" },
  { k: "Freeze", n: 142, color: "var(--success)" },
  { k: "Post-Freeze (mod.)", n: 18, color: "var(--danger)" },
];

const BUYERS_SAL = [
  { name: "Mario Rossi", total: 42, done: 31, late: 4 },
  { name: "Giulia Verdi", total: 38, done: 22, late: 7 },
  { name: "Luca Bianchi", total: 51, done: 29, late: 12 },
  { name: "Sara Neri", total: 27, done: 24, late: 1 },
  { name: "Paolo Conti", total: 33, done: 18, late: 5 },
];

function Page() {
  return (
    <AppShell
      title="Monitoraggio Stato Avanzamento"
      breadcrumb={["Freeze & Approval","Monitoraggio SAL"]}
      actions={<><button className="btn btn-ghost">⤓ Export PDF</button><button className="btn btn-primary">📤 Notifica ritardi</button></>}
      filters={
        <>
          <Filter label="Periodo"><Select value="YTD" options={["YTD","MTD","Q3 2026"]} /></Filter>
          <Filter label="Responsabile SUPC"><Select value="Tutti" options={["Tutti","Mario Rossi"]} /></Filter>
          <Filter label="Categoria"><Select value="Tutte" options={["Tutte","IT","Servizi"]} /></Filter>
          <Filter label="Stato"><Select value="Tutti" options={["Tutti","In Ritardo","On-Track","Bloccato"]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Fabbisogni totali" value="427" />
        <Kpi label="On-Track" value="312" delta="73%" trend="up" />
        <Kpi label="In Ritardo" value="68" delta="16%" trend="down" />
        <Kpi label="Bloccati" value="14" hint="richiedono escalation" />
        <Kpi label="Lead time medio" value="68 gg" delta="-6gg vs Plan" trend="up" />
      </div>

      <Panel title="Funnel di processo" className="mb-3">
        <div className="p-3 flex items-end justify-between gap-2">
          {STEPS.map((s, i) => {
            const w = 100 - i*10;
            return (
              <div key={s.k} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[11px] font-semibold tabular-nums">{s.n}</div>
                <div className="h-20 w-full rounded grid place-items-center text-white text-[12px] font-semibold" style={{ background: s.color, width: `${w}%` }}>
                  Step {i+1}
                </div>
                <div className="text-[11px] text-center">{s.k}</div>
                <div className="text-[10px] text-[var(--muted-foreground)]">{Math.round(s.n/427*100)}%</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3">
        <Panel title="Avanzamento per Buyer">
          <table className="btable">
            <thead><tr><th>Buyer</th><th className="num">Totale</th><th className="num">Completati</th><th className="num">In Ritardo</th><th>Avanzamento</th><th>SLA</th></tr></thead>
            <tbody>
              {BUYERS_SAL.map(b => {
                const pct = Math.round(b.done/b.total*100);
                return (
                  <tr key={b.name}>
                    <td className="font-medium">{b.name}</td>
                    <td className="num">{b.total}</td>
                    <td className="num">{b.done}</td>
                    <td className="num"><span className={b.late>5?"text-[var(--danger)] font-semibold":""}>{b.late}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[var(--muted)] rounded">
                          <div className="h-full rounded" style={{width:`${pct}%`,background:pct>70?"var(--success)":pct>50?"var(--warning)":"var(--danger)"}} />
                        </div>
                        <span className="w-10 text-right tabular-nums text-[11px]">{pct}%</span>
                      </div>
                    </td>
                    <td><StatusPill status={b.late>6?"Rejected":b.late>3?"Pending":"Approved"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
        <Panel title="Alert SAL · escalation">
          <div className="divide-y text-[12px]">
            {[
              ["#MP-0142","Sara Neri","Approvazione SUPC > 14gg",">SLA","danger"],
              ["#MP-0218","Luca Bianchi","Strategia non firmata",">SLA","danger"],
              ["#MP-0287","Giulia Verdi","Documenti RDA mancanti","Bloccato","warning"],
              ["#MP-0301","Mario Rossi","In attesa CFO sign-off","Pending","info"],
              ["#MP-0344","Paolo Conti","Conflitto BDG 2027","Da rivedere","warning"],
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                <span className="font-semibold w-20">{a[0]}</span>
                <span className="w-24 text-[var(--muted-foreground)]">{a[1]}</span>
                <span className="flex-1">{a[2]}</span>
                <span className={`chip ${a[4]==="danger"?"!bg-[#fbe6e2] !text-[var(--danger)]":a[4]==="warning"?"!bg-[#fff3dc] !text-[var(--warning)]":""}`}>{a[3]}</span>
                <button className="btn btn-ghost text-[10px]">Apri</button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
