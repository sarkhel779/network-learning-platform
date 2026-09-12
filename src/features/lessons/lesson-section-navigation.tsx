"use client";

import { useState } from "react";

import type { LessonSection } from "@/features/catalog/catalog.types";

type LessonSectionNavigationProps = {
  sections?: LessonSection[];
  presentation?: "list" | "dns-network-map" | "network-map" | "nat-network-map" | "troubleshooting-network-map";
  lockedReturnTo?: string;
  mapGroups?: readonly { label: string; node: string; ids: readonly string[] }[];
  panelId?: string;
  viewerAccess?: "anonymous" | "account" | "pro";
};

const dnsGroups = [
  { label: "Resolution path", node: "Resolver", ids: ["why-name-resolution-exists", "dns-roles-responsibility-boundaries", "domain-labels-zones-delegation", "recursive-service-iterative-referrals", "interactive-complete-resolution"] },
  { label: "Messages and records", node: "Authority", ids: ["dns-message-header-structure", "record-types-selection-rules", "dns-transports", "caching-ttl-negative-caching", "response-codes-nodata", "reverse-dns"] },
  { label: "Evidence and troubleshooting", node: "Evidence", ids: ["interactive-dns-troubleshooting", "dns-command-capture-evidence", "common-dns-misconceptions", "summary-next-steps", "cold-warm-cache-practice", "record-selection-practice", "dns-packet-capture-practice", "knowledge-check-summary"] },
  { label: "Advanced DNS", node: "Pro", ids: ["dns-timing-diagram", "rfc-level-dns-checks", "dnssec-advanced-wireshark", "advanced-dns-operations", "root-server-bootstrap-bonus"] },
] as const;

const natGroups = [
  { label: "Translation boundary", node: "Boundary", ids: ["ipv4-translation-boundary", "nat-vocabulary-address-realms"] },
  { label: "Mappings and state", node: "PAT State", ids: ["static-nat-port-forwarding", "dynamic-nat-address-pools", "pat-translation-table-state"] },
  { label: "Internet journey", node: "Journey", ids: ["complete-internet-packet-journey", "return-traffic-timeouts-failures", "public-knowledge-check"] },
  { label: "Account practice", node: "Practice", ids: ["account-pat-journey", "account-mapping-lab", "account-troubleshooting-lab", "account-knowledge-checks"] },
  { label: "Pro evidence and U-Turn NAT", node: "Hairpin", ids: ["pro-packet-analysis", "pro-rfc-validation", "pro-u-turn-nat-lab"] },
] as const;

const troubleshootingGroups = [
  { label: "Define the boundary", node: "Scope", ids: ["scope-the-incident", "form-a-hypothesis"] },
  { label: "Collect proof", node: "Evidence", ids: ["collect-evidence", "guided-branch-incident"] },
  { label: "Narrow the cause", node: "Isolation", ids: ["isolate-the-fault", "guided-incident-debrief", "pro-sparse-incident"] },
  { label: "Verify service", node: "Restore", ids: ["restore-the-service"] },
  { label: "Preserve learning", node: "Report", ids: ["report-and-prevent", "pro-incident-report", "pro-advanced-validation"] },
] as const;

function lessonGroups(sections: LessonSection[]) {
  const count = Math.min(4, sections.length);
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor(index * sections.length / count);
    const end = Math.floor((index + 1) * sections.length / count);
    const group = sections.slice(start, end);
    return {
      label: start + 1 === end ? `Topic ${end}` : `Topics ${start + 1}–${end}`,
      node: `Hop ${index + 1}`,
      ids: group.map(({ id }) => id),
    };
  });
}

function SectionItem({
  section: { id, label, access, preview },
  lockedReturnTo,
  viewerAccess = "anonymous",
}: {
  section: LessonSection;
  lockedReturnTo?: string;
  viewerAccess?: "anonymous" | "account" | "pro";
}) {
  const accessible = access === "public" || viewerAccess === "pro" || (viewerAccess === "account" && access === "account");
  const lockedContent = (
    <>
      <span>{label}</span>
      {access === "pro" ? <span className="access-label">Pro</span> : null}
      <span className="lesson-section-navigation__status">Locked</span>
      {access === "pro" && preview ? <p>{preview}</p> : null}
    </>
  );

  return <li>{accessible ? (
    <a href={`#${id}`}>{label}</a>
  ) : lockedReturnTo ? (
    <a
      className="lesson-section-navigation__locked lesson-section-navigation__locked-link"
      href={`/sign-in?returnTo=${encodeURIComponent(`${lockedReturnTo}#${id}`)}`}
    >
      {lockedContent}
    </a>
  ) : (
    <div className="lesson-section-navigation__locked">
      {lockedContent}
    </div>
  )}</li>;
}

export function LessonSectionNavigation({ sections, presentation = "list", lockedReturnTo, mapGroups, panelId = "lesson-page-contents", viewerAccess = "anonymous" }: LessonSectionNavigationProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [revealCycle, setRevealCycle] = useState(0);

  if (!sections?.length) return null;

  if (presentation === "dns-network-map" || presentation === "network-map" || presentation === "nat-network-map" || presentation === "troubleshooting-network-map") {
    const groups = mapGroups ?? (presentation === "nat-network-map" ? natGroups : presentation === "troubleshooting-network-map" ? troubleshootingGroups : presentation === "dns-network-map" ? dnsGroups : lessonGroups(sections));
    const toggleMap = () => {
      if (!isMapOpen) setRevealCycle((cycle) => cycle + 1);
      setIsMapOpen(!isMapOpen);
    };

    return (
      <nav aria-label="Page contents" className="lesson-section-navigation lesson-section-navigation--network-map">
        <button
          aria-controls={panelId}
          aria-expanded={isMapOpen}
          className="dns-map__trigger network-map__trigger"
          onClick={toggleMap}
          type="button"
        >
          <strong>Page contents</strong>
        </button>
        {isMapOpen ? (
          <div className="dns-map__panel network-map__panel" id={panelId}>
            <div className="dns-map__route network-map__route" data-reveal-cycle={revealCycle} data-testid="network-map-route" key={revealCycle} aria-hidden="true">
              <span className="dns-map__travelling-packet network-map__travelling-packet">◆</span>
              {groups.map(({ node }, index) => (
                <span key={node} className="dns-map__hop network-map__hop">
                  <span>{node}</span>
                  {index < groups.length - 1 ? <i /> : null}
                </span>
              ))}
            </div>
            <div className="dns-map__groups network-map__groups">
              {groups.map(({ label, ids }) => {
                const grouped = sections.filter(({ id }) => (ids as readonly string[]).includes(id));
                return grouped.length ? <section key={label}><h3>{label}</h3><ol>{grouped.map((section) => <SectionItem key={section.id} section={section} lockedReturnTo={lockedReturnTo} viewerAccess={viewerAccess} />)}</ol></section> : null;
              })}
            </div>
          </div>
        ) : null}
      </nav>
    );
  }

  return (
    <nav aria-label="On this page" className="lesson-section-navigation">
      <h2>On this page</h2>
      <ol>
        {sections.map((section) => <SectionItem key={section.id} section={section} />)}
      </ol>
    </nav>
  );
}
