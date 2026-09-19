"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const STORAGE_KEY = "wider-screen-banner-dismissed";

const bannerStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.625rem 1rem",
  fontSize: "0.85rem",
  fontWeight: 500,
  letterSpacing: "0.01em",
  textTransform: "lowercase",
  fontFamily: "var(--font-luxury)",
  color: "var(--ascii-color)",
  background: "color-mix(in srgb, var(--background) 80%, transparent)",
  borderTop: "1px solid var(--ascii-color)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

export default function WiderScreenBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useLayoutEffect(() => {
    let stored = false;
    try {
      stored = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // ignore
    }
    if (stored) {
      setDismissed(true);
      return;
    }

    if (window.innerWidth >= 768 || !ref.current) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setOpen(true);
      return;
    }

    setOpen(true);
    gsap.killTweensOf(ref.current);
    const tween = gsap.fromTo(
      ref.current,
      { yPercent: 100 },
      { yPercent: 0, duration: 0.7, ease: "power3.out", delay: 1.5 }
    );
    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("wider-screen-banner-pad");
    return () => document.body.classList.remove("wider-screen-banner-pad");
  }, [open]);

  if (dismissed) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
    if (!ref.current) return setDismissed(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return setDismissed(true);
    gsap.to(ref.current, {
      yPercent: 100,
      duration: 0.5,
      ease: "power3.in",
      onComplete: () => setDismissed(true),
    });
  };

  return (
    <div
      ref={ref}
      role="status"
      className="md:hidden max-md:flex"
      style={bannerStyle}
    >
      <span className="truncate">
        View on a wider screen for the full experience
      </span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0"
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontFamily: "var(--font-luxury)",
          fontSize: "1.1rem",
          lineHeight: 1,
          padding: "0.125rem 0.25rem",
          opacity: 0.85,
          textTransform: "none",
        }}
      >
        ×
      </button>
    </div>
  );
}