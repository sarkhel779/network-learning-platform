import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { requireStaff } from "@/features/admin/admin-access";
import { getSupportTicket } from "@/features/admin/admin.repository";
import { SupportTicketPanel } from "@/features/admin/support-ticket-panel";

type Props = { params: Promise<{ id: string }> };

const statusLabels = { open: "Open", in_progress: "In progress", resolved: "Resolved" } as const;

export default async function SupportTicketDetailPage({ params }: Props) {
  await requireStaff("support");
  const { id } = await params;
  const parsedId = z.coerce.number().int().positive().safeParse(id);
  if (!parsedId.success) notFound();

  let ticket;
  try {
    ticket = await getSupportTicket(parsedId.data);
  } catch {
    return <main className="admin-page" id="main-content"><h1>Ticket unavailable</h1><p role="status">This ticket could not be loaded. Try again later.</p></main>;
  }
  if (!ticket) notFound();

  return <main className="admin-page" id="main-content">
    <Link href="/admin/support">← All tickets</Link>
    <header className="admin-page__header"><div><p className="eyebrow">Support ticket</p><h1>{ticket.subject}</h1><p>{ticket.learnerEmail}</p></div><span>{statusLabels[ticket.status]}</span></header>
    <div className="admin-detail-grid">
      <SupportTicketPanel ticketId={ticket.id} status={ticket.status} />
      <section className="admin-panel">
        <h2>Conversation</h2>
        <ul className="support-ticket-thread">
          {ticket.messages.map((message) => (
            <li key={message.id} data-author={message.isStaff ? "staff" : "learner"}>
              <p>{message.body}</p>
              <small>{message.isStaff ? "Staff" : ticket.learnerEmail} · {new Date(message.createdAt).toLocaleString("en-IN")}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  </main>;
}
