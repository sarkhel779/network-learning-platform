"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { isPublicPagePath } from "./page-view.schema";

export function PageViewRecorder() {
  const pathname = usePathname();
  const lastRecordedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !isPublicPagePath(pathname) || lastRecordedPath.current === pathname) return;
    lastRecordedPath.current = pathname;
    const eventId = crypto.randomUUID();
    void fetch("/api/page-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "omit",
      keepalive: true,
      body: JSON.stringify({ path: pathname, eventId }),
    }).catch(() => { /* Counting is best-effort; navigation must remain unaffected. */ });
  }, [pathname]);

  return null;
}
