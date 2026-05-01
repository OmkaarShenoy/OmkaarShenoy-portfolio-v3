"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";

gsap.registerPlugin(Draggable);

interface TooltipData {
  category?: string;
  title: string;
  sub?: string;
  period?: string;
  tags?: string[];
  stat?: string;
  statLabel?: string;
}

interface LogoScrapProps {
  src: string;
  alt: string;
  tooltip: TooltipData;
  initialPos: { x: string | number; y: string | number; rotate?: number };
  size?: number;
  /** 'right' (default) or 'left' — which side the info panel slides out */
  tooltipDir?: "right" | "left";
  isVisible?: boolean;
}

export function LogoScrap({ src, alt, tooltip, initialPos, size = 60, tooltipDir = "right", isVisible = true }: LogoScrapProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<gsap.core.Tween | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const [zIndex,     setZIndex]     = useState(20);

  const toNum = (v: string | number, total: number) =>
    typeof v === "string" && v.endsWith("%")
      ? (parseFloat(v) / 100) * total
      : Number(v);

  /* Drift removed - stickers stay pinned */

  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    gsap.set(el, {
      x: toNum(initialPos.x, vw),
      y: toNum(initialPos.y, vh),
      rotate: initialPos.rotate ?? 0,
      opacity: isVisible ? 0 : 0,
      scale: isVisible ? 0.6 : 0.6,
    });

    if (!isVisible) {
      gsap.set(el, { pointerEvents: "none" });
    }

    Draggable.create(el, {
      type: "x,y",
      zIndexBoost: false,
      onDragStart() {
        setIsDragging(true);
        setHovered(false);
        setZIndex(999);
        gsap.to(el, { scale: 1.12, duration: 0.15 });
      },
      onDragEnd() {
        setIsDragging(false);
        setZIndex(20);
        gsap.to(el, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
      },
    });

    return () => {
      driftRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;

    if (isVisible) {
      const entryDelay = 0.15 + Math.random() * 0.5;
      gsap.set(el, { pointerEvents: "auto" });
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.65,
        ease: "back.out(1.7)",
        delay: entryDelay,
      });
    } else {
      setHovered(false);
      gsap.to(el, {
        opacity: 0,
        scale: 0.6,
        duration: 0.25,
        ease: "power2.out",
      });
      gsap.set(el, { pointerEvents: "none" });
    }
  }, [isVisible]);

  const showPanel = hovered && !isDragging;

  return (
    <div
      ref={wrapRef}
      className="logo-scrap absolute"
      style={{ zIndex, cursor: "grab", opacity: 0 }}
      onMouseEnter={() => !isDragging && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Inner wrapper carries the drift; Draggable owns the outer */}
      <div ref={innerRef} style={{ position: "relative" }}>

        {/* Pure cutout logo with stitch filter */}
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          priority={true}
          draggable={false}
          style={{
            objectFit: "contain",
            display: "block",
            filter: "url(#sticker-outline)",
            transition: "transform 0.2s",
            transform: showPanel ? "scale(1.1) rotate(2deg)" : "scale(1)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {/* Slide-out info panel */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            ...(tooltipDir === "right"
              ? { left: `calc(100% + 12px)` }
              : { right: `calc(100% + 12px)` }),
            transform: showPanel
              ? "translateY(-50%) translateX(0)"
              : tooltipDir === "right"
                ? "translateY(-50%) translateX(-10px)"
                : "translateY(-50%) translateX(10px)",
            opacity: showPanel ? 1 : 0,
            pointerEvents: "none",
            transition: "opacity 0.22s ease, transform 0.22s ease",
            zIndex: 200,
            minWidth: "175px",
            maxWidth: "230px",
          }}
        >
          <div style={{
            background: "#FFFFFF",
            border: "2px solid #111111",
            outline: "2px dotted #111111",
            outlineOffset: "-6px",
            borderRadius: "0.25rem",
            padding: "1rem 1.1rem",
            boxShadow: "3px 3px 0 rgba(255,255,255,0.15)",
          }}>
            {/* Category — small uppercase tag */}
            {tooltip.category && (
              <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.45rem", fontWeight: 800, color: "#888888", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.2em" }}>
                {tooltip.category}
              </div>
            )}
            {/* Title — Instrument Serif italic */}
            <div style={{ fontFamily: "var(--font-instrument), serif", fontWeight: 400, fontStyle: "italic", fontSize: "1.1rem", color: "#111111", letterSpacing: "0.01em", lineHeight: 1.15 }}>
              {tooltip.title}
            </div>
            {tooltip.sub && (
              <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.55rem", fontWeight: 700, color: "#555555", marginTop: "0.2rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                {tooltip.sub}
              </div>
            )}
            {tooltip.period && (
              <div style={{ fontFamily: "var(--font-jakarta)", fontSize: "0.5rem", fontWeight: 500, color: "#888888", marginTop: "0.1rem", letterSpacing: "0.05em" }}>
                {tooltip.period}
              </div>
            )}
            {tooltip.tags && tooltip.tags.length > 0 && (
              <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
                {tooltip.tags.map(t => (
                  <span key={t} style={{ border: "1px solid #DDDDDD", borderRadius: "2px", padding: "1px 4px", fontSize: "6.5px", fontWeight: 600, color: "#444444", fontFamily: "var(--font-jakarta)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            {tooltip.stat && (
              <div style={{ marginTop: "0.5rem", borderTop: "1px solid #EEEEEE", paddingTop: "0.4rem", display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
                <span style={{ fontFamily: "var(--font-instrument), serif", fontWeight: 400, fontStyle: "italic", fontSize: "1.25rem", color: "#111111", lineHeight: 1 }}>
                  {tooltip.stat}
                </span>
                {tooltip.statLabel && (
                  <span style={{ fontFamily: "var(--font-jakarta)", fontSize: "6.5px", fontWeight: 500, color: "#888888", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {tooltip.statLabel}
                  </span>
                )}
              </div>
            )}
            {/* Arrow */}
            <div style={{
              position: "absolute",
              top: "50%",
              ...(tooltipDir === "right"
                ? { left: "-4px", borderRight: "none", borderTop: "none" }
                : { right: "-4px", borderLeft: "none", borderBottom: "none" }),
              transform: "translateY(-50%) rotate(45deg)",
              width: "8px",
              height: "8px",
              background: "#FFFFFF",
              border: "2px solid #111111",
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
