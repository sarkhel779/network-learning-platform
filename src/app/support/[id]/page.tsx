import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { SupportReplyForm } from "@/features/support/support-reply-form";
import { getMySupportTicket } from "@/features/support/support.repository";
import { getViewer } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Support ticket | Packetsecrets",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

const statusLabels = { open: "Open", in_progress: "In progress", resolved: "Resolved" } as const;

export default async function SupportTicketPage({ params }: Props) {
  const viewer = await getViewer();
  const { id } = await params;
  if (!viewer) redirect("/sign-in?returnTo=%2Fsupport");

  const parsedId = z.coerce.number().int().positive().safeParse(id);
  if (!parsedId.success) notFound();

  let ticket;
  try {
    ticket = await getMySupportTicket(parsedId.data);
  } catch {
    return <main className="informational-page" id="main-content"><h1>Ticket unavailable</h1><p role="status">This ticket could not be loaded. Try again later.</p></main>;
  }
  if (!ticket) notFound();

  return <main className="informational-page" id="main-content">
    <Link href="/support">← All tickets</Link>
    <p className="eyebrow">Support ticket</p>
    <h1>{ticket.subject}</h1>
    <p>{statusLabels[ticket.status]}</p>

    <ul className="support-ticket-thread">
      {ticket.messages.map((message) => (
        <li key={message.id} data-author={message.isStaff ? "staff" : "learner"}>
          <p>{message.body}</p>
          <small>{message.isStaff ? "Packetsecrets support" : "You"} · {new Date(message.createdAt).toLocaleString("en-IN")}</small>
        </li>
      ))}
    </ul>

    <SupportReplyForm ticketId={ticket.id} />
  </main>;
}
