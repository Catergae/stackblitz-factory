import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi, Tabs } from "@/components/ui";
import { useState } from "react";
import { fmt } from "@/lib/seed";

export const Route = createFileRoute("/savings")({
  head: () => ({ meta: [{ title: "Savings & Performance · Procurement Planning" }] }),
  component: Page,
});

const CATS = [
  { c: "IT & Cloud", baseline: 4_200_000, actual: 3_950_000, target: 4_000_000 },
  { c: "Servizi Prof.", baseline: 3_100_000, actual: 2_840_000, target: 2_900_000 },
  { c: "Energy", baseline: 2_800_000, actual: 2_910_000, target: 2_650_000 },
  { c: "Logistica", baseline: 1_950_000, actual: 1_780_000, target: 1_820_000 },
  { c: "HR & Form.", baseline: 1_240_000, actual: 1_180_000, target: 1_200_000 },
  { c: "Marketing", baseline: 980_000, actual: 940_000, target: 920_000 },
];

function Page() {
  const [tab, setTab] = useState("Overview");
  const totBaseline = CATS.reduce((s,c)=>s+c.baseline,0);
  const totActual = CATS.reduce((s,c)=>s+c.actual,0);
  const totSaving = totBaseline - totActual;

  return (
    <AppShell
      title="Savings & Performance"
      breadcrumb={["Performance","Savings"]}
      actions={
        <>
          <button className="btn btn-ghost">⤓ Export Board Report</button>
          <button className="btn btn-primary">📊 Genera Report Quarterly</button>
        </>
      }
      filters={
        <>
          <Filter label="Periodo"><Select value="YTD 2026" options={["YTD 2026","Q3 2026","FY 2025"]} /></Filter>
          <Filter label="Tipologia saving"><Select value="Tutti" options={["Tutti","Hard","Soft","Cost avoidance"]} /></Filter>
          <Filter label="Categoria"><Select value="Tutte" options={["Tutte","IT","Energy"]} /></Filter>
          <Filter label="Buyer"><Select value="Tutti" options={["Tutti","Mario Rossi"]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Baseline (€)" value={`€ ${fmt(totBaseline)}`} hint="spesa storica" />
        <Kpi label="Actual YTD" value={`€ ${fmt(totActual)}`} delta="-5,2%" trend="up" />
        <Kpi label="Saving Realizzato" value={`€ ${fmt(totSaving)}`} delta="+12% vs Plan" trend="up" />
        <Kpi label="Target FY26" value="€ 1.500.000" hint={`${Math.round(totSaving/1500000*100)}% raggiunto`} />
        <Kpi label="Cost Avoidance" value="€ 420K" delta="+9%" trend="up" />
      </div>

      <Panel>
        <div className="px-3 pt-2">
          <Tabs tabs={["Overview","Cost of Goods","Inventory","Accounts Payable","How To"]} active={tab} onChange={setTab} />
        </div>
        {tab==="Overview" && (
          <div className="p-3 space-y-3">
            <div>
              <div className="text-[12px] font-semibold mb-2">Waterfall · Baseline → Actual</div>
              <div className="flex items-end gap-2 h-48 border-b">
                {[
                  {l:"Baseline", v: totBaseline, c:"var(--primary)"},
                  {l:"Renegotiation", v:-450000, c:"var(--success)"},
                  {l:"Vendor consol.", v:-280000, c:"var(--success)"},
                  {l:"Spec change", v:-180000, c:"var(--success)"},
                  {l:"Inflation", v:+340000, c:"var(--danger)"},
                  {l:"Volume Δ", v:-120000, c:"var(--success)"},
                  {l:"Actual", v: totActual, c:"var(--accent)"},
                ].map((b,i)=>{
                  const h = Math.abs(b.v) / totBaseline * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] font-semibold">{b.v<0?"-":"+"}€ {fmt(Math.abs(b.v))}</div>
                      <div className="w-full rounded-sm" style={{height:`${Math.max(8,h*1.4)}%`,background:b.c}} />
                      <div className="text-[10px] text-center">{b.l}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <table className="btable">
              <thead><tr><th>Categoria</th><th className="num">Baseline</th><th className="num">Actual</th><th className="num">Target</th><th className="num">Saving</th><th className="num">% vs Target</th><th>Trend</th></tr></thead>
              <tbody>
                {CATS.map(c=>{
                  const sav = c.baseline - c.actual;
                  const pct = Math.round(sav / (c.baseline - c.target) * 100);
                  return (
                    <tr key={c.c}>
                      <td className="font-semibold">{c.c}</td>
                      <td className="num">{fmt(c.baseline)}</td>
                      <td className="num">{fmt(c.actual)}</td>
                      <td className="num">{fmt(c.target)}</td>
                      <td className={`num ${sav>0?"text-[var(--success)] font-semibold":"text-[var(--danger)] font-semibold"}`}>{sav>0?"-":"+"}€ {fmt(Math.abs(sav))}</td>
                      <td className="num">{pct>0?pct:0}%</td>
                      <td>
                        <div className="w-24 h-2 bg-[var(--muted)] rounded">
                          <div className="h-full rounded" style={{width:`${Math.min(100,Math.max(0,pct))}%`,background:pct>=100?"var(--success)":pct>=70?"var(--warning)":"var(--danger)"}} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="total">
                  <td>TOTALE</td>
                  <td className="num">{fmt(totBaseline)}</td>
                  <td className="num">{fmt(totActual)}</td>
                  <td className="num">{fmt(CATS.reduce((s,c)=>s+c.target,0))}</td>
                  <td className="num text-[var(--success)]">-€ {fmt(totSaving)}</td>
                  <td className="num">{Math.round(totSaving/(totBaseline-CATS.reduce((s,c)=>s+c.target,0))*100)}%</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {tab!=="Overview" && (
          <div className="p-6 text-center text-[var(--muted-foreground)] text-[12px]">Sezione <b>{tab}</b> — dettagli operativi · drill-down riservato ai responsabili SUPC.</div>
        )}
      </Panel>
    </AppShell>
  );
}
