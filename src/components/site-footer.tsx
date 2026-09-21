import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-chrome footer-content">
        <p>Packetsecrets</p>
        <nav aria-label="Footer navigation" className="footer-nav">
          <Link href="/courses">Courses</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
