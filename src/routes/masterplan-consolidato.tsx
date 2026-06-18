import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Filter, Select, MultiChip } from "@/components/AppShell";
import { Panel, Kpi, Tabs, StatusPill } from "@/components/ui";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/masterplan-consolidato")({
  head: () => ({ meta: [{ title: "MasterPlan Consolidato · Procurement Planning" }] }),
  component: Page,
});

function Page() {
  const [tab, setTab] = useState("Vista Annuale");
  const cats = ["IT & Cloud","Servizi Prof.","Logistica","HR & Formazione","Marketing","Manutenzione","Energy"];
  const years = ["BDG 2026","BDG 2027","BDG 2028","BDG 2029","BDG ≥2030"];

  return (
    <AppShell
      title="MasterPlan Consolidato"
      breadcrumb={["Master Plan","Consolidato"]}
      actions={
        <>
          <button className="btn btn-ghost">↻ Refresh</button>
          <button className="btn btn-ghost">⤓ Export</button>
          <button className="btn btn-primary">📌 Publish Snapshot</button>
        </>
      }
      filters={
        <>
          <Filter label="Scenario"><Select value="Working Plan" options={["Working Plan","Budget","Forecast","What-if A"]} /></Filter>
          <Filter label="Versione"><Select value="v.18" options={["v.18 (current)","v.17","v.16"]} /></Filter>
          <Filter label="Anno"><Select value="2026" options={["2026","2027","2028"]} /></Filter>
          <Filter label="Categoria"><MultiChip items={["IT","Servizi"]} /></Filter>
          <Filter label="Buyer/Responsabile SUPC"><Select value="Tutti" options={["Tutti","Mario Rossi"]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Spesa Totale Outstanding" value="€ 84,2M" delta="+6,4% vs LY" trend="up" />
        <Kpi label="N. Fabbisogni" value="427" hint="312 attivi · 115 freezed" />
        <Kpi label="Coverage contratti" value="78%" delta="+4pt" trend="up" hint="su Plan" />
        <Kpi label="Saving consolidato" value="€ 1,72M" delta="+12%" trend="up" />
        <Kpi label="Rischio supplier (Top10)" value="3 Alti" delta="-1" trend="up" />
      </div>

      <Panel>
        <div className="px-3 pt-2">
          <Tabs tabs={["Vista Annuale", "Distribuzione Spesa", "BLSC Bar Plot", "Kraljic Matrix"]} active={tab} onChange={setTab} />
        </div>

        {tab === "Vista Annuale" && (
          <div className="overflow-auto max-h-[440px]">
            <table className="btable">
              <thead>
                <tr>
                  <th className="frozen h">Categoria</th>
                  {years.map(y => <th key={y} className="num">{y}</th>)}
                  <th className="num">TOTALE</th>
                  <th className="num">Δ vs LY</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c, i) => {
                  const v = years.map((_, j) => 800000 + (i+1)*(400000-j*60000));
                  const tot = v.reduce((s,x)=>s+x,0);
                  return (
                    <tr key={c}>
                      <td className="frozen font-semibold">▸ {c}</td>
                      {v.map((x, j) => <td key={j} className={`num ${j===0?"":"suggest"}`}>{fmt(x)}</td>)}
                      <td className="num font-semibold">{fmt(tot)}</td>
                      <td className="num"><span className={i%2 ? "text-[var(--success)]" : "text-[var(--danger)]"}>{i%2?"+":"-"}{(i+1)*1.4}%</span></td>
                      <td><StatusPill status={["Approved","Pending","In Progress"][i%3]} /></td>
                    </tr>
                  );
                })}
                <tr className="total">
                  <td className="frozen">TOTALE</td>
                  {years.map((y,j)=><td key={y} className="num">{fmt(cats.reduce((s,_,i)=>s+ 800000 + (i+1)*(400000-j*60000),0))}</td>)}
                  <td className="num">€ 84.200.000</td><td className="num">+6,4%</td><td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {tab === "Distribuzione Spesa" && (
          <div className="p-3 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[12px] font-semibold mb-2">Distribuzione spesa per anno</div>
              <div className="flex items-end gap-3 h-48">
                {years.map((y, i) => {
                  const h = 80 - i*12;
                  return (
                    <div key={y} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px]">€ {fmt(20000000 - i*3000000)}</div>
                      <div className="w-full bg-[var(--primary)] rounded-sm" style={{height:`${h}%`}} />
                      <div className="text-[10px] text-[var(--muted-foreground)]">{y}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[12px] font-semibold mb-2">Concentrazione per categoria</div>
              <div className="space-y-1.5">
                {cats.map((c, i) => {
                  const pct = [22,18,16,12,11,10,11][i];
                  return (
                    <div key={c} className="flex items-center gap-2 text-[11.5px]">
                      <span className="w-32">{c}</span>
                      <div className="flex-1 h-3 bg-[var(--muted)] rounded">
                        <div className="h-full rounded" style={{width:`${pct*4}%`, background:`var(--primary)`}} />
                      </div>
                      <span className="w-8 text-right tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "BLSC Bar Plot" && (
          <div className="p-3">
            <div className="text-[12px] font-semibold mb-2">Business Line Spend Curve (BLSC)</div>
            <div className="flex items-end gap-1 h-56">
              {Array.from({length:30}).map((_,i)=>{
                const h = Math.max(8, 95 - i*2.5);
                return <div key={i} className="flex-1 rounded-sm" style={{height:`${h}%`,background:`hsl(${210 - i*2}, 50%, ${30+i}%)`}} />;
              })}
            </div>
            <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
              <span>Top vendor</span><span>Long tail →</span>
            </div>
          </div>
        )}

        {tab === "Kraljic Matrix" && (
          <div className="p-4 grid grid-cols-[40px_1fr] gap-2">
            <div className="grid place-items-center text-[10px] [writing-mode:vertical-rl] rotate-180 text-[var(--muted-foreground)]">Impatto sul profitto →</div>
            <div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  {q:"Leverage", c:"#dff0e4", items:[{n:"Vendor 3",v:1.2},{n:"Vendor 5",v:0.8}]},
                  {q:"Strategic", c:"#fbe6e2", items:[{n:"Vendor 1",v:2.4},{n:"Vendor 7",v:1.6}]},
                  {q:"Non-critical", c:"#eef2f7", items:[{n:"Vendor 12",v:0.4},{n:"Vendor 18",v:0.6}]},
                  {q:"Bottleneck", c:"#fff3dc", items:[{n:"Vendor 9",v:0.9}]},
                ].map((q)=>(
                  <div key={q.q} className="border rounded p-2 h-36" style={{background:q.c}}>
                    <div className="text-[10px] uppercase font-semibold mb-1">{q.q}</div>
                    {q.items.map(it=>(
                      <div key={it.n} className="text-[11px] flex justify-between">
                        <span>{it.n}</span><span className="tabular-nums">€ {it.v}M</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="text-center text-[10px] mt-1 text-[var(--muted-foreground)]">Rischio fornitura →</div>
            </div>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
