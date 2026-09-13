import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPathway } from "@/features/catalog/catalog.repository";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { MyLearning } from "@/features/progress/my-learning";
import { loadMyLearning } from "@/features/progress/my-learning.server";
import { getViewer } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "My dashboard | Packetsecrets",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?returnTo=%2Fdashboard");

  const pathway = getPathway("networking-foundations");
  const learning = await loadMyLearning(viewer.id, pathway);

  return <main className="informational-page dashboard-page" id="main-content">
    <p className="eyebrow">Your learning space</p>
    <h1>My dashboard</h1>
    <p className="summary">Pick up where you left off and keep your learning in one place.</p>
    <section aria-labelledby="dashboard-account-heading" className="dashboard-account">
      <div>
        <h2 id="dashboard-account-heading">Account</h2>
        <p>Signed in as <strong>{viewer.displayName || "Packetsecrets learner"}</strong></p>
      </div>
      <SignOutButton />
    </section>
    <section aria-labelledby="dashboard-progress-heading" className="dashboard-progress">
      <h2 id="dashboard-progress-heading">Your progress</h2>
      <MyLearning model={learning.model} unavailable={learning.unavailable} />
    </section>
    <Link href="/paths/networking-foundations">Browse Networking Foundations</Link>
  </main>;
}
