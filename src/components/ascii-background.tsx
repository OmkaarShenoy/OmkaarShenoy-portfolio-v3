"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowsClockwise } from "@phosphor-icons/react";

const BACKGROUND_IMAGES = [
  "/images/backgrounds/neist.jpeg",
  "/images/backgrounds/oldmanofstorr.jpeg",
  "/images/backgrounds/fuji.png",
];

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

  // Draw and sample image
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

export default function AsciiBackground() {
  const [ascii, setAscii] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [lineHeight, setLineHeight] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [displayedImage, setDisplayedImage] = useState(BACKGROUND_IMAGES[0]);
  const [isChanging, setIsChanging] = useState(false);
  const colsRef = useRef<number>(120);
  const resizeTimer = useRef<number | null>(null);

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
    const viewportWidth = Math.max(1, window.innerWidth);
    const viewportHeight = Math.max(1, window.innerHeight);
    const charWidthRatio = 0.6;
    const baseLineHeightRatio = 0.8;
    const targetCharWidth = Math.max(1.7, Math.min(2.6, viewportWidth / 300));
    const desiredCols = Math.max(60, Math.ceil(viewportWidth / targetCharWidth));
    colsRef.current = desiredCols;

    const fontSizeFromWidth = viewportWidth / desiredCols / charWidthRatio;
    const baseLineHeight = fontSizeFromWidth * baseLineHeightRatio;
    const desiredRows = Math.max(60, Math.ceil(viewportHeight / baseLineHeight));
    const exactLineHeight = viewportHeight / desiredRows;

    const targetUrl = BACKGROUND_IMAGES[targetIndex];
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
    generate(0, false);
  }, []);

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
    if (isChanging) return;
    setIsChanging(true);
    const nextIndex = (bgIndex + 1) % BACKGROUND_IMAGES.length;
    setBgIndex(nextIndex);
    generate(nextIndex, true);
  };

  return (
    <div className="ascii-bg" aria-hidden>
      <button
        onClick={handleRefresh}
        title="Change Background"
        disabled={isChanging}
        style={{
          position: "fixed",
          top: "1.5rem",
          left: "1.5rem",
          zIndex: 1001,
          background: "transparent",
          border: "none",
          padding: "0.5rem",
          cursor: isChanging ? "wait" : "pointer",
          color: isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)",
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
            e.currentTarget.style.color = isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)";
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
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
          overflow: "hidden",
          zIndex: 15,
          pointerEvents: "none",
        }}
      >
        <pre
          aria-hidden
          style={{
            whiteSpace: "pre",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
            fontSize: `${fontSize}px`,
            lineHeight: `${lineHeight}px`,
            margin: 0,
            padding: 0,
            display: "block",
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
            overflow: "hidden",
            
            backgroundImage: `url('${displayedImage}')`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            
            opacity: isChanging ? 0 : (isDarkMode ? 0.6 : 0.7),
            filter: isDarkMode ? "brightness(0.9) contrast(1.1)" : "none",
            textShadow: isDarkMode ? "0 0 1px rgba(0, 0, 0, 0.4)" : "0 0 1px rgba(255, 255, 255, 0.25)",
            transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {ascii}
        </pre>
      </div>
    </div>
  );
}
