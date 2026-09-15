import Link from "next/link";

import { requireStaff } from "@/features/admin/admin-access";
import { listAudit } from "@/features/admin/admin.repository";
import type { AuditRow } from "@/features/admin/admin.types";

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AuditPage({ searchParams }: Props) {
  await requireStaff("audit");
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let result: { rows: AuditRow[]; total: number } | null = null;
  try {
    result = await listAudit({ offset: (page - 1) * 20, limit: 20 });
  } catch {
    // Keep a broken audit query distinct from an empty log.
  }
  const pages = result ? Math.ceil(result.total / 20) : 0;
  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">System</p><h1>Audit log</h1></div><span>Append-only events</span></header>
    {!result ? <p role="status">The audit log is temporarily unavailable.</p> : result.rows.length === 0 ? <p>No audit events yet.</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th scope="col">When</th><th scope="col">Action</th><th scope="col">Actor</th><th scope="col">Target</th><th scope="col">Changes</th></tr></thead><tbody>{result.rows.map((event) => <tr key={event.id}><td>{new Date(event.createdAt).toLocaleString("en-IN")}</td><td>{event.action}</td><td>{event.actorId}</td><td>{event.targetId ?? "—"}</td><td><details><summary>View changes</summary><pre>{JSON.stringify({ before: event.beforeValue, after: event.afterValue }, null, 2)}</pre></details></td></tr>)}</tbody></table></div>}
    {result && pages > 1 ? <nav className="admin-pagination" aria-label="Audit pages">{page > 1 ? <Link href={`/admin/audit?page=${page - 1}`}>Previous</Link> : null}<span>Page {page} of {pages}</span>{page < pages ? <Link href={`/admin/audit?page=${page + 1}`}>Next</Link> : null}</nav> : null}
  </main>;
}
