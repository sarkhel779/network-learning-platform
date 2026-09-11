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
        No analytics service is configured, and Packetsecrets does not collect payments at this
        stage. This notice will be updated before either capability is introduced.
      </p>
    </main>
  );
}
