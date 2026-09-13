"use client";

import { useEffect } from "react";
import Link from "next/link";

import { resolveLegacyTransportUrl } from "./legacy-transport-link";

export default function LegacyTransportLessonPage() {
  useEffect(() => {
    window.location.replace(resolveLegacyTransportUrl(window.location.hash, window.location.search));
  }, []);

  return <main className="site-container">
    <h1>TCP and UDP are now separate lessons</h1>
    <p>Taking you to the right lesson. If nothing happens, open <Link href="/learn/networking-foundations/tcp-reliable-transport">TCP: Reliable Transport</Link> or <Link href="/learn/networking-foundations/udp-datagrams-and-ports">UDP: Datagrams and Ports</Link>.</p>
  </main>;
}
