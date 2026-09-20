import Link from "next/link";
import { useId } from "react";

type RegistrationBoundaryProps = {
  returnTo: string;
  mode: "save-progress" | "unlock-content";
};

export function RegistrationBoundary({ returnTo, mode }: RegistrationBoundaryProps) {
  const headingId = `continue-free-${useId()}`;
  const heading = mode === "save-progress" ? "Save your progress" : "Take the final quiz";
  const description = mode === "save-progress"
    ? "Sign in to keep lesson completion and quiz results across devices. All lesson content remains free."
    : "Sign in to take the remaining free assessment and save the result.";

  return (
    <section aria-labelledby={headingId} className="access-card registration-boundary">
      <p className="eyebrow">Free account</p>
      <h2 id={headingId}>{heading}</h2>
      <p>{description}</p>
      <Link className="primary-link" href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}>
        Continue with Google or email
      </Link>
    </section>
  );
}
