"use client";

import { useState, useTransition } from "react";

import { saveLearnerEdit } from "@/app/admin/users/[id]/actions";

import type { LearnerDetail } from "./admin.types";

export function LearnerEditor({ learner }: { learner: LearnerDetail }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await saveLearnerEdit(data);
      setFeedback(result);
      if (result.ok) {
        const note = form.elements.namedItem("note") as HTMLTextAreaElement | null;
        if (note) note.value = "";
      }
    });
  }

  return <section className="admin-panel admin-learner-editor">
    <h2>Edit learner profile</h2>
    <p>Profile edits and internal notes are recorded in the audit log. This does not change billing or waitlist consent.</p>
    <form onSubmit={submit}>
      <input type="hidden" name="targetId" value={learner.id} />
      <label htmlFor="admin-display-name">Display name</label>
      <input id="admin-display-name" name="displayName" maxLength={80} defaultValue={learner.displayName ?? ""} />
      <label htmlFor="admin-learning-level">Learning level</label>
      <select id="admin-learning-level" name="learningLevel" defaultValue={learner.learningLevel ?? ""}>
        <option value="">Not set</option>
        <option value="beginner">Beginner</option>
        <option value="graduate">Graduate</option>
        <option value="it_experienced">IT experienced</option>
        <option value="networking_professional">Networking professional</option>
        <option value="career_switcher">Career switcher</option>
      </select>
      <label htmlFor="admin-internal-note">Add an internal note</label>
      <textarea id="admin-internal-note" name="note" maxLength={1000} rows={4} placeholder="Visible to authorized staff only" />
      <button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
      {feedback ? <p role={feedback.ok ? "status" : "alert"}>{feedback.message}</p> : null}
    </form>
  </section>;
}
