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
  const [isMobile,   setIsMobile]   = useState(false);

  const { x: initX, y: initY, rotate: initRotate } = initialPos;

  const toNum = (v: string | number, total: number) =>
    typeof v === "string" && v.endsWith("%")
      ? (parseFloat(v) / 100) * total
      : Number(v);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Setup Effect
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!isMobile) {
      gsap.set(el, {
        x: toNum(initX, vw),
        y: toNum(initY, vh),
        rotate: initRotate ?? 0,
        opacity: 0,
        scale: 0.6,
        position: "absolute",
      });

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
    } else {
      gsap.set(el, {
        x: 0,
        y: 0,
        rotate: (initRotate ?? 0) * 0.5,
        opacity: 0,
        scale: 0.8,
        position: "relative",
        margin: "1rem auto",
      });
    }

    return () => {
      const draggables = Draggable.get(el);
      if (draggables) {
        if (Array.isArray(draggables)) draggables.forEach(d => d.kill());
        else draggables.kill();
      }
    };
  }, [isMobile, initX, initY, initRotate]);

  // Visibility Effect
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;

    if (isVisible) {
      const entryDelay = 0.15 + Math.random() * 0.5;
      gsap.to(el, {
        opacity: 1,
        scale: isMobile ? 0.8 : 1,
        duration: 0.65,
        ease: "back.out(1.7)",
        delay: entryDelay,
        pointerEvents: "auto",
      });
    } else {
      setHovered(false);
      gsap.to(el, {
        opacity: 0,
        scale: isMobile ? 0.6 : 0.6,
        duration: 0.25,
        ease: "power2.out",
        pointerEvents: "none",
      });
    }
  }, [isVisible, isMobile]);

  const showPanel = hovered && !isDragging;

  return (
    <div
      ref={wrapRef}
      className={`logo-scrap ${isMobile ? "mx-auto block" : "absolute"}`}
      data-cursor={isMobile ? undefined : "drag"}
      style={{ 
        zIndex: hovered && !isDragging ? 100 : zIndex, 
        cursor: isMobile ? "default" : "grab",
        opacity: 0,
        width: isMobile ? "fit-content" : "auto",
        pointerEvents: "none",
      }}
      onMouseEnter={() => !isDragging && !isMobile && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => isMobile && setHovered(!hovered)}
    >
      <div ref={innerRef} style={{ position: "relative" }}>
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          draggable={false}
          className="select-none scrap-image"
          style={{
            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))",
            objectFit: "contain",
          }}
        />
        <ScrapTooltip tooltip={tooltip} isVisible={showPanel} tooltipDir={tooltipDir} />
      </div>
    </div>
  );
}
