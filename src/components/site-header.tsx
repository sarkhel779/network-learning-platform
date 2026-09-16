"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderSearch, type HeaderSearchLesson } from "./header-search";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ lessons = [], signedIn = false }: { lessons?: HeaderSearchLesson[]; signedIn?: boolean }) {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const currentSection = pathname === "/" ? "Home" : pathname === "/labs" || pathname.startsWith("/labs/") ? "Labs" : pathname === "/dashboard" || pathname.startsWith("/dashboard/") ? "My dashboard" : pathname === "/pricing" || pathname.startsWith("/pricing/") ? "Pricing" : pathname.startsWith("/paths/") || pathname.startsWith("/learn/") ? "Courses" : null;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="site-chrome">
        <Link className="site-logo" href="/" aria-label="Packetsecrets">
          <svg className="site-logo__mark-svg" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="siteLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--logo-grad-start, var(--accent))" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
            <g transform="rotate(-4 100 100)">
              <rect className="site-logo__badge-fill" x="6" y="6" width="188" height="188" rx="45" />
              <rect className="site-logo__badge-outline" x="6" y="6" width="188" height="188" rx="45" />
              <line className="site-logo__conn" x1="68" y1="100" x2="143" y2="100" />
              <circle className="site-logo__dot site-logo__dot--a" cx="56" cy="100" r="21" />
              <circle className="site-logo__dot site-logo__dot--b" cx="141" cy="55" r="21" />
              <circle className="site-logo__dot site-logo__dot--c" cx="141" cy="145" r="21" />
            </g>
          </svg>
          <span className="site-logo__wordmark"><span className="site-logo__packet">Packet</span><span className="site-logo__secrets">secrets</span></span>
        </Link>
        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-header-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-header__toggle-icon" aria-hidden="true" />
        </button>
        <div id="site-header-menu" className="site-header__actions" data-open={menuOpen}>
          <nav aria-label="Primary navigation" className="site-nav">
            <Link href="/" aria-current={currentSection === "Home" ? "page" : undefined}>Home</Link>
            <Link href="/paths/networking-foundations" aria-current={currentSection === "Courses" ? "page" : undefined}>Courses</Link>
            <Link href="/labs" aria-current={currentSection === "Labs" ? "page" : undefined}>Labs</Link>
            <Link href="/dashboard" aria-current={currentSection === "My dashboard" ? "page" : undefined}>My dashboard</Link>
            <Link href="/pricing" aria-current={currentSection === "Pricing" ? "page" : undefined}>Pricing</Link>
          </nav>
          <HeaderSearch lessons={lessons} />
          <Link className="site-header__sign-in" href={signedIn ? "/dashboard" : "/sign-in"}>{signedIn ? "My account" : "Sign in"}</Link>
          <Link className="site-header__get-started" href="/paths/networking-foundations">Get started</Link>
          <ThemeToggle />
        </div>
      </div>
      {menuOpen ? <div className="site-header__backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" /> : null}
    </header>
  );
}
