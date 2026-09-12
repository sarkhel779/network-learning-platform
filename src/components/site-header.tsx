"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HeaderSearch, type HeaderSearchLesson } from "./header-search";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ lessons = [] }: { lessons?: HeaderSearchLesson[] }) {
  const pathname = usePathname() ?? "";
  const currentSection = pathname === "/" ? "Home" : pathname === "/labs" || pathname.startsWith("/labs/") ? "Labs" : pathname === "/pricing" || pathname.startsWith("/pricing/") ? "Pricing" : pathname.startsWith("/paths/") || pathname.startsWith("/learn/") ? "Courses" : null;

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
            <Link href="/" aria-current={currentSection === "Home" ? "page" : undefined}>Home</Link>
            <Link href="/paths/networking-foundations" aria-current={currentSection === "Courses" ? "page" : undefined}>Courses</Link>
            <Link href="/labs" aria-current={currentSection === "Labs" ? "page" : undefined}>Labs</Link>
            <Link href="/pricing" aria-current={currentSection === "Pricing" ? "page" : undefined}>Pricing</Link>
          </nav>
          <HeaderSearch lessons={lessons} />
          <Link className="site-header__sign-in" href="/sign-in">Sign in</Link>
          <Link className="site-header__get-started" href="/paths/networking-foundations">Get started</Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
