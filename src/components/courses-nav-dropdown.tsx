"use client";

import Link from "next/link";
import { useState } from "react";

export type CoursesNavPathway = { title: string; slug: string };

export function CoursesNavDropdown({
  pathways,
  active,
}: {
  pathways: CoursesNavPathway[];
  active: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="site-nav__courses"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Link href="/courses" aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>Courses</Link>
      <button
        type="button"
        className="site-nav__courses-toggle"
        aria-expanded={open}
        aria-controls="courses-nav-menu"
        aria-label={open ? "Hide course list" : "Show course list"}
        onClick={() => setOpen((value) => !value)}
      >
        <svg aria-hidden="true" viewBox="0 0 12 8" fill="none"><path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open ? (
        <div id="courses-nav-menu" className="site-nav__courses-menu" aria-label="Course pathways">
          {pathways.map((pathway) => (
            <Link key={pathway.slug} href={`/paths/${pathway.slug}`} onClick={() => setOpen(false)}>
              {pathway.title}
            </Link>
          ))}
          <Link className="site-nav__courses-all" href="/courses" onClick={() => setOpen(false)}>
            Browse all courses
          </Link>
        </div>
      ) : null}
    </div>
  );
}
