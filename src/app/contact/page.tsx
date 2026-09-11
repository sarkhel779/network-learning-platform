import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="informational-page" id="main-content">
      <p className="eyebrow">Coming next</p>
      <h1>Founding Pro waitlist</h1>
      <p className="summary">Pro learning is being shaped around real learner needs.</p>
      <p>
        The dedicated waitlist form is being prepared. For now, create a free account and continue
        learning; no payment is required and no Pro entitlement is being sold.
      </p>
      <p><Link href="/sign-in">Create or open your free account</Link>.</p>
    </main>
  );
}
