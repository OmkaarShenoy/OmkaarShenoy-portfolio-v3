"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowsClockwise, MapPin } from "@phosphor-icons/react";

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
const convertImageToAscii = (
  image: HTMLImageElement,
  cols: number,
  options?: { charRatio?: number; rows?: number }
): string => {
  const charRatio = options?.charRatio ?? 0.5;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Calculate dimensions
  const scale = cols / image.naturalWidth;
  const derivedRows = Math.ceil(image.naturalHeight * scale * charRatio);
  const rows = Math.max(1, Math.floor(options?.rows ?? derivedRows));

  canvas.width = cols;
  canvas.height = rows;

  // Draw and sample image (stretching to fit as requested)
  ctx.drawImage(image, 0, 0, cols, rows);
  const imageData = ctx.getImageData(0, 0, cols, rows);
  const data = imageData.data;

  // ASCII character ramp (high to low contrast)
  const chars = "@%#*+=-:. ";

  let ascii = "";
  for (let i = 0; i < data.length; i += 4) {
    // Calculate luminance using standard formula
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Map luminance to character
    const charIndex = Math.floor((luminance / 255) * (chars.length - 1));
    ascii += chars[charIndex];

    // Newline after each row
    if ((i / 4 + 1) % cols === 0) ascii += "\n";
  }

  return ascii;
};

export default function AsciiBackground({ images = [] }: AsciiBackgroundProps) {
  // Fallback if no images provided
  const backgroundList = images;

  const [ascii, setAscii] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [lineHeight, setLineHeight] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [bgIndex, setBgIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState(backgroundList[0]);
  const [isChanging, setIsChanging] = useState(false);
  const colsRef = useRef<number>(120);
  const resizeTimer = useRef<number | null>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (preRef.current && ascii) {
      const w = preRef.current.offsetWidth;
      const h = preRef.current.offsetHeight;
      const container = document.getElementById("ascii-container");
      const cw = container ? container.clientWidth : window.innerWidth;
      const ch = container ? container.clientHeight : window.innerHeight;
      
      if (w > 0 && h > 0) {
        // Calculate uniform scale to ensure max-content covers the entire viewport
        const scaleX = cw / w;
        const scaleY = ch / h;
        const uniformScale = Math.max(1, Math.max(scaleX, scaleY));
        
        if (Math.abs(uniformScale - scale) > 0.01) {
          setScale(uniformScale);
        }
      }
    }
  }, [ascii, fontSize, lineHeight]);

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
    const container = document.getElementById("ascii-container");
    const viewportWidth = container ? container.clientWidth : Math.max(1, window.innerWidth);
    const viewportHeight = container ? container.clientHeight : Math.max(1, window.innerHeight);
    const charWidthRatio = 0.6;
    const baseLineHeightRatio = 0.8;
    const targetCharWidth = Math.max(1.7, Math.min(2.6, viewportWidth / 300));
    const baseCols = Math.max(60, Math.ceil(viewportWidth / targetCharWidth));
    
    // We calculate font size to exactly fit baseCols into viewport
    const fontSizeFromWidth = viewportWidth / baseCols / charWidthRatio;
    const baseLineHeight = fontSizeFromWidth * baseLineHeightRatio;
    
    // We calculate baseRows to exactly fit into viewport
    const baseRows = Math.max(60, Math.ceil(viewportHeight / baseLineHeight));
    const exactLineHeight = viewportHeight / baseRows;
    
    // Add 5% safety overscan so it never leaves gaps if Safari rounds fractional pixels down
    const desiredCols = Math.ceil(baseCols * 1.05);
    const desiredRows = Math.ceil(baseRows * 1.05);
    colsRef.current = desiredCols;

    const targetUrl = backgroundList[targetIndex];
    const img = new Image();
    img.src = targetUrl;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const output = convertImageToAscii(img, desiredCols, { rows: desiredRows, charRatio: 0.5 });

        // If it's a refresh, wait for the fade-out to complete (800ms) before swapping
        const swapDelay = isRefresh ? 800 : 0;

        setTimeout(() => {
          setAscii(output);
          setDisplayedImage(targetUrl);
          setFontSize(fontSizeFromWidth);
          setLineHeight(exactLineHeight);

          // Small buffer before fading back in
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
  };

  // Initial load
  useEffect(() => {
    if (backgroundList.length > 0) {
      setBgIndex(0);
      setDisplayedImage(backgroundList[0]);
      generate(0, false);
    }
  }, [backgroundList]);

  useEffect(() => {
    const onResize = () => {
      if (resizeTimer.current) window.clearTimeout(resizeTimer.current);
      resizeTimer.current = window.setTimeout(() => {
        generate(bgIndex, false);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [bgIndex]);

  const handleRefresh = () => {
    if (isChanging || backgroundList.length <= 1) return;
    setIsChanging(true);

    const nextIndex = (bgIndex + 1) % backgroundList.length;

    setBgIndex(nextIndex);
    generate(nextIndex, true);
  };

  const info = parseBackgroundInfo(displayedImage);

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
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
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
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 15%, rgba(0,0,0,1) 50%)",
          maskImage: "linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2)15%, rgba(0,0,0,1) 50%)",
        }}
      >
        <pre
          ref={preRef}
          style={{
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
            color: isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.55)",
            textAlign: "left",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${scale})`,
            maxWidth: "none",
            maxHeight: "none",
            overflow: "hidden",

            backgroundImage: `url('${displayedImage}')`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            
            opacity: isChanging ? 0 : (isDarkMode ? 0.7 : 1.0),
            filter: isDarkMode 
              ? "invert(1) hue-rotate(180deg) saturate(1) contrast(1) brightness(1)" 
              : "invert(0) hue-rotate(0deg) saturate(1.5) contrast(1.3) brightness(0.85)",
            textShadow: isDarkMode ? "0 0 2px rgba(255, 255, 255, 0.2)" : "0 0 1px rgba(255, 255, 255, 0.5)",
            transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), filter 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {ascii}
        </pre>
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
