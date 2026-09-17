import Link from "next/link";

import { requireStaff } from "@/features/admin/admin-access";
import { listWaitlist } from "@/features/admin/admin.repository";
import type { WaitlistMember } from "@/features/admin/admin.types";

type Props = { searchParams: Promise<{ page?: string }> };

export default async function WaitlistPage({ searchParams }: Props) {
  await requireStaff("users_read");
  const params = await searchParams;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  let result: { rows: WaitlistMember[]; total: number } | null = null;
  try {
    result = await listWaitlist({ offset: (page - 1) * 20, limit: 20 });
  } catch {
    // An unavailable list must never be represented as an empty result.
  }
  const pages = result ? Math.ceil(result.total / 20) : 0;

  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">Administration</p><h1>Pro waitlist</h1></div><span>{result ? `${result.total.toLocaleString("en-IN")} joined` : "Directory unavailable"}</span></header>
    <p>Everyone who has registered interest in the Founding Pro program. This is not a paid plan — see Billing for subscriptions.</p>
    {!result ? (
      <p role="status">The waitlist is temporarily unavailable. Please try again.</p>
    ) : result.rows.length === 0 ? (
      <p>No one has joined the waitlist yet.</p>
    ) : (
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead><tr><th scope="col">Learner</th><th scope="col">Joined</th><th scope="col">Source lesson</th><th scope="col">Action</th></tr></thead>
          <tbody>
            {result.rows.map((member) => (
              <tr key={member.userId}>
                <td><strong>{member.displayName || "Unnamed learner"}</strong><small>{member.email}</small></td>
                <td>{new Date(member.consentedAt).toLocaleDateString("en-IN")}</td>
                <td>{member.sourceLessonSlug || "—"}</td>
                <td><Link href={`/admin/users/${member.userId}`}>View profile</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {result && pages > 1 ? (
      <nav className="admin-pagination" aria-label="Waitlist pages">
        {page > 1 ? <Link href={`/admin/waitlist?page=${page - 1}`}>Previous</Link> : null}
        <span>Page {page} of {pages}</span>
        {page < pages ? <Link href={`/admin/waitlist?page=${page + 1}`}>Next</Link> : null}
      </nav>
    ) : null}
  </main>;
}
