"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createSupportTicketAction } from "@/app/support/actions";

export function SupportTicketForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createSupportTicketAction(data);
      if (result.ok && result.ticketId) {
        router.push(`/support/${result.ticketId}`);
        return;
      }
      setFeedback(result);
    });
  }

  return <section className="admin-panel support-ticket-form">
    <h2>Start a new ticket</h2>
    <form onSubmit={submit}>
      <label htmlFor="support-ticket-subject">Subject</label>
      <input id="support-ticket-subject" name="subject" required maxLength={150} placeholder="What do you need help with?" />
      <label htmlFor="support-ticket-body">Message</label>
      <textarea id="support-ticket-body" name="body" required maxLength={4000} rows={5} placeholder="Describe the issue. We'll reply here." />
      <button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit ticket"}</button>
      {feedback ? <p role={feedback.ok ? "status" : "alert"}>{feedback.message}</p> : null}
    </form>
  </section>;
}
