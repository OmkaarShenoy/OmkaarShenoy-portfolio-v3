"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";

gsap.registerPlugin(Draggable);

import { ScrapTooltip, TooltipData } from "./scrap-tooltip";

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
      style={{ zIndex: hovered && !isDragging ? 100 : zIndex, cursor: "grab", opacity: 0 }}
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
        <ScrapTooltip tooltip={tooltip} tooltipDir={tooltipDir} isVisible={showPanel} />
      </div>
    </div>
  );
}
