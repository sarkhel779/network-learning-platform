import Link from "next/link";

import { PRO_UNLOCKED_FOR_EVERYONE } from "@/features/lessons/access-policy";

export default function PricingPage() {
  return (
    <main className="informational-page" id="main-content">
      <p className="eyebrow">Learning options</p>
      <h1>Pricing</h1>
      <p className="summary">
        {PRO_UNLOCKED_FOR_EVERYONE
          ? "Every lesson, including Pro material, is unlocked for everyone right now."
          : "Learn the foundations now. Pro learning is still being prepared."}
      </p>
      <div className="information-grid">
        <section>
          <h2>Free learning</h2>
          <p>
            Read the public introductions without an account, then create a free account to continue
            the foundational lessons and save your progress.
          </p>
        </section>
        <section>
          <h2>Founding Pro waitlist</h2>
          <p>
            {PRO_UNLOCKED_FOR_EVERYONE
              ? "Pro material (deeper RFC, Wireshark, troubleshooting, and interview-focused content) is already open to everyone. Join the waitlist for launch and pricing updates once paid plans arrive."
              : "Register your interest in deeper RFC, Wireshark, troubleshooting, and interview-focused material. Joining the waitlist does not purchase or unlock Pro access."}
          </p>
        </section>
      </div>
      <p><strong>No checkout is available and no payment will be taken.</strong></p>
      <p><Link href="/contact">Join the Pro Member Waitlist</Link>.</p>
    </main>
  );
}
