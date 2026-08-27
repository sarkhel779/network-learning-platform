import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="site-chrome">
        <Link className="site-logo" href="/">Network Learning Platform</Link>
        <nav aria-label="Primary navigation" className="site-nav">
          <Link href="/paths/networking-foundations">Learning Paths</Link>
          <span>Pricing</span>
        </nav>
      </div>
    </header>
  );
}
