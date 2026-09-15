import Link from "next/link";

import { requireStaff } from "@/features/admin/admin-access";
import { listLearners } from "@/features/admin/admin.repository";
import type { LearnerRow } from "@/features/admin/admin.types";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function UsersPage({ searchParams }: Props) {
  await requireStaff("users_read");
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let result: { rows: LearnerRow[]; total: number } | null = null;
  try {
    result = await listLearners({ query, offset: (page - 1) * 20, limit: 20 });
  } catch {
    // An unavailable directory must never be represented as an empty result.
  }
  const pages = result ? Math.ceil(result.total / 20) : 0;
  const queryPart = query ? `&q=${encodeURIComponent(query)}` : "";

  return <main className="admin-page" id="main-content">
    <header className="admin-page__header"><div><p className="eyebrow">Administration</p><h1>Users</h1></div><span>{result ? `${result.total.toLocaleString("en-IN")} accounts` : "Directory unavailable"}</span></header>
    <form action="/admin/users" method="get" className="admin-search">
      <label htmlFor="admin-user-search">Search learners</label>
      <input id="admin-user-search" name="q" defaultValue={query} maxLength={100} placeholder="Name or email" />
      <button type="submit">Search</button>
    </form>
    {!result ? <p role="status">The learner directory is temporarily unavailable. Please try again.</p> : result.rows.length === 0 ? <p>No learners found.</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th scope="col">Learner</th><th scope="col">Joined</th><th scope="col">Waitlist</th><th scope="col">Action</th></tr></thead><tbody>{result.rows.map((user) => <tr key={user.id}><td><strong>{user.displayName || "Unnamed learner"}</strong><small>{user.email}</small></td><td>{new Date(user.createdAt).toLocaleDateString("en-IN")}</td><td>{user.waitlistStatus === "joined" ? "Joined" : user.waitlistStatus === "unsubscribed" ? "Unsubscribed" : "Not joined"}</td><td><Link href={`/admin/users/${user.id}`}>View profile</Link></td></tr>)}</tbody></table></div>}
    {result && pages > 1 ? <nav className="admin-pagination" aria-label="User pages">{page > 1 ? <Link href={`/admin/users?page=${page - 1}${queryPart}`}>Previous</Link> : null}<span>Page {page} of {pages}</span>{page < pages ? <Link href={`/admin/users?page=${page + 1}${queryPart}`}>Next</Link> : null}</nav> : null}
  </main>;
}
