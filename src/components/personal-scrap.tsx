"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";
import { ScrapTooltip, TooltipData } from "./scrap-tooltip";

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

  useEffect(() => {
    hrefRef.current = href;
  }, [href]);

  const toNum = (v: string | number, total: number) =>
    typeof v === "string" && v.endsWith("%")
      ? (parseFloat(v) / 100) * total
      : Number(v);

  useEffect(() => {
    if (!wrapRef.current) return;

    const el = wrapRef.current;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    gsap.set(el, {
      x: toNum(initialPos.x, vw),
      y: toNum(initialPos.y, vh),
      rotate: initialPos.rotate ?? 0,
      opacity: 0,
      scale: 0.8,
    });

    if (draggable) {
      Draggable.create(el, {
        type: "x,y",
        zIndexBoost: false,

        onClick() {
          if (hrefRef.current) {
            window.open(hrefRef.current, "_blank", "noopener,noreferrer");
          }
        },

        onDragStart() {
          setIsDragging(true);
          setZIndex(999);

          gsap.to(el, {
            scale: 1.04,
            duration: 0.15,
          });
        },

        onDragEnd() {
          setIsDragging(false);
          setZIndex(20);

          gsap.to(el, {
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)",
          });
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!wrapRef.current) return;

    const el = wrapRef.current;

    if (isVisible) {
      gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.1 + Math.random() * 0.4,
        ease: "power3.out",
      });

      gsap.set(el, { pointerEvents: "auto" });
    } else {
      gsap.to(el, {
        opacity: 0,
        scale: 0.9,
        duration: 0.35,
        ease: "power2.out",
      });

      gsap.set(el, { pointerEvents: "none" });
    }
  }, [isVisible]);

  useEffect(() => {
    if (!innerRef.current || isDragging) return;

    gsap.to(innerRef.current, {
      y: hovered ? -3 : 0,
      scale: hovered ? 1.02 : 1,
      rotate: hovered
        ? (initialPos.rotate ?? 0) - 1
        : initialPos.rotate ?? 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [hovered, isDragging]);

  const background = "#fafafa";
  const boxShadow = "0 8px 18px rgba(0,0,0,0.12)";

  return (
    <div
      ref={wrapRef}
      className="absolute"
      style={{
        zIndex: hovered && !isDragging ? 100 : zIndex,
        opacity: 0,
        cursor: draggable
          ? isDragging
            ? "grabbing"
            : "grab"
          : "default",
      }}
      onMouseEnter={() => !isDragging && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={innerRef}
        style={{
          position: "relative",
          transition: "filter 0.3s ease",
          filter: hovered
            ? "drop-shadow(0 15px 20px rgba(0,0,0,0.18))"
            : "drop-shadow(0 6px 10px rgba(0,0,0,0.12))",
        }}
      >
        {/* CUTOUT */}
        {type === "cutout" && src && (
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
              transform: hovered ? "scale(1.1) rotate(2deg)" : "scale(1)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        )}

        {/* POLAROID */}
        {type === "polaroid" && (
          <div
            style={{
              width: size,
              background,
              padding: "10px 10px 34px 10px",
              borderRadius: "2px",
              boxShadow,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: size * 0.85,
                overflow: "hidden",
                background: "#ddd",
              }}
            >
              {src && (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  draggable={false}
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* TOOLTIP */}
        {tooltip && (
          <ScrapTooltip tooltip={tooltip} tooltipDir={tooltipDir} isVisible={hovered && !isDragging} href={href} />
        )}
      </div>
    </div>
  );
}