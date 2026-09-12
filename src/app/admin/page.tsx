import Link from "next/link";

import { requireStaff } from "@/features/admin/admin-access";
import { loadAdminOverview } from "@/features/admin/admin.repository";

function Metric({ label, value, detail }: { label: string; value: number | null; detail: string }) {
  return <article className="admin-metric">
    <p>{label}</p>
    <strong>{value === null ? "—" : value.toLocaleString("en-IN")}</strong>
    <small>{value === null ? "Unavailable" : detail}</small>
  </article>;
}

export default async function AdminOverviewPage() {
  await requireStaff("overview");
  const metrics = await loadAdminOverview();
  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">Administration</p><h1>Overview</h1></div><span>Staff workspace</span></header>
    <section className="admin-metrics" aria-label="Platform metrics">
      <Metric label="Registered accounts" value={metrics.accounts} detail="Accounts created" />
      <Metric label="Founding Pro waitlist" value={metrics.joinedWaitlist} detail="Currently joined" />
      <Metric label="Total page views" value={metrics.pageViews} detail="Last 30 days · tracking starts at deployment" />
    </section>
    <div className="admin-overview-panels">
      <section className="admin-panel"><div className="admin-panel__heading"><h2>Learners</h2><Link href="/admin/users">View all users →</Link></div><p>Search accounts, review waitlist status, and make authorized profile changes.</p></section>
      <section className="admin-panel"><h2>Support queue</h2><p>Support tickets are not connected yet. No ticket count is displayed.</p></section>
    </div>
    <p className="admin-metric-note">Page views count navigations, not unique visitors. Tracking may be affected by disabled JavaScript, blockers, or bots.</p>
  </main>;
}
