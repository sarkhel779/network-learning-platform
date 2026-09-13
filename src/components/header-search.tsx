"use client";

import Link from "next/link";
import { useState } from "react";

export type HeaderSearchLesson = { title: string; objective: string; href: string };

export function HeaderSearch({ lessons }: { lessons: HeaderSearchLesson[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = normalizedQuery
    ? lessons.filter(({ title, objective }) => `${title} ${objective}`.toLocaleLowerCase().includes(normalizedQuery)).slice(0, 6)
    : [];

  return (
    <div className="header-search" role="search" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <svg className="header-search__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.8"/><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
      <input
        type="search"
        aria-label="Search lessons"
        placeholder="Search topics, e.g. subnetting..."
        value={query}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
      />
      {open && normalizedQuery && (
        <div className="header-search__results" aria-label="Lesson search results">
          {matches.length ? matches.map((lesson) => (
            <Link key={lesson.href} href={lesson.href} onClick={() => { setQuery(""); setOpen(false); }}>
              <strong>{lesson.title}</strong>
              <small>{lesson.objective}</small>
            </Link>
          )) : <p>No matching lessons yet.</p>}
        </div>
      )}
    </div>
  );
}
