"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

interface ScrapProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  initialPos?: { x: string | number; y: string | number; rotate: number };
  type?: "paper" | "blueprint" | "polaroid" | "sticker" | "pill";
  tape?: boolean;
}

export const Scrap = ({
  children,
  className,
  style,
  initialPos,
  type = "paper",
  tape = false,
}: ScrapProps) => {
  const scrapRef = useRef<HTMLDivElement>(null);
  const [zIndex, setZIndex] = useState(100);

  useEffect(() => {
    if (!scrapRef.current) return;

    // Set initial state — centered on position coordinate
    gsap.set(scrapRef.current, {
      left: initialPos?.x ?? "50%",
      top: initialPos?.y ?? "50%",
      xPercent: -50,
      yPercent: -50,
      rotate: initialPos?.rotate ?? 0,
      opacity: 0,
      scale: 0.75,
    });

    // Staggered entrance
    gsap.to(scrapRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      ease: "back.out(1.7)",
      delay: 0.3 + Math.random() * 0.6,
    });

    const draggable = Draggable.create(scrapRef.current, {
      type: "x,y",
      edgeResistance: 0.65,
      onDragStart: function () {
        setZIndex(1000);
        gsap.to(this.target, {
          scale: 1.08,
          rotate: (initialPos?.rotate ?? 0) + (Math.random() > 0.5 ? 3 : -3),
          duration: 0.15,
          boxShadow: "0 24px 48px -8px rgba(0,0,0,0.25)",
        });
      },
      onDragEnd: function () {
        setZIndex(200);
        gsap.to(this.target, {
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.4)",
          boxShadow: "",
        });
      },
    })[0];

    return () => {
      draggable.kill();
    };
  }, []); // Only on mount

  return (
    <div
      ref={scrapRef}
      style={{ zIndex, ...style }}
      className={cn(
        "scrap-item absolute select-none",
        type === "paper" &&
          "bg-white p-5 shadow-lg rounded-lg border border-ink/5",
        type === "sticker" &&
          "bg-white p-3 rounded-3xl sticker-shadow border border-white/60",
        type === "pill" &&
          "bg-petal/12 backdrop-blur-sm px-5 py-2 rounded-full border border-petal/20 text-[11px] font-black uppercase tracking-[0.2em] text-petal sticker-shadow",
        type === "polaroid" && "bg-white p-3 pb-10 shadow-2xl rounded-sm",
        className
      )}
    >
      {tape && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-16 bg-petal/20 backdrop-blur-[2px] -rotate-2 pointer-events-none mix-blend-multiply"
          style={{ clipPath: "polygon(2% 0%, 98% 2%, 96% 98%, 4% 95%)" }}
        />
      )}
      {children}
    </div>
  );
};
