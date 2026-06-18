import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/contratti-attivi", label: "Contratti Attivi" },
  { to: "/rinnovo-scadenze", label: "Rinnovo Scadenze" },
  { to: "/nuovi-fabbisogni", label: "Nuovi Fabbisogni" },
  { to: "/masterplan-ru", label: "MP Requesting Unit" },
  { to: "/masterplan-supc", label: "MP SUPC" },
  { to: "/masterplan-consolidato", label: "MP Consolidato" },
  { to: "/monitoraggio", label: "Monitoraggio" },
  { to: "/attivita", label: "Planning Attività" },
  { to: "/capacity", label: "Capacity Buyer" },
  { to: "/savings", label: "Savings & Performance" },
  { to: "/post-freeze", label: "Post Freeze" },
  { to: "/tempistiche", label: "Settings" },
] as const;

const PROCESS: { key: string; label: string; routes: string[] }[] = [
  { key: "demand", label: "1. Demand Collection", routes: ["/contratti-attivi", "/rinnovo-scadenze", "/nuovi-fabbisogni"] },
  { key: "plan", label: "2. Master Plan", routes: ["/masterplan-ru", "/masterplan-supc", "/masterplan-consolidato"] },
  { key: "exec", label: "3. Procurement Execution", routes: ["/attivita", "/capacity"] },
  { key: "freeze", label: "4. Freeze & Approval", routes: ["/post-freeze", "/monitoraggio"] },
  { key: "perf", label: "5. Savings & Performance", routes: ["/savings"] },
];

export function AppShell({
  title,
  breadcrumb,
  actions,
  filters,
  children,
}: {
  title: string;
  breadcrumb: string[];
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
}) {
  const loc = useLocation();
  const current = PROCESS.find((p) => p.routes.includes(loc.pathname));
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* TOP BAR */}
      <header className="bg-[var(--primary)] text-white">
        <div className="flex items-center h-11 px-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 grid place-items-center bg-white/15 rounded-sm font-bold text-[12px]">P</div>
            <div className="font-semibold text-[13px] tracking-tight">Procurement Planning</div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)]/30 border border-white/20 ml-1">PROD</span>
          </div>
          <nav className="relative">
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="text-[12px] px-2 py-1 rounded hover:bg-white/10 flex items-center gap-1"
            >
              ☰ Menu
            </button>
            {navOpen && (
              <div
                onMouseLeave={() => setNavOpen(false)}
                className="absolute top-full left-0 mt-1 bg-white text-[var(--foreground)] border shadow-lg rounded w-64 py-1 z-50"
              >
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setNavOpen(false)}
                    className="block px-3 py-1.5 text-[12px] hover:bg-[var(--muted)]"
                    activeProps={{ className: "block px-3 py-1.5 text-[12px] bg-[var(--muted)] font-semibold" }}
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-[11.5px]">
            <span className="opacity-80">Scenario: <b>WP 2026</b></span>
            <span className="opacity-80">Updated 18/06/2026 09:42</span>
            <span className="w-px h-4 bg-white/20" />
            <button className="hover:bg-white/10 px-2 py-1 rounded">🔔 <span className="text-[10px] bg-[var(--warning)] text-white rounded-full px-1.5 ml-0.5">4</span></button>
            <button className="hover:bg-white/10 px-2 py-1 rounded flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-white/20 grid place-items-center text-[10px] font-semibold">MR</span>
              <span>M. Rossi</span>
            </button>
          </div>
        </div>
        {/* PROCESS NAVIGATOR */}
        <div className="bg-[var(--primary-dark)] px-3 h-9 flex items-center gap-1 text-[11.5px] overflow-x-auto">
          {PROCESS.map((p, i) => {
            const active = current?.key === p.key;
            return (
              <div key={p.key} className="flex items-center gap-1">
                <div
                  className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? "bg-white text-[var(--primary-dark)] font-semibold"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full grid place-items-center text-[9px] font-bold ${
                    active ? "bg-[var(--primary)] text-white" : "bg-white/15"
                  }`}>{i + 1}</span>
                  <span>{p.label.replace(/^\d+\.\s/, "")}</span>
                </div>
                {i < PROCESS.length - 1 && <span className="text-white/30">›</span>}
              </div>
            );
          })}
        </div>
      </header>

      {/* BREADCRUMB + TITLE */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-3">
        <div className="flex flex-col">
          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <span>{b}</span>
              </span>
            ))}
          </div>
          <h1 className="text-[16px] font-semibold leading-tight">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 min-h-0">
        {filters && (
          <aside className="w-[260px] shrink-0 bg-white border-r overflow-y-auto">
            <div className="p-3 border-b">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                Selection
              </div>
              <div className="text-[11px] leading-relaxed text-[var(--foreground)]">
                Company: <b>ABC, DEF</b><br />
                Division: <b>All</b><br />
                Scenario: <b>Working Plan</b><br />
                Time: <b>Current Week, Planning Horizon</b>
              </div>
            </div>
            <div className="p-3 space-y-3">{filters}</div>
          </aside>
        )}
        <main className="flex-1 min-w-0 overflow-auto p-3">{children}</main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t px-3 h-7 flex items-center text-[11px] text-[var(--muted-foreground)] gap-4">
        <span className="flex items-center gap-1.5"><span className="dot dot-green" /> Saved · 09:42:18</span>
        <span>Last edit: M. Rossi</span>
        <span>Audit ID: PRC-26-{Math.floor(Math.random()*9000+1000)}</span>
        <span className="ml-auto">Board EPM Platform · v14.3 · © Acme Group</span>
      </footer>
    </div>
  );
}

export function Filter({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Select({ value, options }: { value: string; options: string[] }) {
  return (
    <select
      defaultValue={value}
      className="w-full text-[12px] border border-[var(--border-strong)] rounded px-2 py-1 bg-white"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

export function MultiChip({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((i) => <span key={i} className="chip chip-active">{i} ✕</span>)}
      <button className="chip">+ Add</button>
    </div>
  );
}
