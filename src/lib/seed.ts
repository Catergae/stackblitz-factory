// Shared seed data for all screens
export const COMPANIES = ["ABC", "DEF", "GHI"];
export const DIVISIONS = ["Finance", "HR", "Legal", "Procurement", "Operations", "IT"];
export const BUYERS = ["Mario Rossi", "Giulia Verdi", "Luca Bianchi", "Sara Neri", "Paolo Conti", "Anna Russo"];
export const VENDORS = Array.from({ length: 30 }, (_, i) => `Vendor ${i + 1}`);
export const SERVICES = Array.from({ length: 40 }, (_, i) => `Servizio ${i + 1}`);

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export interface Contract {
  id: string;
  company: string;
  division: string;
  owner: string;
  description: string;
  vendor: string;
  start: string;
  end: string;
  value: number;
  residual: number;
  renew: boolean;
  consumed: number;
  daysToEnd: number;
}

export const CONTRACTS: Contract[] = (() => {
  const r = rand(42);
  return Array.from({ length: 40 }, (_, i) => {
    const value = Math.round(10000 + r() * 90000);
    const consumed = 0.4 + r() * 0.6;
    const daysToEnd = Math.round(30 + r() * 700);
    return {
      id: `CTR${String(i + 1).padStart(3, "0")}`,
      company: COMPANIES[Math.floor(r() * COMPANIES.length)],
      division: DIVISIONS[Math.floor(r() * DIVISIONS.length)],
      owner: BUYERS[Math.floor(r() * BUYERS.length)],
      description: SERVICES[i % SERVICES.length],
      vendor: VENDORS[i % VENDORS.length],
      start: `2024-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
      end: `2026-${String(1 + Math.floor(r() * 12)).padStart(2, "0")}-${String(1 + Math.floor(r() * 27)).padStart(2, "0")}`,
      value,
      residual: Math.round(value * (1 - consumed)),
      renew: r() > 0.45,
      consumed: Math.round(consumed * 100) / 100,
      daysToEnd,
    };
  });
})();

export function fmt(n: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0, ...opts }).format(n);
}
export const fmtPct = (n: number) => `${(n * 100).toFixed(0)}%`;
export const fmtEur = (n: number) => `€ ${fmt(n)}`;
