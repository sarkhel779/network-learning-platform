import Link from "next/link";

import { pathways } from "@/features/catalog/catalog.data";
import { SamplePacketLab } from "@/features/labs/sample-packet-lab";

const foundation = "/learn/networking-foundations/";
const featured = [
  { title: "Trace the first packet", description: "Watch an end-to-end request and return journey.", href: `${foundation}first-packet-journey-through-a-small-network#complete-packet-journey` },
  { title: "Run DHCP DORA", description: "See Discover, Offer, Request, and ACK with ports and packet fields.", href: `${foundation}dhcp-and-automatic-address-configuration#interactive-dora-journey` },
  { title: "Follow the DHCP relay", description: "Compare local broadcast with relay-to-server forwarding.", href: `${foundation}dhcp-and-automatic-address-configuration#interactive-relay-helper` },
] as const;

const checks = pathways.flatMap((pathway) => pathway.modules.flatMap((module) => module.lessons.filter((lesson) => lesson.published).flatMap((lesson) => (lesson.sections ?? []).filter((section) => section.id.includes("knowledge-check") || section.id === "knowledge-summary").map((section) => ({
  title: lesson.title,
  label: section.label,
  href: `/learn/${pathway.slug}/${lesson.slug}#${section.id}`,
  access: section.access,
})))));

export default function LabsPage() {
  return <main id="main-content" className="labs-page">
    <header className="labs-page__intro"><p className="home-eyebrow">Learn · Visualize · Practice</p><h1>Interactive Packet Lab</h1><p>Change a network setup, predict the result, and follow the packet one hop at a time. This sample runs in your browser; its attempts are not saved.</p></header>
    <SamplePacketLab />
    <section className="labs-page__practice" aria-labelledby="practice-heading"><div className="home-section-heading"><h2 id="practice-heading">More packet practice</h2><p>Open the guided players already built into our lessons.</p></div><div className="labs-page__cards">{featured.map((item) => <Link key={item.title} href={item.href}><strong>{item.title}</strong><span>{item.description}</span><small>Open lesson →</small></Link>)}</div></section>
    <section className="labs-page__checks" aria-labelledby="checks-heading"><h2 id="checks-heading">Browse lesson quizzes</h2><p>Knowledge checks live beside their lessons, with account progress where available.</p><details><summary>Show {checks.length} lesson checks</summary><ul>{checks.map((check) => <li key={check.href}><Link href={check.href}>{check.title} · {check.label}{check.access === "public" ? "" : " · Free account"}</Link></li>)}</ul></details></section>
  </main>;
}
