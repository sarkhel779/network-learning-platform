import Link from "next/link";

import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="site-chrome">
        <Link className="site-logo" href="/" aria-label="Packetsecrets">
          <span className="site-logo__mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="site-logo__wordmark"><span className="site-logo__packet">Packet</span><span className="site-logo__secrets">secrets</span></span>
        </Link>
        <div className="site-header__actions">
          <nav aria-label="Primary navigation" className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/paths/networking-foundations">Courses</Link>
            <Link href="/labs">Labs</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <Link className="site-header__sign-in" href="/sign-in">Sign in</Link>
          <Link className="site-header__get-started" href="/paths/networking-foundations">Get started</Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
