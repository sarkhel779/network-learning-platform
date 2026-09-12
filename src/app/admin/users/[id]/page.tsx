import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { canStaff, requireStaff } from "@/features/admin/admin-access";
import { getLearnerDetail } from "@/features/admin/admin.repository";
import { LearnerEditor } from "@/features/admin/learner-editor";

type Props = { params: Promise<{ id: string }> };

export default async function LearnerDetailPage({ params }: Props) {
  const { role } = await requireStaff("users_read");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  let learner;
  try {
    learner = await getLearnerDetail(id);
  } catch {
    return <main className="admin-page" id="main-content"><h1>Account unavailable</h1><p role="status">This learner profile could not be loaded. Try again later.</p></main>;
  }
  if (!learner) notFound();
  return <main className="admin-page" id="main-content">
    <Link href="/admin/users">← All users</Link>
    <header className="admin-page__header"><div><p className="eyebrow">Learner account</p><h1>{learner.displayName || "Unnamed learner"}</h1><p>{learner.email}</p></div><span>{learner.waitlistStatus === "joined" ? "Joined Founding Pro waitlist" : learner.waitlistStatus === "unsubscribed" ? "Unsubscribed" : "Not on waitlist"}</span></header>
    <div className="admin-detail-grid">
      {canStaff(role, "users_write") ? <LearnerEditor learner={learner} /> : null}
      <section className="admin-panel"><h2>Account details</h2><dl><dt>Account created</dt><dd>{new Date(learner.createdAt).toLocaleDateString("en-IN")}</dd><dt>Learning level</dt><dd>{learner.learningLevel || "Not set"}</dd><dt>Waitlist</dt><dd>{learner.waitlistStatus === "joined" ? "Joined" : learner.waitlistStatus === "unsubscribed" ? "Unsubscribed" : "Not joined"}</dd></dl><p>Billing and subscription management are not connected yet.</p></section>
    </div>
    <section className="admin-panel"><h2>Internal notes</h2>{learner.notes.length ? <ul>{learner.notes.map((note) => <li key={note.id}><p>{note.body}</p><small>{new Date(note.createdAt).toLocaleString("en-IN")}</small></li>)}</ul> : <p>No internal notes yet.</p>}</section>
  </main>;
}
