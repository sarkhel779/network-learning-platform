"use client";

import { useState } from "react";

import type { LessonSection } from "@/features/catalog/catalog.types";

type LessonSectionNavigationProps = {
  sections?: LessonSection[];
  presentation?: "list" | "dns-network-map" | "network-map";
  lockedReturnTo?: string;
  mapGroups?: readonly { label: string; node: string; ids: readonly string[] }[];
  panelId?: string;
};

const dnsGroups = [
  { label: "Resolution path", node: "Resolver", ids: ["why-name-resolution-exists", "dns-roles-responsibility-boundaries", "domain-labels-zones-delegation", "recursive-service-iterative-referrals", "interactive-complete-resolution"] },
  { label: "Messages and records", node: "Authority", ids: ["dns-message-header-structure", "record-types-selection-rules", "dns-transports", "caching-ttl-negative-caching", "response-codes-nodata", "reverse-dns"] },
  { label: "Evidence and troubleshooting", node: "Evidence", ids: ["interactive-dns-troubleshooting", "dns-command-capture-evidence", "common-dns-misconceptions", "summary-next-steps", "cold-warm-cache-practice", "record-selection-practice", "dns-packet-capture-practice", "knowledge-check-summary"] },
  { label: "Advanced DNS", node: "Pro", ids: ["dns-timing-diagram", "rfc-level-dns-checks", "dnssec-advanced-wireshark", "advanced-dns-operations", "root-server-bootstrap-bonus"] },
] as const;

function SectionItem({
  section: { id, label, access, preview },
  lockedReturnTo,
}: {
  section: LessonSection;
  lockedReturnTo?: string;
}) {
  const lockedContent = (
    <>
      <span>{label}</span>
      {access === "pro" ? <span className="access-label">Pro</span> : null}
      <span className="lesson-section-navigation__status">Locked</span>
      {access === "pro" && preview ? <p>{preview}</p> : null}
    </>
  );

  return <li>{access === "public" ? (
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

export function LessonSectionNavigation({ sections, presentation = "list", lockedReturnTo, mapGroups, panelId = "lesson-page-contents" }: LessonSectionNavigationProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [revealCycle, setRevealCycle] = useState(0);

  if (!sections?.length) return null;

  if (presentation === "dns-network-map" || presentation === "network-map") {
    const groups = mapGroups ?? dnsGroups;
    const toggleMap = () => {
      setIsMapOpen((isOpen) => {
        if (!isOpen) setRevealCycle((cycle) => cycle + 1);
        return !isOpen;
      });
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
          <span className="dns-map__toggle network-map__toggle" aria-hidden="true">⌄</span>
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
                return grouped.length ? <section key={label}><h3>{label}</h3><ol>{grouped.map((section) => <SectionItem key={section.id} section={section} lockedReturnTo={lockedReturnTo} />)}</ol></section> : null;
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
