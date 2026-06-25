import { useState, type ReactNode } from "react";

export function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`panel ${className}`}>
      {title && (
        <div className="panel-head">
          <span>{title}</span>
          {right && <span className="flex items-center gap-1">{right}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  trend,
  hint,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
}) {
  // delta/trend/hint kept in API for backward-compat ma volutamente non renderizzati:
  // le scorecard mostrano solo label + valore principale.
  void delta; void trend; void hint;
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex items-center gap-0 border-b">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 text-[12px] border-b-2 -mb-px ${
            active === t
              ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-3xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className={`bg-white rounded-md shadow-2xl ${width} w-[92vw] max-h-[88vh] flex flex-col`}>
        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[var(--muted-foreground)]">Drill-down</div>
            <div className="text-[14px] font-semibold">{title}</div>
            {subtitle && <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost text-[11px]">⛶</button>
            <button onClick={onClose} className="btn btn-ghost text-[11px]">✕</button>
          </div>
        </div>
        <div className="overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "bg-[#e3f1e6] text-[var(--success)] border-[#bcdcc1]",
    Approvato: "bg-[#e3f1e6] text-[var(--success)] border-[#bcdcc1]",
    Pending: "bg-[#fff3dc] text-[var(--warning)] border-[#eccfa3]",
    "Da approvare": "bg-[#fff3dc] text-[var(--warning)] border-[#eccfa3]",
    Rejected: "bg-[#fbe6e2] text-[var(--danger)] border-[#e8c4be]",
    Draft: "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]",
    "In Progress": "bg-[#e1ecf7] text-[var(--info)] border-[#bcd2eb]",
    Freezed: "bg-[#e7ecf2] text-[var(--primary)] border-[#c8d4e3]",
    Freezato: "bg-[#e7ecf2] text-[var(--primary)] border-[#c8d4e3]",
    "Rda inviata": "bg-[#ede4f7] text-[var(--accent)] border-[#d4c1ec]",
    "Data RdA Approvata": "bg-[#e3f1e6] text-[var(--success)] border-[#bcdcc1]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded border ${map[status] || map.Draft}`}>
      {status}
    </span>
  );
}

export function useToggle(initial = false) {
  const [v, setV] = useState(initial);
  return [v, () => setV(!v), setV] as const;
}

export function MiniBars({ values, max }: { values: number[]; max?: number }) {
  const m = max ?? Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-6">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-1.5 bg-[var(--primary)] opacity-80 rounded-sm"
          style={{ height: `${Math.max(2, (v / m) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function Sparkline({ values, color = "var(--primary)" }: { values: number[]; color?: string }) {
  const w = 80, h = 24, max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
