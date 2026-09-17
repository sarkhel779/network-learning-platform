import Link from "next/link";

import { requireStaff } from "@/features/admin/admin-access";
import { listSupportTickets } from "@/features/admin/admin.repository";
import type { SupportTicketRow, SupportTicketStatus } from "@/features/admin/admin.types";

type Props = { searchParams: Promise<{ status?: string; page?: string }> };

const statusLabels: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

const statusFilters = ["open", "in_progress", "resolved"] as const;

function isSupportTicketStatus(value: string): value is SupportTicketStatus {
  return (statusFilters as readonly string[]).includes(value);
}

export default async function SupportPage({ searchParams }: Props) {
  await requireStaff("support");
  const params = await searchParams;
  const status = typeof params.status === "string" && isSupportTicketStatus(params.status) ? params.status : undefined;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  let result: { rows: SupportTicketRow[]; total: number } | null = null;
  try {
    result = await listSupportTickets({ status, offset: (page - 1) * 20, limit: 20 });
  } catch {
    // An unavailable queue must never be represented as an empty result.
  }
  const pages = result ? Math.ceil(result.total / 20) : 0;
  const statusPart = status ? `&status=${status}` : "";

  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">Operations</p><h1>Support</h1></div><span>{result ? `${result.total.toLocaleString("en-IN")} tickets` : "Queue unavailable"}</span></header>
    <nav aria-label="Filter by status" className="admin-search">
      <Link href="/admin/support" aria-current={!status ? "page" : undefined}>All</Link>
      {statusFilters.map((candidate) => (
        <Link key={candidate} href={`/admin/support?status=${candidate}`} aria-current={status === candidate ? "page" : undefined}>
          {statusLabels[candidate]}
        </Link>
      ))}
    </nav>
    {!result ? (
      <p role="status">The support queue is temporarily unavailable. Please try again.</p>
    ) : result.rows.length === 0 ? (
      <p>No tickets found.</p>
    ) : (
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead><tr><th scope="col">Ticket</th><th scope="col">Learner</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead>
          <tbody>
            {result.rows.map((ticket) => (
              <tr key={ticket.id}>
                <td><Link href={`/admin/support/${ticket.id}`}>{ticket.subject}</Link></td>
                <td>{ticket.learnerEmail}</td>
                <td>{statusLabels[ticket.status]}</td>
                <td>{new Date(ticket.updatedAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {result && pages > 1 ? (
      <nav className="admin-pagination" aria-label="Ticket pages">
        {page > 1 ? <Link href={`/admin/support?page=${page - 1}${statusPart}`}>Previous</Link> : null}
        <span>Page {page} of {pages}</span>
        {page < pages ? <Link href={`/admin/support?page=${page + 1}${statusPart}`}>Next</Link> : null}
      </nav>
    ) : null}
  </main>;
}
