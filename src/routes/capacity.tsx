import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi } from "@/components/ui";

export const Route = createFileRoute("/capacity")({
  head: () => ({ meta: [{ title: "Capacity Buyer · Procurement Planning" }] }),
  component: Page,
});

const BUYERS = [
  { name: "Mario Rossi", cap: 100, weeks: [60,72,84,90,95,102,108,98,92,88,82,76] },
  { name: "Giulia Verdi", cap: 100, weeks: [80,84,88,92,95,98,101,96,90,85,80,75] },
  { name: "Luca Bianchi", cap: 100, weeks: [110,118,122,124,128,124,118,114,108,104,100,96] },
  { name: "Sara Neri", cap: 100, weeks: [50,55,58,62,65,68,70,72,75,72,68,64] },
  { name: "Paolo Conti", cap: 100, weeks: [88,92,95,98,100,102,104,98,94,90,86,82] },
  { name: "Anna Russo", cap: 100, weeks: [70,74,78,82,86,90,94,90,86,82,78,74] },
];

function color(pct: number) {
  if (pct < 70) return "bg-[#bcd2eb]";
  if (pct < 95) return "bg-[#9ec1a4]";
  if (pct < 110) return "bg-[#eccfa3]";
  return "bg-[#e8a89e]";
}

function Page() {
  return (
    <AppShell
      title="Capacity Buyer (Heatmap saturazione)"
      breadcrumb={["Procurement Execution","Capacity Buyer"]}
      actions={
        <>
          <button className="btn btn-ghost">↻ Ricalcola</button>
          <button className="btn btn-ghost">⤓ Export</button>
          <button className="btn btn-primary">⚖ Bilancia carichi</button>
        </>
      }
      filters={
        <>
          <Filter label="Vista"><Select value="Team SUPC" options={["Team SUPC","Solo io","Per categoria"]} /></Filter>
          <Filter label="Periodo"><Select value="12 settimane" options={["12 settimane","6 mesi","Anno"]} /></Filter>
          <Filter label="Categoria"><Select value="Tutte" options={["Tutte","IT","Energy"]} /></Filter>
          <Filter label="Capacity model"><Select value="Effort std" options={["Effort std","Effort weighted"]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Buyer attivi" value={String(BUYERS.length)} />
        <Kpi label="Saturazione media" value="88%" delta="+4pt vs prev." trend="up" />
        <Kpi label="Buyer in overflow" value="2" delta=">110%" trend="down" />
        <Kpi label="Buyer sotto-utilizzati" value="1" hint="< 70%" />
        <Kpi label="Capacity totale (FTE)" value="6,0" hint="Effort std" />
      </div>

      <Panel title="Heatmap saturazione settimanale" className="mb-3">
        <div className="overflow-auto">
          <table className="btable">
            <thead>
              <tr>
                <th className="frozen h">Buyer</th>
                {Array.from({length:12},(_,i)=>i+30).map(w=><th key={w} className="num">W{w}</th>)}
                <th className="num">Media</th>
              </tr>
            </thead>
            <tbody>
              {BUYERS.map(b => {
                const avg = Math.round(b.weeks.reduce((s,x)=>s+x,0)/b.weeks.length);
                return (
                  <tr key={b.name}>
                    <td className="frozen font-semibold">{b.name}</td>
                    {b.weeks.map((w,i)=>(
                      <td key={i} className={`num ${color(w)} text-[10px] font-semibold`} style={{color: w>=110?"white":""}}>{w}%</td>
                    ))}
                    <td className="num font-semibold">{avg}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 border-t text-[10px] text-[var(--muted-foreground)]">
          <span>Legenda:</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#bcd2eb]" /> &lt;70%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#9ec1a4]" /> 70-95%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#eccfa3]" /> 95-110%</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#e8a89e]" /> &gt;110%</span>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3">
        <Panel title="Distribuzione effort per categoria">
          <div className="p-3 space-y-1.5">
            {[["IT & Cloud", 36],["Energy",18],["Servizi",16],["HR",10],["Logistica",12],["Altro",8]].map(([k,v])=>(
              <div key={k as string} className="flex items-center gap-2 text-[11.5px]">
                <span className="w-28">{k}</span>
                <div className="flex-1 h-2.5 bg-[var(--muted)] rounded">
                  <div className="h-full bg-[var(--accent)] rounded" style={{width:`${(v as number)*2.5}%`}} />
                </div>
                <span className="w-8 text-right tabular-nums">{v}%</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Suggerimenti di ribilanciamento (AI)">
          <div className="divide-y text-[12px]">
            {[
              ["L. Bianchi → S. Neri","Spostare 2 attività cat. IT W33-34 (-14% sat)"],
              ["G. Verdi → A. Russo","Trasferire RFx Energy W32 (effort 0,5 FTE)"],
              ["Auto-assign","3 attività backlog assegnabili automaticamente a P. Conti"],
              ["Hire request","Pipeline Q4 supera capacity team di 1,2 FTE"],
            ].map(([k,v],i)=>(
              <div key={i} className="px-3 py-1.5 flex items-start gap-2">
                <span className="text-[var(--info)] mt-0.5">⇄</span>
                <div className="flex-1">
                  <div className="font-semibold">{k}</div>
                  <div className="text-[var(--muted-foreground)]">{v}</div>
                </div>
                <button className="btn btn-ghost text-[10px]">Applica</button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
