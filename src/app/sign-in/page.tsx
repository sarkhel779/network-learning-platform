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
    : returnTo === "/dashboard"
      ? "Back to dashboard"
      : returnTo.startsWith("/paths/")
      ? "Back to your pathway"
      : "Back to Packetsecrets";
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  const authenticationError = params.error === "link_expired"
    ? "This sign-in link is invalid, expired, or was already used. Request a new link below."
    : params.error === "authentication"
      ? "Your secure sign-in could not be completed. Please try again."
      : null;

  return (
    <main id="main-content" className="sign-in-page">
      <section aria-labelledby="sign-in-heading" className="access-card sign-in-card">
        <p className="eyebrow">Free account</p>
        <h1 id="sign-in-heading">Sign in to Packetsecrets</h1>
        <p className="summary">
          {googleEnabled
            ? "Continue securely with Google or receive a one-time sign-in link by email. "
            : "Receive a one-time sign-in link by email. "}
          Packetsecrets never asks you to create a password.
        </p>
        <ul className="sign-in-card__trust" aria-label="Account benefits">
          <li>Passwordless and secure</li>
          <li>Resume lessons across devices</li>
          <li>Your progress stays private</li>
        </ul>
        {authenticationError ? <p role="alert">{authenticationError}</p> : null}
        <SignInForm googleEnabled={googleEnabled} returnTo={returnTo} />
        <Link className="sign-in-card__back" href={returnTo}>{returnLabel}</Link>
      </section>
    </main>
  );
}
