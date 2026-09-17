import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SupportTicketForm } from "@/features/support/support-ticket-form";
import { listMySupportTickets } from "@/features/support/support.repository";
import type { SupportTicketSummary } from "@/features/support/support.types";
import { getViewer } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Support | Packetsecrets",
  robots: { index: false, follow: false },
};

const statusLabels: Record<SupportTicketSummary["status"], string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export default async function SupportPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?returnTo=%2Fsupport");

  let tickets: SupportTicketSummary[] | null = null;
  try {
    tickets = await listMySupportTickets();
  } catch {
    // An unavailable list must never be represented as "no tickets".
  }

  return <main className="informational-page" id="main-content">
    <p className="eyebrow">Help</p>
    <h1>Support</h1>
    <p className="summary">Send us a message and we&rsquo;ll reply here.</p>

    <section aria-labelledby="support-tickets-heading">
      <h2 id="support-tickets-heading">Your tickets</h2>
      {!tickets ? (
        <p role="status">Your tickets could not be loaded. Please try again.</p>
      ) : tickets.length === 0 ? (
        <p>You have not submitted a support ticket yet.</p>
      ) : (
        <ul className="support-ticket-list">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link href={`/support/${ticket.id}`}>{ticket.subject}</Link>
              <span>{statusLabels[ticket.status]}</span>
            </li>
          ))}
        </ul>
      )}
    </section>

    <SupportTicketForm />
  </main>;
}
