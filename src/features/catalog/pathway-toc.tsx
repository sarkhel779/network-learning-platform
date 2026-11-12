"use client";

import { useEffect, useRef, useState } from "react";

type PathwayTocModule = { id: string; title: string };

export function PathwayToc({ modules }: { modules: readonly PathwayTocModule[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const nav = navRef.current;
    if (!sentinel || !nav) return;

    const stickyTop = Number.parseFloat(getComputedStyle(nav).top) || 0;
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0, rootMargin: `-${stickyTop}px 0px 0px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 0 }} />
      <nav ref={navRef} aria-label="Jump to module" className={collapsed ? "pathway-toc pathway-toc--collapsed" : "pathway-toc"}>
        <button type="button" className="pathway-toc__toggle" aria-expanded={!collapsed} onClick={() => setCollapsed((current) => !current)}>
          Jump to module
          <span aria-hidden="true" className="pathway-toc__chevron">▾</span>
        </button>
        {!collapsed ? (
          <div className="pathway-toc__links">
            {modules.map((module, index) => (
              <a href={`#${module.id}`} key={module.id}>
                <span aria-hidden="true">{index + 1}</span>
                {module.title}
              </a>
            ))}
          </div>
        ) : null}
      </nav>
    </>
  );
}
