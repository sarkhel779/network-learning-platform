"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteLogoMark } from "@/components/site-logo";

import { AdminIcon } from "./admin-icons";
import type { AdminNavItem } from "./admin-navigation";

function NavGroup({ title, items, pathname }: { title: string; items: AdminNavItem[]; pathname: string }) {
  return <div className="admin-nav-group"><p>{title}</p>{items.map((item) => {
    const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
    return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}><span className="admin-nav-icon" aria-hidden="true"><AdminIcon name={item.icon} /></span>{item.label}</Link>;
  })}</div>;
}

export function AdminShell({ items, children }: { items: AdminNavItem[]; children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  return <div className="admin-shell"><a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="admin-sidebar"><Link className="admin-brand site-logo" href="/" aria-label="Packetsecrets"><SiteLogoMark /><span className="site-logo__wordmark"><span className="site-logo__packet">Packet</span><span className="site-logo__secrets">secrets</span></span></Link><nav aria-label="Admin navigation">
      <NavGroup title="GENERAL" items={items.filter((item) => item.group === "GENERAL")} pathname={pathname} />
      <NavGroup title="SYSTEM" items={items.filter((item) => item.group === "SYSTEM")} pathname={pathname} />
    </nav><Link className="admin-sidebar__back" href="/dashboard">← Learner dashboard</Link></aside>
    <div className="admin-shell__content">{children}</div>
  </div>;
}
