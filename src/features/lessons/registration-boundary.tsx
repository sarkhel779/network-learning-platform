import Link from "next/link";
import { useId } from "react";

type RegistrationBoundaryProps = {
  returnTo: string;
};

export function RegistrationBoundary({ returnTo }: RegistrationBoundaryProps) {
  const headingId = `continue-free-${useId()}`;

  return (
    <section aria-labelledby={headingId} className="access-card registration-boundary">
      <p className="eyebrow">Free account</p>
      <h2 id={headingId}>Continue this lesson for free</h2>
      <p>
        Unlock the remaining explanation, Wireshark checks, quizzes,
        interview answers, and saved progress. No payment required.
      </p>
      <Link className="primary-link" href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}>
        Continue with Google or email
      </Link>
    </section>
  );
}
