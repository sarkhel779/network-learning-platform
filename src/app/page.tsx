import Link from "next/link";

import { pathways } from "@/features/catalog/catalog.data";
import { DeviceIcon, RouteIllustration } from "@/features/home/route-illustration";

const pathway = pathways.find((item) => item.slug === "networking-foundations")!;
const firstLesson = "/learn/networking-foundations/how-networks-communicate";
const topics = [
  { label: "TCP/IP Model", slug: "osi-and-tcp-ip-models#tcp-ip-model", icon: "▤" },
  { label: "OSI Model", slug: "osi-and-tcp-ip-models#osi-model", icon: "▤" },
  { label: "IP Addressing (IPv4 & IPv6)", slug: "ipv4-addressing", icon: "◇" },
  { label: "Subnetting", slug: "subnetting-fundamentals", icon: "⌘" },
  { label: "Switching & VLANs", slug: "vlans-access-ports-and-trunks", icon: "▣" },
  { label: "Routing", slug: "routing-tables-and-default-routes", icon: "↗" },
  { label: "ARP & MAC", slug: "arp-and-local-delivery", icon: "⊞" },
  { label: "DNS", slug: "dns-and-name-resolution", icon: "◎" },
  { label: "DHCP", slug: "dhcp-and-automatic-address-configuration", icon: "▤" },
  { label: "TCP & UDP", slug: "tcp-udp-and-ports", icon: "⇅" },
  { label: "HTTP/HTTPS", slug: "http-https-tls-and-essential-network-services", icon: "♧" },
] as const;

export default function HomePage() {
  return (
    <main id="main-content" className="home-refresh">
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="home-hero-copy">
          <p className="home-eyebrow">Networking made simple</p>
          <h1 id="home-heading">Understand networks.<br /><span>One packet at a time.</span></h1>
          <p>Learn networking through clear explanations, visual packet journeys, and hands-on practice.</p>
          <div className="home-actions">
            <Link className="home-button home-button-primary" href={firstLesson}>Start learning free →</Link>
            <Link className="home-button home-button-secondary" href="/paths/networking-foundations">Explore Networking Foundations</Link>
          </div>
          <div className="home-benefits"><span>◈ Visual learning</span><span>⌘ Hands-on practice</span><span>✓ Build real skills</span></div>
        </div>
        <RouteIllustration />
      </section>
      <section className="home-section" aria-labelledby="core-heading">
        <div className="home-section-heading"><h2 id="core-heading">Core Topics You’ll Learn</h2><p>Focus on the fundamentals. Build a strong foundation.</p></div>
        <div className="home-topics">{topics.map((topic) => <Link key={topic.label} href={topic.slug === "tcp-udp-and-ports" ? `/paths/${pathway.slug}` : `/learn/${pathway.slug}/${topic.slug}`}><span className="home-topic-icon" aria-hidden="true">{topic.icon}</span><strong>{topic.label}</strong></Link>)}</div>
      </section>
      <section className="home-section home-lab" aria-labelledby="lab-heading"><div><p className="home-eyebrow">Interactive packet lab</p><h2 id="lab-heading">Try the packet lab</h2><p>Change a network setup, predict what happens, and watch each packet hop.</p><Link className="home-button home-button-primary" href="/labs">Try a sample lab →</Link></div><div className="home-lab-topology" aria-hidden="true">{(["laptop", "switch", "router", "cloud", "server"] as const).map((kind, index) => <div className="home-lab-segment" key={kind}><span className="home-lab-device"><DeviceIcon kind={kind} /><small>{["PC", "Switch", "Router", "Internet", "Server"][index]}</small></span>{index < 4 ? <i /> : null}</div>)}</div></section>
      <section className="home-section" aria-labelledby="journey-heading"><div className="home-section-heading"><h2 id="journey-heading">Your learning journey</h2><p>Build understanding one module at a time.</p></div><div className="home-journey">{pathway.modules.map((module, index) => <div key={module.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{module.title}</strong><small>{module.lessons.filter((lesson) => lesson.published).length} lessons</small></div>)}</div></section>
      <section className="home-final"><h2>Build your networking skills today</h2><p>Start with a free lesson and learn what really happens when devices communicate.</p><div className="home-actions"><Link className="home-button home-button-primary" href={firstLesson}>Start learning free →</Link><Link className="home-button home-button-secondary" href="/sign-in">Create a free account</Link></div></section>
    </main>
  );
}
