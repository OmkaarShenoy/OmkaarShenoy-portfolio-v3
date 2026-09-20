"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowsClockwise, MapPin } from "@phosphor-icons/react";
import posthog from "posthog-js";

interface AsciiBackgroundProps {
  images?: string[];
}

const parseBackgroundInfo = (path: string) => {
  const filename = path.split('/').pop()?.split('.')[0] || "";
  let parts = filename.split(/[_-]{2,}/);

  // If the first part is just a number (e.g. 01--Location), strip it for the display
  if (parts.length > 0 && /^\d+$/.test(parts[0])) {
    parts = parts.slice(1);
  }

  let location = "";
  let date = "";

  if (parts.length >= 2) {
    // Format: Location--Date or Location--Sublocation--Date
    location = `${parts[0].replace(/[_-]/g, ' ')}${parts[1] && !parts[1].match(/^\d/) ? `, ${parts[1].replace(/[_-]/g, ' ')}` : ""}`;
    date = parts.slice(parts[1] && !parts[1].match(/^\d/) ? 2 : 1).join('/').replace(/[\.-]/g, '/');
  } else if (parts.length === 1) {
    location = parts[0].replace(/[_-]/g, ' ');
  }

  return {
    location: location.replace(/\b\w/g, l => l.toUpperCase()),
    date
  };
};

// Algorithm from: https://github.com/jpetitcolas/ascii-art-converter (90+ stars, battle-tested)
// Proven open-source conversion algorithm - no custom code
const convertMediaToAscii = (
  media: HTMLImageElement | HTMLVideoElement,
  cols: number,
  options?: { charRatio?: number; rows?: number }
): string => {
  const charRatio = options?.charRatio ?? 0.5;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false }); // Optimization
  if (!ctx) return "";

  // Get source dimensions
  const sourceWidth = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
  const sourceHeight = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;

  if (sourceWidth === 0 || sourceHeight === 0) return "";

  // Calculate dimensions
  const scale = cols / sourceWidth;
  const derivedRows = Math.ceil(sourceHeight * scale * charRatio);
  const rows = Math.max(1, Math.floor(options?.rows ?? derivedRows));

  canvas.width = cols;
  canvas.height = rows;

  // Draw and sample (stretching to fit as requested)
  ctx.drawImage(media, 0, 0, cols, rows);
  const imageData = ctx.getImageData(0, 0, cols, rows);
  const data = imageData.data;

  // ASCII character ramp (high to low contrast)
  const chars = "@%#*+=-:. ";

  // Pre-allocate array for significantly faster generation in Safari
  const pixelCount = data.length / 4;
  const asciiArr = new Array(pixelCount + rows);
  let outIdx = 0;

  for (let i = 0; i < data.length; i += 4) {
    // Calculate luminance using standard formula
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Map luminance to character. A quick levels pass first: crush the blacks,
    // lift the midtones so the trees/slope separate instead of going muddy.
    const lum = luminance / 255;
    const black = 0.06;
    const white = 0.96;
    const clamped = Math.min(1, Math.max(0, (lum - black) / (white - black)));
    const leveled = Math.pow(clamped, 0.85);
    const charIndex = Math.floor(leveled * (chars.length - 1));
    asciiArr[outIdx++] = chars[charIndex];

    // Newline after each row
    if ((i / 4 + 1) % cols === 0) asciiArr[outIdx++] = "\n";
  }

  return asciiArr.join("");
};

export default function AsciiBackground({ images = [] }: AsciiBackgroundProps) {
  // Fallback if no images provided
  const backgroundList = images;

  const shuffle = (arr: number[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const [ascii, setAscii] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [lineHeight, setLineHeight] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Viewport-space rectangle (0..1 fractions) of the hero text block; the
  // ASCII is masked out behind it so text reads against clean page background.
  const [heroBox, setHeroBox] = useState<{ x0: number; x1: number; y0: number; y1: number } | null>(null);
  const [scaleW, setScaleW] = useState(1);
  const [scaleH, setScaleH] = useState(1);
  const [bgIndex, setBgIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState(backgroundList[0]);
  const [isChanging, setIsChanging] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const colsRef = useRef<number>(120);
  const rowsRef = useRef<number>(60); // Store rows for video loop
  const resizeTimer = useRef<number | null>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameTsRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  // Random-order rotation with no early repeats: we cycle through a shuffled
  // permutation of every image. Recently-shown images are parked at the end of
  // the next shuffle so nothing can resurface before a healthy batch of others
  // has been displayed (and typically only once the full set has rotated).
  const REFILL_GUARD = 6;
  const shuffleBagRef = useRef<number[]>([]);
  const recentShownRef = useRef<number[]>([]);

  const refillShuffleBag = (n: number) => {
    const pool = Array.from({ length: n }, (_, i) => i).filter(
      (i) => !recentShownRef.current.includes(i)
    );
    // recent images go to the FRONT so they pop LAST in the new cycle
    shuffleBagRef.current = [...recentShownRef.current, ...shuffle(pool)];
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header");
      if (!header) return;
      const els = header.querySelectorAll(".luxury-text, .luxury-subtext");
      if (els.length === 0) return;
      let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
      els.forEach((el) => {
        const b = el.getBoundingClientRect();
        left = Math.min(left, b.left);
        top = Math.min(top, b.top);
        right = Math.max(right, b.right);
        bottom = Math.max(bottom, b.bottom);
      });
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const padX = vw * 0.04;
      const padTop = vh * 0.02;
      const padBot = vh * 0.06;
      setHeroBox({
        x0: Math.max(0, (left - padX) / vw),
        x1: Math.min(1, (right + padX) / vw),
        y0: Math.max(0, (top - padTop) / vh),
        y1: Math.min(1, (bottom + padBot) / vh),
      });
    };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (isMobile || isVideoMode) return;
    if (preRef.current && ascii) {
      const w = preRef.current.offsetWidth;
      const h = preRef.current.offsetHeight;
      const container = document.getElementById("ascii-container");
      const cw = container ? container.clientWidth : window.innerWidth;
      const ch = container ? container.clientHeight : window.innerHeight;

      if (w > 0 && h > 0) {
        // Keep the photo as a large centered rectangle instead of covering the
        // full viewport, leaving a visible band of page background around it.
        // Height keeps the current inset (0.86); width is stretched wider (0.94).
        const coverX = cw / w;
        const coverY = ch / h;
        const targetW = coverX * 0.98;
        const targetH = coverY * 0.90;

        if (Math.abs(targetW - scaleW) > 0.01 || Math.abs(targetH - scaleH) > 0.01) {
          setScaleW(targetW);
          setScaleH(targetH);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ascii, fontSize, lineHeight, isMobile, isVideoMode, scaleW, scaleH]);

  useEffect(() => {
    const updateThemeState = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    updateThemeState();
    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const generate = (targetIndex: number, isRefresh = false) => {
    if (isMobile) return;
    const container = document.getElementById("ascii-container");
    const viewportWidth = container ? container.clientWidth : Math.max(1, window.innerWidth);
    const viewportHeight = container ? container.clientHeight : Math.max(1, window.innerHeight);
    const charWidthRatio = 0.6;
    const baseLineHeightRatio = 0.8;
    // Density: smaller targetCharWidth = finer grid = more photo detail while
    // staying readable as characters. ~2.8 keeps the mosaic clearly ASCII.
    const targetCharWidth = Math.max(1.7, Math.min(2.8, viewportWidth / 300));
    const baseCols = Math.max(60, Math.ceil(viewportWidth / targetCharWidth));

    // We calculate font size to exactly fit baseCols into viewport
    const fontSizeFromWidth = viewportWidth / baseCols / charWidthRatio;
    const baseLineHeight = fontSizeFromWidth * baseLineHeightRatio;

    // We calculate baseRows to exactly fit into viewport
    const baseRows = Math.max(60, Math.ceil(viewportHeight / baseLineHeight));
    const exactLineHeight = viewportHeight / baseRows;

    // Add 5% safety overscan
    const desiredCols = Math.ceil(baseCols * 1.05);
    const desiredRows = Math.ceil(baseRows * 1.05);
    colsRef.current = desiredCols;
    rowsRef.current = desiredRows;

    const targetUrl = backgroundList[targetIndex];
    const isVideo = /\.(mp4|webm|mov)$/i.test(targetUrl);
    setIsVideoMode(isVideo);

    // Cancel existing loop
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const swapDelay = isRefresh ? 800 : 0;

    if (isVideo) {
      const video = document.createElement("video");
      video.src = targetUrl;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      videoRef.current = video;

      video.onloadeddata = () => {
        video.play().catch(console.error);

        const renderLoop = (ts: number) => {
          if (videoRef.current === video) {
            // Cap conversion frequency to reduce CPU pressure on low-end devices and Safari.
            if (ts - lastFrameTsRef.current >= 83) {
              lastFrameTsRef.current = ts;
              if (!document.hidden) {
                const output = convertMediaToAscii(video, colsRef.current, { rows: rowsRef.current, charRatio: 0.5 });
                setAscii(output);
              }
            }
            rafRef.current = requestAnimationFrame(renderLoop);
          }
        };

        setTimeout(() => {
          setDisplayedImage(targetUrl);
          setFontSize(fontSizeFromWidth);
          setLineHeight(exactLineHeight);

          // Start the loop
          rafRef.current = requestAnimationFrame(renderLoop);

          setTimeout(() => {
            setIsChanging(false);
          }, 100);
        }, swapDelay);
      };
    } else {
      const img = new Image();
      img.src = targetUrl;
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const output = convertMediaToAscii(img, desiredCols, { rows: desiredRows, charRatio: 0.5 });

          setTimeout(() => {
            setAscii(output);
            setDisplayedImage(targetUrl);
            setFontSize(fontSizeFromWidth);
            setLineHeight(exactLineHeight);

            setTimeout(() => {
              setIsChanging(false);
            }, 100);
          }, swapDelay);
        } catch (error) {
          console.error("ASCII conversion failed:", error);
          setIsChanging(false);
        }
      };

      img.onerror = () => {
        console.error("Failed to load background image");
        setIsChanging(false);
      };
    }
  };

  // Initial load
  useEffect(() => {
    if (isMobile) return;
    if (backgroundList.length > 0) {
      const initialIndex = Math.floor(Math.random() * backgroundList.length);
      recentShownRef.current = [initialIndex];
      shuffleBagRef.current = [];
      setBgIndex(initialIndex);
      setDisplayedImage(backgroundList[initialIndex]);
      generate(initialIndex, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundList]);

  useEffect(() => {
    if (isMobile) return;
    const onResize = () => {
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(() => {
        generate(bgIndex, false);
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer.current) {
        window.clearTimeout(resizeTimer.current);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgIndex]);

  const handleRefresh = () => {
    if (isChanging || backgroundList.length <= 1) return;
    setIsChanging(true);
    posthog.capture("ascii_background_refreshed");

    if (shuffleBagRef.current.length === 0) {
      // Full rotation done; build a fresh shuffled permutation.
      refillShuffleBag(backgroundList.length);
    }
    const nextIndex = shuffleBagRef.current.pop() as number;
    recentShownRef.current.push(nextIndex);
    if (recentShownRef.current.length > REFILL_GUARD) {
      recentShownRef.current.shift();
    }

    setBgIndex(nextIndex);
    generate(nextIndex, true);
  };

  if (isMobile) return null;

  const info = parseBackgroundInfo(displayedImage);

const photoFilter = isDarkMode
    ? "invert(1) hue-rotate(180deg) contrast(1.1) saturate(1.6)"
    : "saturate(3) contrast(1)";

  const featherMask =
    "linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%), " +
    "linear-gradient(to bottom, transparent 0%, #000 4%, #000 96%, transparent 100%)";

  // Carve-out: mask the ASCII away behind the hero text block so the text sits
  // on clean page background. Intersecting one horizontal and one vertical
  // gradient leaves a soft-edged rectangular "hole" in the viewport space.
  const carveMask: CSSProperties | null =
    !isDarkMode || !heroBox
      ? null
      : (() => {
          const { x0, x1, y0, y1 } = heroBox;
          const l0 = Math.max(0, x0 - 0.06);
          const r1 = Math.min(1, x1 + 0.06);
          const t0 = Math.max(0, y0 - 0.06);
          const b1 = Math.min(1, y1 + 0.06);
          const horiz =
            `linear-gradient(to right, #000 0%, #000 ${l0.toFixed(4)}%, ` +
            `rgba(0,0,0,0) ${x0.toFixed(4)}%, rgba(0,0,0,0) ${x1.toFixed(4)}%, ` +
            `#000 ${r1.toFixed(4)}%, #000 100%)`;
          const vert =
            `linear-gradient(to bottom, #000 0%, #000 ${t0.toFixed(4)}%, ` +
            `rgba(0,0,0,0) ${y0.toFixed(4)}%, rgba(0,0,0,0) ${y1.toFixed(4)}%, ` +
            `#000 ${b1.toFixed(4)}%, #000 100%)`;
          return {
            WebkitMaskImage: `${horiz}, ${vert}`,
            maskImage: `${horiz}, ${vert}`,
            WebkitMaskComposite: "intersect",
            maskComposite: "intersect",
          };
        })();

  const preBase: CSSProperties = {
    margin: 0,
    padding: 0,
    width: "max-content",
    height: "max-content",
    fontSize: `${fontSize}px`,
    lineHeight: `${lineHeight}px`,
    fontWeight: 800,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
    whiteSpace: "pre",
    display: "block",
    textAlign: "left",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate3d(-50%, -50%, 0) scale(${scaleW}, ${scaleH})`,
    maxWidth: "none",
    maxHeight: "none",
    overflow: "hidden",
    textRendering: "optimizeSpeed",
    pointerEvents: "none",

    // Feathered transparency mask around the rectangle's perimeter so the
    // photo dissolves into the page background instead of a hard boundary.
    WebkitMaskImage: featherMask,
    maskImage: featherMask,
    WebkitMaskComposite: "intersect",
    maskComposite: "intersect",

    backgroundImage: `url('${displayedImage}')`,
    backgroundSize: "100% 100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
  };

  return (
    <div className="ascii-bg" aria-hidden>
      <button
        className="animate-on-load"
        onClick={handleRefresh}
        title="Change Background"
        disabled={isChanging}
        style={{
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 100000,
          background: "transparent",
          border: "none",
          padding: "0.5rem",
          cursor: isChanging ? "wait" : "pointer",
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          transition: "color 0.2s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: "auto",
        }}
        onMouseEnter={(e) => {
          if (!isChanging) {
            e.currentTarget.style.color = isDarkMode ? "#FFFFFF" : "#000000";
            e.currentTarget.style.transform = "rotate(90deg)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isChanging) {
            e.currentTarget.style.color = isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)";
            e.currentTarget.style.transform = "rotate(0deg)";
          }
        }}
      >
        <div style={{
          animation: isChanging ? "spin 1s linear infinite" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <ArrowsClockwise size={18} weight="bold" />
        </div>

      </button>

      <div
        id="ascii-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: -1, // Force to the absolute bottom
          ...(carveMask ?? {}),
        }}
      >
        <pre
          ref={preRef}
          style={{
            ...preBase,
            color: "transparent",
            opacity: isChanging ? 0 : (isDarkMode ? 0.55 : 1.0),
            filter: photoFilter,
            textShadow: isDarkMode ? "0 0 2px rgba(255, 255, 255, 0.2)" : "0 0 1px rgba(255, 255, 255, 0.5)",
            transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {ascii}
        </pre>

        {/* Bloom: blurred duplicate blended with screen so bright glyphs glow */}
        {!isDarkMode && (
          <pre
            aria-hidden
            style={{
              ...preBase,
              color: "transparent",
              mixBlendMode: "screen",
              opacity: isChanging ? 0 : 0.5,
              filter: `${photoFilter} blur(8px)`,
              textShadow: "none",
              transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {ascii}
          </pre>
        )}
      </div>

      <div className="animate-on-load" style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 1000, // Safe high z-index
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        color: isDarkMode ? "#ffffff" : "#000000",
        fontFamily: "var(--font-instrument), serif",
        pointerEvents: "none",
        opacity: isChanging ? 0 : 1,
        transition: "opacity 1s ease"
      }}>
        <MapPin size={14} weight="fill" style={{ opacity: 1 }} />
        <span style={{ fontSize: "1rem", fontStyle: "italic", opacity: 1, fontWeight: 600 }}>
          {info.location}
        </span>
        {info.date && (
          <span style={{
            fontSize: "0.9rem",
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 800,
            color: "#ff5733", // Digital camera orange
            letterSpacing: "0.08em",
            marginLeft: "0.5rem",
            textShadow: "0 0 1px rgba(255, 87, 51, 0.4), 0 0 3px rgba(255, 87, 51, 0.2)",
            opacity: 1
          }}>
            {info.date}
          </span>
        )}
      </div>
    </div>
  );
}