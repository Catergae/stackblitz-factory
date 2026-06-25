import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Filter, Select } from "@/components/AppShell";
import { Panel, Kpi } from "@/components/ui";

export const Route = createFileRoute("/monitoraggio")({
  head: () => ({ meta: [{ title: "Monitoraggio SAL · Procurement Planning" }] }),
  component: Page,
});

const STATI = [
  "Freezato",
  "In attesa di approvazione RdA",
  "In gestione",
  "In gara",
  "In aggiudicazione",
  "In contrattualizzazione",
  "Contratto stipulato",
  "PO rilasciato",
];

const COMPANIES = ["ABC", "DEF", "GHI"];
const DIVISIONI = ["Corporate", "Energy", "Retail", "Industrial"];
const REFERENTI = ["Mario Rossi", "Giulia Verdi", "Luca Bianchi", "Sara Neri", "Paolo Conti"];
const BUYERS = ["Mario Rossi", "Giulia Verdi", "Luca Bianchi", "Sara Neri"];
const APPROVATORI = ["CFO", "CPO", "Direttore Acquisti", "Responsabile BU"];
const DESCRIZIONI = [
  "Gara energia 2027",
  "Framework cloud DR",
  "Rinnovo licenze SAP",
  "Consulenza M&A advisory",
  "Audit ESG annuale",
  "Fornitura HW datacenter",
];

function makeId(i: number) {
  const c = COMPANIES[i % COMPANIES.length];
  const l1 = String.fromCharCode(65 + (i % 26));
  const l2 = String.fromCharCode(65 + ((i * 3) % 26));
  const m = String(5 + (i % 6)).padStart(2, "0");
  return `2026${m}${c}${l1}${l2}${10 + i}`;
}

function d(y: number, m: number, day: number) {
  return new Date(y, m, day).toISOString().slice(0, 10);
}

const ROWS = Array.from({ length: 18 }, (_, i) => {
  const baseM = 1 + (i % 8);
  const dRdAReq = d(2026, baseM, 5 + (i % 20));
  const nRda = `RDA-${78000 + i * 3}`;
  const dRdAApprReq = d(2026, baseM, 8 + (i % 20));
  const dRdAApprEff = d(2026, baseM, 12 + (i % 18));
  const dGaraPub = d(2026, baseM + 1, 5 + (i % 20));
  const nGara = `G-${2026000 + i * 7}`;
  const dAggPrev = d(2026, baseM + 2, 10 + (i % 15));
  const dAggEff = d(2026, baseM + 2, 14 + (i % 12));
  const dStipReq = d(2026, baseM + 3, 1 + (i % 25));
  const nContr = `C-${50000 + i * 5}`;
  const dStipEff = d(2026, baseM + 3, 6 + (i % 22));
  const dInizioCtr = d(2026, baseM + 3, 15 + (i % 14));
  const nPo = `PO-${900000 + i * 11}`;
  const dPoReq = d(2026, baseM + 4, 1 + (i % 25));
  const dConsPrev = d(2026, baseM + 5, 10 + (i % 15));
  const dBolla = d(2026, baseM + 5, 14 + (i % 12));
  const r = (k: number) => [-2, 0, 0, 1, 3, 5, -1, 0, 7][(i + k) % 9];
  return {
    id: makeId(i),
    desc: DESCRIZIONI[i % DESCRIZIONI.length],
    societa: COMPANIES[i % COMPANIES.length],
    divisione: DIVISIONI[i % DIVISIONI.length],
    referente: REFERENTI[i % REFERENTI.length],
    buyer: BUYERS[i % BUYERS.length],
    stato: STATI[i % STATI.length],
    dRdAReq, nRda, dRitRda: r(0),
    dRdAApprReq, ultimoAppr: APPROVATORI[i % APPROVATORI.length], dRdAApprEff, dRitApprRda: r(1),
    dGaraPub, nGara, dRitGara: r(2),
    dAggPrev, dAggEff, dRitAgg: r(3),
    dStipReq, nContr, dStipEff, dRitStip: r(4),
    dInizioCtr, nPo, dPoReq, dRitPo: r(5),
    dConsPrev, dBolla, dRitCons: r(6),
  };
});

function DeltaCell({ v }: { v: number }) {
  const cls = v > 0 ? "text-[var(--danger)] font-semibold" : v < 0 ? "text-[var(--success)]" : "";
  return <td className={`num ${cls}`}>{v > 0 ? `+${v}` : v}</td>;
}

function Page() {
  return (
    <AppShell
      title="Monitoraggio Stato Avanzamento"
      breadcrumb={["Freeze & Approval", "Monitoraggio SAL"]}
      filters={
        <>
          <Filter label="Periodo"><Select value="YTD" options={["YTD", "MTD", "Q3 2026"]} /></Filter>
          <Filter label="Responsabile SUPC"><Select value="Tutti" options={["Tutti", ...BUYERS]} /></Filter>
          <Filter label="Categoria"><Select value="Tutte" options={["Tutte", "IT", "Servizi", "Energy", "Logistica"]} /></Filter>
          <Filter label="Stato"><Select value="Tutti" options={["Tutti", ...STATI]} /></Filter>
        </>
      }
    >
      <div className="grid grid-cols-5 gap-2 mb-3">
        <Kpi label="Fabbisogni totali" value="427" />
        <Kpi label="On-Track" value="312" />
        <Kpi label="In Ritardo" value="68" />
        <Kpi label="Bloccati" value="14" />
        <Kpi label="Lead time medio" value="68 gg" />
      </div>

      <Panel title="Monitoraggio SAL · vista tabellare">
        <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <table className="btable">
            <thead>
              <tr>
                <th>ID Fabbisogno</th>
                <th>Descrizione</th>
                <th>Società</th>
                <th>Divisione</th>
                <th>Referente</th>
                <th>Buyer</th>
                <th>Stato Avanz.</th>
                <th>Data rich. RdA</th>
                <th>Numero RdA</th>
                <th className="num">Δ gg Creaz. RdA</th>
                <th>Data Rich. Appr. RdA</th>
                <th>Ultimo Appr. RdA</th>
                <th>Data eff. Appr. RdA</th>
                <th className="num">Δ gg Appr. RdA</th>
                <th>Data prev. pubbl. Gara</th>
                <th>Numero Gara</th>
                <th className="num">Δ gg Pubbl. Gara</th>
                <th>Data prev. aggiud.</th>
                <th>Data eff. aggiud.</th>
                <th className="num">Δ gg Aggiud.</th>
                <th>Data rich. stipula</th>
                <th>Numero Contratto</th>
                <th>Data eff. stipula</th>
                <th className="num">Δ gg Stipula</th>
                <th>Data Inizio Contratto</th>
                <th>Numero PO</th>
                <th>Data Rich. PO</th>
                <th className="num">Δ gg Rilascio PO</th>
                <th>Data Prev. Consegna</th>
                <th>Data Bolla</th>
                <th className="num">Δ gg Consegna</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(r => (
                <tr key={r.id}>
                  <td className="font-semibold">{r.id}</td>
                  <td>{r.desc}</td>
                  <td>{r.societa}</td>
                  <td>{r.divisione}</td>
                  <td>{r.referente}</td>
                  <td>{r.buyer}</td>
                  <td><span className="chip">{r.stato}</span></td>
                  <td>{r.dRdAReq}</td>
                  <td>{r.nRda}</td>
                  <DeltaCell v={r.dRitRda} />
                  <td>{r.dRdAApprReq}</td>
                  <td>{r.ultimoAppr}</td>
                  <td>{r.dRdAApprEff}</td>
                  <DeltaCell v={r.dRitApprRda} />
                  <td>{r.dGaraPub}</td>
                  <td>{r.nGara}</td>
                  <DeltaCell v={r.dRitGara} />
                  <td>{r.dAggPrev}</td>
                  <td>{r.dAggEff}</td>
                  <DeltaCell v={r.dRitAgg} />
                  <td>{r.dStipReq}</td>
                  <td>{r.nContr}</td>
                  <td>{r.dStipEff}</td>
                  <DeltaCell v={r.dRitStip} />
                  <td>{r.dInizioCtr}</td>
                  <td>{r.nPo}</td>
                  <td>{r.dPoReq}</td>
                  <DeltaCell v={r.dRitPo} />
                  <td>{r.dConsPrev}</td>
                  <td>{r.dBolla}</td>
                  <DeltaCell v={r.dRitCons} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
