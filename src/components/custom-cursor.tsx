"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

    const fxTo = gsap.quickTo(follower, "x", { duration: 0.6, ease: "power3" });
    const fyTo = gsap.quickTo(follower, "y", { duration: 0.6, ease: "power3" });

    const onMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      xTo(e.clientX);
      yTo(e.clientY);
      fxTo(e.clientX);
      fyTo(e.clientY);

      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, [role="button"], [data-cursor="drag"]');
      const isDragTarget = target.closest('[data-cursor="drag"]');

      setIsPointer(!!isClickable);
      setIsDragging(!!isDragTarget);
    };

    const onMouseDown = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        ref={cursorRef}
        style={{
          position: "absolute",
          width: "8px",
          height: "8px",
          backgroundColor: "var(--cursor-color, #000)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          mixBlendMode: "difference",
          zIndex: 10,
        }}
      />
      <div
        ref={followerRef}
        style={{
          position: "absolute",
          width: isPointer ? "40px" : "20px",
          height: isPointer ? "40px" : "20px",
          border: "1px solid var(--cursor-color, #000)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          transition: "width 0.3s ease, height 0.3s ease, background-color 0.3s ease",
          backgroundColor: isDragging ? "rgba(0,0,0,0.1)" : "transparent",
          mixBlendMode: "difference",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDragging && (
          <span style={{ fontSize: "8px", fontWeight: "bold", color: "#fff", letterSpacing: "0.05em" }}>DRAG</span>
        )}
      </div>
    </div>
  );
}
