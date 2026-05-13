"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const dragTextRef = useRef<HTMLSpanElement>(null);
  const isPointerRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    const dragText = dragTextRef.current;
    if (!container || !cursor || !follower || !dragText) return;

    document.body.classList.add("custom-cursor-enabled");

    container.style.opacity = "0";
    follower.style.width = "20px";
    follower.style.height = "20px";
    follower.style.backgroundColor = "transparent";
    dragText.style.display = "none";

    let latestX = 0;
    let latestY = 0;
    let followerX = 0;
    let followerY = 0;
    let cursorFrame = 0;
    let followerFrame = 0;

    const renderCursor = () => {
      cursor.style.transform = `translate3d(${latestX}px, ${latestY}px, 0) translate(-50%, -50%)`;
      cursorFrame = 0;
    };

    const renderFollower = () => {
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      followerFrame = 0;
    };

    const onMouseMove = (e: MouseEvent | PointerEvent) => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        container.style.opacity = "1";
      }

      latestX = e.clientX;
      latestY = e.clientY;
      if (!cursorFrame) {
        cursorFrame = window.requestAnimationFrame(renderCursor);
      }

      followerX += (e.clientX - followerX) * 0.18;
      followerY += (e.clientY - followerY) * 0.18;
      if (!followerFrame) {
        followerFrame = window.requestAnimationFrame(function tick() {
          followerX += (latestX - followerX) * 0.18;
          followerY += (latestY - followerY) * 0.18;
          renderFollower();

          if (Math.abs(latestX - followerX) > 0.5 || Math.abs(latestY - followerY) > 0.5) {
            followerFrame = window.requestAnimationFrame(tick);
          }
        });
      }

      const target = e.target as HTMLElement;
      const isClickable = target.closest('a, button, [role="button"], [data-cursor="drag"]');
      const isDragTarget = target.closest('[data-cursor="drag"]');

      const nextPointer = !!isClickable;
      const nextDragging = !!isDragTarget;

      if (nextPointer !== isPointerRef.current || nextDragging !== isDraggingRef.current) {
        isPointerRef.current = nextPointer;
        isDraggingRef.current = nextDragging;

        follower.style.width = nextPointer ? "40px" : "20px";
        follower.style.height = nextPointer ? "40px" : "20px";
        follower.style.backgroundColor = nextDragging ? "rgba(255,255,255,0.1)" : "transparent";

        dragText.style.display = nextDragging ? "block" : "none";
      }
    };

    const onMouseDown = () => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        container.style.opacity = "1";
      }
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      container.style.opacity = "0";
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        onMouseLeave();
      }
    };

    window.addEventListener("pointermove", onMouseMove, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("blur", onMouseLeave);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.body.classList.remove("custom-cursor-enabled");
      window.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("blur", onMouseLeave);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (cursorFrame) window.cancelAnimationFrame(cursorFrame);
      if (followerFrame) window.cancelAnimationFrame(followerFrame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0,
        transition: "opacity 0.15s ease",
      }}
    >
      <div
        ref={cursorRef}
        style={{
          position: "absolute",
          width: "8px",
          height: "8px",
          backgroundColor: "var(--cursor-color, #fff)",
          borderRadius: "50%",
          transform: "translate3d(0, 0, 0) translate(-50%, -50%)",
          left: 0,
          top: 0,
          mixBlendMode: "difference",
          zIndex: 10,
          willChange: "transform",
        }}
      />
      <div
        ref={followerRef}
        style={{
          position: "absolute",
          width: "20px",
          height: "20px",
          border: "1px solid var(--cursor-color, #fff)",
          borderRadius: "50%",
          transform: "translate3d(0, 0, 0) translate(-50%, -50%)",
          left: 0,
          top: 0,
          transition: "width 0.18s ease, height 0.18s ease, background-color 0.18s ease, border-color 0.18s ease",
          backgroundColor: "transparent",
          mixBlendMode: "difference",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform, width, height",
        }}
      >
        <span
          ref={dragTextRef}
          style={{ fontSize: "8px", fontWeight: "bold", color: "#fff", letterSpacing: "0.05em", display: "none" }}
        >
          DRAG
        </span>
      </div>
    </div>
  );
}
