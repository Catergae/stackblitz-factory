import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Panel, Kpi } from "@/components/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Procurement Planning · Enterprise EPM" },
      { name: "description", content: "Board EPM Procurement Planning suite — Budget, Forecast, Demand, Supplier, What-if and Performance management." },
    ],
  }),
  component: Home,
});

const TILES = [
  { to: "/contratti-attivi", title: "Contratti Attivi", desc: "Lista contratti in scadenza e residuo di spesa.", group: "Demand", icon: "📄" },
  { to: "/rinnovo-scadenze", title: "Rinnovo Scadenze (AR)", desc: "Data entry per rinnovo contratti.", group: "Demand", icon: "🔄" },
  { to: "/nuovi-fabbisogni", title: "Nuovi Fabbisogni (AN)", desc: "Inserimento nuovi fabbisogni di acquisto.", group: "Demand", icon: "➕" },
  { to: "/masterplan-ru", title: "MasterPlan Requesting Unit", desc: "Vista owner del fabbisogno · drill-down.", group: "Plan", icon: "📋" },
  { to: "/masterplan-supc", title: "MasterPlan SUPC", desc: "Buyer SUPC: lead time, strategia, KPI.", group: "Plan", icon: "🧮" },
  { to: "/masterplan-consolidato", title: "MasterPlan Consolidato", desc: "Vista d'insieme · BLSC · matrice Kraljic.", group: "Plan", icon: "📊" },
  { to: "/attivita", title: "Attività in corso", desc: "Pipeline attività in corso per Buyer.", group: "Execution", icon: "📌" },
  { to: "/capacity", title: "Capacity Buyer", desc: "Distribuzione carichi e saturation.", group: "Execution", icon: "👥" },
  { to: "/monitoraggio", title: "Monitoraggio SAL", desc: "Stato avanzamento workflow.", group: "Freeze", icon: "📈" },
  { to: "/post-freeze", title: "Tracciamento modifiche post-freeze", desc: "Tracciamento modifiche post-freeze.", group: "Freeze", icon: "🧊" },
  { to: "/savings", title: "Savings & Performance", desc: "Performance del Procurement.", group: "Perf", icon: "💰" },
  { to: "/tempistiche", title: "Tempistiche ed Effort", desc: "Settings amministratore: lead time, effort.", group: "Admin", icon: "⚙️" },
];

function Home() {
  return (
    <AppShell title="Procurement Planning · Home" breadcrumb={["Home"]}>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Kpi label="Contratti in scadenza 90gg" value="48" delta="+6 vs prev." trend="up" />
        <Kpi label="Fabbisogni in approvazione" value="127" delta="-12 vs prev." trend="down" hint="34 oltre SLA" />
        <Kpi label="Budget allocato 2026" value="€ 18.4M" delta="92% di Plan" trend="up" />
        <Kpi label="Savings YTD" value="€ 1.27M" delta="+8.4%" trend="up" hint="vs Plan" />
      </div>

      <Panel title="Aree applicative">
        <div className="grid grid-cols-3 gap-px bg-[var(--border)]">
          {TILES.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="bg-white hover:bg-[var(--surface-2)] p-3 flex gap-3 items-start transition-colors"
            >
              <div className="w-9 h-9 rounded grid place-items-center bg-[var(--muted)] text-[16px]">{t.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-[13px]">{t.title}</div>
                  <span className="chip">{t.group}</span>
                </div>
                <div className="text-[11.5px] text-[var(--muted-foreground)] mt-0.5">{t.desc}</div>
              </div>
              <div className="text-[var(--muted-foreground)]">›</div>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Panel title="Workflow attivi · ultime azioni">
          <div className="divide-y text-[12px]">
            {[
              ["09:38", "M. Rossi", "ha approvato 12 righe MasterPlan SUPC", "Approved"],
              ["09:31", "G. Verdi", "ha sottomesso 4 nuovi fabbisogni", "Pending"],
              ["09:22", "Sistema", "Calcolo BLSC schedulato completato", "Completed"],
              ["09:14", "L. Bianchi", "ha richiesto modifica Post-Freeze CTR-021", "In Progress"],
              ["08:57", "S. Neri", "ha respinto rinnovo CTR-009", "Rejected"],
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                <span className="text-[var(--muted-foreground)] w-12">{r[0]}</span>
                <span className="font-medium w-24">{r[1]}</span>
                <span className="flex-1">{r[2]}</span>
                <span className="chip">{r[3]}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Alert intelligenti">
          <div className="divide-y text-[12px]">
            {[
              { sev: "danger", txt: "9 contratti scadono entro 30gg senza piano di rinnovo" },
              { sev: "warning", txt: "Buyer L. Bianchi al 124% di saturazione capacity Q3" },
              { sev: "info", txt: "AI suggerisce di consolidare 6 RDA Vendor 12 (-7% costo stimato)" },
              { sev: "warning", txt: "Variazione BDG 2027 > 15% in 4 categorie · revisione consigliata" },
              { sev: "success", txt: "Savings target Cat. IT raggiunto in anticipo (+€ 134K)" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-1.5">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full ${a.sev === "danger" ? "bg-[var(--danger)]" : a.sev === "warning" ? "bg-[var(--warning)]" : a.sev === "success" ? "bg-[var(--success)]" : "bg-[var(--info)]"}`} />
                <span>{a.txt}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
