"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import type { AdminNavItem } from "./admin-navigation";

function NavGroup({ title, items, pathname }: { title: string; items: AdminNavItem[]; pathname: string }) {
  return <div className="admin-nav-group"><p>{title}</p>{items.map((item) => {
    const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
    return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}><span className="admin-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg></span>{item.label}</Link>;
  })}</div>;
}

export function AdminShell({ items, children }: { items: AdminNavItem[]; children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  return <div className="admin-shell"><a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="admin-sidebar"><Link className="admin-brand" href="/"><span className="admin-brand__mark" aria-hidden="true">◇</span>PacketSecrets</Link><nav aria-label="Admin navigation">
      <NavGroup title="GENERAL" items={items.filter((item) => item.group === "GENERAL")} pathname={pathname} />
      <NavGroup title="SYSTEM" items={items.filter((item) => item.group === "SYSTEM")} pathname={pathname} />
    </nav><Link className="admin-sidebar__back" href="/dashboard">← Learner dashboard</Link></aside>
    <div className="admin-shell__content">{children}</div>
  </div>;
}
