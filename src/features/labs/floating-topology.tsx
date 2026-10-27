"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const DOCK_OFFSET_PX = 72;
const TRANSITION_MS = 320;
const MINI_MAX_WIDTH_PX = 300;
const MINI_MIN_WIDTH_PX = 160;

type NaturalSize = { width: number; height: number };
type MiniSize = { width: number; height: number; scale: number };

function reducedMotionPreferred() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function FloatingTopology({ children, className }: { children: ReactNode; className?: string }) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const naturalSizeRef = useRef<NaturalSize | null>(null);
  const dockedRef = useRef(false);
  const [docked, setDocked] = useState(false);
  const [miniSize, setMiniSize] = useState<MiniSize | null>(null);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    const box = boxRef.current;
    if (!placeholder || !box) return;

    function measureNatural() {
      if (dockedRef.current || !box) return;
      naturalSizeRef.current = { width: box.offsetWidth, height: box.offsetHeight };
    }
    measureNatural();
    const resizeObserver = new ResizeObserver(measureNatural);
    resizeObserver.observe(box);

    function computeMiniSize(): MiniSize | null {
      const natural = naturalSizeRef.current;
      if (!natural || natural.width === 0) return null;
      const width = Math.min(MINI_MAX_WIDTH_PX, Math.max(MINI_MIN_WIDTH_PX, window.innerWidth * 0.42));
      const scale = width / natural.width;
      return { width, height: natural.height * scale, scale };
    }

    function animateFlip(firstRect: DOMRect) {
      if (reducedMotionPreferred()) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = boxRef.current;
          if (!el) return;
          const lastRect = el.getBoundingClientRect();
          const dx = firstRect.left - lastRect.left;
          const dy = firstRect.top - lastRect.top;
          const sx = firstRect.width / lastRect.width;
          const sy = firstRect.height / lastRect.height;
          el.style.transition = "none";
          el.style.transformOrigin = "top left";
          el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
          el.getBoundingClientRect();
          requestAnimationFrame(() => {
            el.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
            el.style.transform = "none";
          });
        });
      });
    }

    function applyDock(next: boolean) {
      if (next === dockedRef.current || !boxRef.current) return;
      const firstRect = boxRef.current.getBoundingClientRect();
      dockedRef.current = next;
      setMiniSize(next ? computeMiniSize() : null);
      setDocked(next);
      animateFlip(firstRect);
    }

    const observer = new IntersectionObserver(
      ([entry]) => applyDock(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0, rootMargin: `-${DOCK_OFFSET_PX}px 0px 0px 0px` },
    );
    observer.observe(placeholder);

    function handleResize() {
      if (dockedRef.current) setMiniSize(computeMiniSize());
    }
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function backToFullSize() {
    placeholderRef.current?.scrollIntoView({ behavior: reducedMotionPreferred() ? "auto" : "smooth", block: "start" });
  }

  const natural = naturalSizeRef.current;

  return (
    <div
      ref={placeholderRef}
      className={className ? `floating-topology__placeholder ${className}` : "floating-topology__placeholder"}
      style={docked && natural ? { height: natural.height } : undefined}
    >
      <div
        ref={boxRef}
        className={docked ? "floating-topology__box floating-topology__box--docked" : "floating-topology__box"}
        style={docked && miniSize ? { width: miniSize.width, height: miniSize.height } : undefined}
      >
        {docked ? (
          <button type="button" className="floating-topology__back" onClick={backToFullSize}>
            Back to full size ↑
          </button>
        ) : null}
        <div
          className="floating-topology__scale-wrapper"
          style={docked && miniSize && natural ? { width: natural.width, height: natural.height, transform: `scale(${miniSize.scale})` } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
