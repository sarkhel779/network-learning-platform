import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="informational-page" id="main-content">
      <p className="eyebrow">Site information</p>
      <h1>Privacy</h1>
      <p className="summary">Packetsecrets uses only the data needed to provide the learning experience.</p>
      <p>
        Passwordless accounts are provided through Supabase. When you sign in, Supabase processes
        your email address and authentication session so Packetsecrets can identify your account.
      </p>
      <p>
        Packetsecrets stores learner profile information, learning progress, knowledge-check attempts,
        bookmarks, and other learning state associated with your account. This information is used
        to restore your place and support the learning tools you choose to use.
      </p>
      <p>
        If you join the Founding Pro waitlist, Packetsecrets stores your waitlist status, the consent
        timestamp and version, your account email, and optional lesson attribution showing where you
        chose to join. Unsubscribing keeps a record that updates are off rather than deleting the row.
      </p>
      <p>
        Marketing notification delivery is not configured yet. It will be configured before messages
        begin. You can <Link href="/contact">withdraw consent through the contact page</Link> and may
        later rejoin with fresh consent.
      </p>
      <p>
        Packetsecrets counts total page views and unique visitors using a first-party request when a
        public page is opened. The page-view record contains a page path, timestamp, and random retry
        identifier. It does not store an IP address, account ID, full query string, or browser
        fingerprint in that record. To tell a repeat visit apart from a new visitor, Packetsecrets sets
        a random, anonymous identifier in a first-party cookie that lasts up to 400 days; it is not
        linked to your account and is not used anywhere else on the site. Total page views counts every
        visit, including repeats; unique visitors approximates the number of distinct people and resets
        if you clear cookies, switch browsers, or block cookies. Both counts start when each feature is
        deployed; blocking scripts, bot traffic, and rate limiting may affect them.
      </p>
      <p>
        Packetsecrets does not collect payments at this stage. Billing information will be added
        to this notice before payment collection begins.
      </p>
    </main>
  );
}
