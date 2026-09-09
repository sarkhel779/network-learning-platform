export function focusLessonAnchor(anchor: string) {
  const target = document.getElementById(anchor);
  if (!target) return false;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  target.scrollIntoView?.({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  return true;
}
