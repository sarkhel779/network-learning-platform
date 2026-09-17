"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { isPublicPagePath } from "./page-view.schema";

export function PageViewRecorder() {
  const pathname = usePathname();
  const lastRecordedPath = useRef<string | null>(null);
  const pendingPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !isPublicPagePath(pathname) || lastRecordedPath.current === pathname || pendingPath.current === pathname) return;
    pendingPath.current = pathname;
    const eventId = crypto.randomUUID();
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const record = async () => {
      for (let attempt = 0; attempt < 3 && !cancelled; attempt += 1) {
        try {
          const response = await fetch("/api/page-view", {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "same-origin",
            keepalive: true,
            body: JSON.stringify({ path: pathname, eventId }),
          });
          if (response.ok) {
            lastRecordedPath.current = pathname;
            break;
          }
          if (response.status < 500 && response.status !== 429) break;
        } catch {
          // A transient network failure is retried below.
        }
        if (attempt < 2 && !cancelled) {
          await new Promise<void>((resolve) => {
            retryTimer = setTimeout(resolve, 1000 * (2 ** attempt));
          });
        }
      }
      if (pendingPath.current === pathname) pendingPath.current = null;
    };
    void record();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (pendingPath.current === pathname) pendingPath.current = null;
    };
  }, [pathname]);

  return null;
}
