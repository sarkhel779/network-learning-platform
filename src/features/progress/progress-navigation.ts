const STICKY_DIAGRAM_GAP_PX = 16;

function stickyDiagramReservedHeight(target: HTMLElement): number {
  const stickyDiagram = target.closest(".sample-lab")?.querySelector<HTMLElement>(".labs-sticky-diagram");
  if (!stickyDiagram) return 0;

  const stickyTop = Number.parseFloat(getComputedStyle(stickyDiagram).top) || 0;
  return stickyDiagram.getBoundingClientRect().height + stickyTop + STICKY_DIAGRAM_GAP_PX;
}

export function focusLessonAnchor(anchor: string) {
  const target = document.getElementById(anchor);
  if (!target) return false;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const behavior = reducedMotion ? "auto" : "smooth";

  const reserved = stickyDiagramReservedHeight(target);
  if (reserved > 0) {
    const delta = target.getBoundingClientRect().top - reserved;
    window.scrollBy({ top: delta, behavior });
  } else {
    target.scrollIntoView?.({ behavior, block: "start" });
  }
  return true;
}
