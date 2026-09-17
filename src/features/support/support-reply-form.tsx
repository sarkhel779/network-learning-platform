"use client";

import { useState, useTransition } from "react";

import { addSupportTicketMessageAction } from "@/app/support/actions";

export function SupportReplyForm({ ticketId }: { ticketId: number }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await addSupportTicketMessageAction(data);
      setFeedback(result);
      if (result.ok) form.reset();
    });
  }

  return <form className="support-reply-form" onSubmit={submit}>
    <input type="hidden" name="ticketId" value={ticketId} />
    <label htmlFor="support-reply-body">Reply</label>
    <textarea id="support-reply-body" name="body" required maxLength={4000} rows={4} placeholder="Add more detail or a follow-up question." />
    <button type="submit" disabled={pending}>{pending ? "Sending…" : "Send reply"}</button>
    {feedback ? <p role={feedback.ok ? "status" : "alert"}>{feedback.message}</p> : null}
  </form>;
}
