"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";

type WorkspaceDrawerProps = Readonly<{
  open: boolean;
  title: string;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  presentation?: "side" | "bottom";
}>;

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

export function WorkspaceDrawer({
  open,
  title,
  triggerRef,
  onClose,
  children,
  presentation = "side",
}: WorkspaceDrawerProps) {
  const headingId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const close = useCallback(() => {
    onClose();
    queueMicrotask(() => triggerRef.current?.focus());
  }, [onClose, triggerRef]);

  useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    headingRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !drawer) return;

      const controls = Array.from(
        drawer.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const first = headingRef.current;
      const last = controls.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close, open]);

  if (!open) return null;

  return (
    <div className={`workspace-overlay workspace-overlay--${presentation} course-contents-overlay`}>
      <button
        aria-label={`Dismiss ${title}`}
        className="workspace-backdrop course-contents-backdrop"
        onClick={close}
        type="button"
      />
      <div
        aria-labelledby={headingId}
        aria-modal="true"
        className="workspace-drawer course-contents-drawer"
        ref={drawerRef}
        role="dialog"
      >
        <div className="workspace-drawer__header course-contents-drawer__header">
          <h2 id={headingId} ref={headingRef} tabIndex={-1}>{title}</h2>
          <button onClick={close} type="button">Close {title}</button>
        </div>
        <div className="workspace-drawer__body">{children}</div>
      </div>
    </div>
  );
}
