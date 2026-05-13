"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";
import { ScrapTooltip, TooltipData } from "./scrap-tooltip";
import posthog from "posthog-js";

gsap.registerPlugin(Draggable);

export type ScrapType = "polaroid" | "cutout";

interface PersonalScrapProps {
  src?: string;
  alt?: string;
  type?: ScrapType;
  initialPos: {
    x: string | number;
    y: string | number;
    rotate?: number;
  };
  size?: number;
  isVisible?: boolean;
  tooltip?: TooltipData;
  tooltipDir?: "right" | "left";
  draggable?: boolean;
  href?: string;
}

export function PersonalScrap({
  src,
  alt = "Personal artifact",
  type = "polaroid",
  initialPos,
  size = 180,
  isVisible = true,
  tooltip,
  tooltipDir = "right",
  draggable = true,
  href,
}: PersonalScrapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const hrefRef = useRef(href);

  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zIndex, setZIndex] = useState(20);
  const [isMobile, setIsMobile] = useState(false);

  const { x: initX, y: initY, rotate: initRotate } = initialPos;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    hrefRef.current = href;
  }, [href]);

  const toNum = (v: string | number, total: number) =>
    typeof v === "string" && v.endsWith("%")
      ? (parseFloat(v) / 100) * total
      : Number(v);

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
        scale: 0.8,
        position: "absolute",
      });

      if (draggable) {
        Draggable.create(el, {
          type: "x,y",
          zIndexBoost: false,
          onClick() {
            posthog.capture("personal_scrap_clicked", { href: hrefRef.current, alt });
            if (hrefRef.current) {
              window.open(hrefRef.current, "_blank", "noopener,noreferrer");
            }
          },
          onDragStart() {
            posthog.capture("personal_scrap_dragged", { alt });
            setIsDragging(true);
            setZIndex(999);
            gsap.to(el, { scale: 1.04, duration: 0.15 });
          },
          onDragEnd() {
            setIsDragging(false);
            setZIndex(20);
            gsap.to(el, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
          },
        });
      }
    } else {
      gsap.set(el, {
        x: 0,
        y: 0,
        rotate: (initRotate ?? 0) * 0.5,
        opacity: 0,
        scale: 0.7,
        position: "relative",
        margin: "1.5rem auto",
      });
    }

    return () => {
      const draggables = Draggable.get(el);
      if (draggables) {
        if (Array.isArray(draggables)) draggables.forEach(d => d.kill());
        else draggables.kill();
      }
    };
  }, [isMobile, initX, initY, initRotate, draggable]);

  // Visibility Effect
  useEffect(() => {
    if (!wrapRef.current) return;
    const el = wrapRef.current;

    if (isVisible) {
      gsap.to(el, {
        opacity: 1,
        scale: isMobile ? 0.7 : 1,
        duration: 0.8,
        delay: 0.1 + Math.random() * 0.4,
        ease: "power3.out",
        pointerEvents: "auto",
      });
    } else {
      gsap.to(el, {
        opacity: 0,
        scale: isMobile ? 0.6 : 0.9,
        duration: 0.35,
        ease: "power2.out",
        pointerEvents: "none",
      });
    }
  }, [isVisible, isMobile]);

  const showPanel = !!(tooltip && hovered && !isDragging);

  return (
    <div
      ref={wrapRef}
      className={`personal-scrap ${isMobile ? "mx-auto block" : "absolute"}`}
      data-cursor={isMobile ? undefined : href ? "click" : "drag"}
      style={{ 
        zIndex: showPanel ? 100 : zIndex,
        cursor: isMobile ? "default" : isDragging ? "grabbing" : "grab",
        opacity: 0,
        width: isMobile ? "fit-content" : "auto",
        pointerEvents: "none",
      }}
      onMouseEnter={() => !isDragging && !isMobile && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (isMobile) {
          setHovered(!hovered);
          posthog.capture("personal_scrap_clicked", { href: hrefRef.current, alt, hovered: !hovered });
        }
      }}
    >
      <div ref={innerRef} style={{ position: "relative" }}>
        {type === "polaroid" ? (
          <div className="polaroid-frame" style={{
            background: "#fdfdfd",
            padding: "8px 8px 35px 8px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            width: size,
            transform: `rotate(${initRotate ?? 0}deg)`,
          }}>
            <div style={{ width: "100%", height: size * 0.9, position: "relative", overflow: "hidden", background: "#eee" }}>
              {src && (
                <Image
                  src={src}
                  alt={alt}
                  width={size}
                  height={Math.max(1, Math.floor(size * 0.9))}
                  className="object-cover select-none"
                  draggable={false}
                  style={{ objectFit: "cover", width: "100%", height: "auto" }}
                />
              )}
            </div>
          </div>
        ) : (
          <div style={{ width: size, height: size, position: "relative" }}>
            {src && (
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="select-none scrap-image"
                draggable={false}
                style={{ filter: "drop-shadow(2px 4px 10px rgba(0,0,0,0.3))", objectFit: "contain" }}
              />
            )}
          </div>
        )}

        {tooltip && <ScrapTooltip tooltip={tooltip} isVisible={showPanel} tooltipDir={tooltipDir} />}
      </div>
    </div>
  );
}