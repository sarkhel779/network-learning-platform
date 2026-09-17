"use client";

import { useState, useTransition } from "react";

import { replySupportTicketAction, setSupportTicketStatusAction } from "@/app/admin/support/[id]/actions";

import type { SupportTicketStatus } from "./admin.types";

const statusLabels: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export function SupportTicketPanel({ ticketId, status }: { ticketId: number; status: SupportTicketStatus }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function submitReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await replySupportTicketAction(data);
      setFeedback(result);
      if (result.ok) form.reset();
    });
  }

  function submitStatus(nextStatus: SupportTicketStatus) {
    startTransition(async () => {
      const data = new FormData();
      data.set("ticketId", String(ticketId));
      data.set("status", nextStatus);
      const result = await setSupportTicketStatusAction(data);
      setFeedback(result);
    });
  }

  return <section className="admin-panel support-ticket-panel">
    <h2>Reply</h2>
    <form onSubmit={submitReply}>
      <input type="hidden" name="ticketId" value={ticketId} />
      <label htmlFor="admin-support-reply">Message to learner</label>
      <textarea id="admin-support-reply" name="body" required maxLength={4000} rows={5} />
      <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send reply"}</button>
    </form>

    <h2>Status</h2>
    <div className="support-ticket-status-controls">
      {(Object.keys(statusLabels) as SupportTicketStatus[]).map((candidate) => (
        <button
          key={candidate}
          type="button"
          disabled={pending || candidate === status}
          aria-pressed={candidate === status}
          onClick={() => submitStatus(candidate)}
        >
          {statusLabels[candidate]}
        </button>
      ))}
    </div>
    {feedback ? <p role={feedback.ok ? "status" : "alert"}>{feedback.message}</p> : null}
  </section>;
}
