"use client";

import { useState } from "react";

type PathwayTocModule = { id: string; title: string };

export function PathwayToc({ modules }: { modules: readonly PathwayTocModule[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav aria-label="Jump to module" className={collapsed ? "pathway-toc pathway-toc--collapsed" : "pathway-toc"}>
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
  );
}
