import Link from "next/link";

import { listPathways, listPublishedLessons } from "@/features/catalog/catalog.repository";

type SignInPageProps = {
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

function safeReturnPath(value: string | string[] | undefined): string {
  const allowedPaths = new Set([
    "/",
    ...listPathways().flatMap(({ slug }) => [
      `/paths/${slug}`,
      ...listPublishedLessons(slug).map((lesson) => `/learn/${slug}/${lesson.slug}`),
    ]),
  ]);

  return typeof value === "string" && allowedPaths.has(value) ? value : "/";
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const returnTo = safeReturnPath((await searchParams).returnTo);
  const returnLabel = returnTo.startsWith("/learn/")
    ? "Back to your lesson"
    : returnTo.startsWith("/paths/")
      ? "Back to your pathway"
      : "Back to Packetsecrets";

  return (
    <main id="main-content" className="hero">
      <section aria-labelledby="sign-in-heading" className="access-card">
        <p className="eyebrow">Free account</p>
        <h1 id="sign-in-heading">Sign in to Packetsecrets</h1>
        <p className="summary">
          Google and email passwordless sign-in is being prepared.
          Account access is not available yet. You can keep exploring the public
          lessons and interactive players while we get it ready.
        </p>
        <Link className="primary-link" href={returnTo}>{returnLabel}</Link>
      </section>
    </main>
  );
}
