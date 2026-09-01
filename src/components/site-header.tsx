import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="site-chrome">
        <Link className="site-logo" href="/" aria-label="Packetsecrets">
          <span className="site-logo__mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="site-logo__wordmark"><span className="site-logo__packet">Packet</span><span className="site-logo__secrets">secrets</span></span>
        </Link>
        <nav aria-label="Primary navigation" className="site-nav">
          <Link href="/paths/networking-foundations">Learning Paths</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
      </div>
    </header>
  );
}
