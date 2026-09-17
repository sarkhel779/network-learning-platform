import Link from "next/link";

import { requireStaff } from "@/features/admin/admin-access";
import { AdminIcon, type AdminIconName } from "@/features/admin/admin-icons";
import { loadAdminOverview } from "@/features/admin/admin.repository";

function Metric({ label, value, detail, href, icon }: { label: string; value: number | null; detail: string; href?: string; icon: AdminIconName }) {
  const content = <>
    <span className="admin-metric__icon"><AdminIcon name={icon} /></span>
    <p>{label}</p>
    <strong>{value === null ? "—" : value.toLocaleString("en-IN")}</strong>
    <small>{value === null ? "Unavailable" : detail}</small>
  </>;
  return href ? <Link className="admin-metric" href={href}>{content}</Link> : <article className="admin-metric">{content}</article>;
}

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireStaff("overview");
  const { range } = await searchParams;
  const days: 7 | 30 | 90 = range === "7" ? 7 : range === "90" ? 90 : 30;
  const metrics = await loadAdminOverview(days);
  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">Administration</p><h1>Overview</h1></div><span>Staff workspace</span></header>
    <section className="admin-metrics" aria-label="Platform metrics">
      <Metric label="Registered accounts" value={metrics.accounts} detail="Accounts created" href="/admin/users" icon="users" />
      <Metric label="Founding Pro waitlist" value={metrics.joinedWaitlist} detail="Currently joined" href="/admin/waitlist" icon="waitlist" />
      <Metric label="Total page views" value={metrics.pageViews} detail={`Last ${days} days · tracking starts at deployment`} icon="pulse" />
      <Metric label="Unique visitors" value={metrics.uniqueVisitors} detail={`Last ${days} days · by account, else cookie`} icon="eye" />
    </section>
    <nav className="admin-range" aria-label="Page-view date range">Page views: {[7, 30, 90].map((value) => <Link key={value} href={`/admin?range=${value}`} aria-current={days === value ? "page" : undefined}>{value} days</Link>)}</nav>
    <div className="admin-overview-panels">
      <section className="admin-panel"><div className="admin-panel__heading"><h2>Learners</h2><Link href="/admin/users">View all users →</Link></div><p>Search accounts and make authorized profile changes. See Pro waitlist for Founding Pro registrations.</p></section>
      <section className="admin-panel"><div className="admin-panel__heading"><h2>Support queue</h2><Link href="/admin/support">View queue →</Link></div><p>Triage and reply to learner support tickets.</p></section>
    </div>
    <p className="admin-metric-note">Total page views counts every navigation, including repeats. Unique visitors deduplicates by account for signed-in learners and by an anonymous first-party cookie otherwise, so the same person on two devices while signed out still counts twice, and it undercounts if a visitor blocks or clears cookies before signing in. Both may be affected by disabled JavaScript, blockers, or bots.</p>
  </main>;
}
