import Link from "next/link";

import { safeReturnPath } from "@/features/auth/return-path";
import { SignInForm } from "@/features/auth/sign-in-form";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    returnTo?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const returnTo = safeReturnPath(params.returnTo);
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
          Continue securely with Google or receive a one-time sign-in link by
          email. Packetsecrets never asks you to create a password.
        </p>
        {params.error === "authentication" ? (
          <p role="alert">Your secure sign-in could not be completed. Please try again.</p>
        ) : null}
        <SignInForm returnTo={returnTo} />
        <Link className="primary-link" href={returnTo}>{returnLabel}</Link>
      </section>
    </main>
  );
}
