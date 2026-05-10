"use client";

import { LogoScrap } from "@/components/logo-scrap";
import { PersonalScrap } from "@/components/personal-scrap";
import { CustomCursor } from "@/components/custom-cursor";
import { MobileProjectList } from "@/components/mobile-project-list";
import { LOGO_SCRAPS, PERSONAL_SCRAPS } from "@/lib/data";
import {
  ArrowUpRight, GithubLogo, LinkedinLogo, Envelope, CaretDown, GameController, SuitcaseSimple
} from "@phosphor-icons/react";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaderFinished, setLoaderFinished] = useState(false);
  const isLightMode = !mounted ? true : resolvedTheme !== "dark";
  const lampRef = useRef<HTMLButtonElement>(null);
  const cablePathRef = useRef<SVGPathElement>(null);
  const [showLogos, setShowLogos] = useState(false);
  const [showOutside, setShowOutside] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── INTEGRATED LOADING LOGIC ──
  useEffect(() => {
    if (!mounted) return;
    
    let interval: NodeJS.Timeout;
    const duration = 1200;
    const step = 100 / (duration / 16);
    
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return Math.min(prev + step + Math.random() * 3, 100);
      });
    }, 16);

    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (!loading && mounted) {
      // Fade out the opaque loader backdrop
      gsap.to(".loader-backdrop", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          const el = document.querySelector(".loader-backdrop") as HTMLElement;
          if (el) el.style.display = "none";
        }
      });

      // Fade out loader percentage
      gsap.to(".loader-aux", {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => setLoaderFinished(true)
      });

      // Subtext lines and links rise up shortly after
      gsap.fromTo(
        ".hero-sub",
        { opacity: 0, y: 30, skewY: 1 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.3 }
      );

      // Hero underline
      gsap.fromTo(
        ".hero-underline",
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.8, ease: "power4.out", delay: 0.4 }
      );
    }

    // ── ELASTIC LAMP DRAGGING ──
    if (lampRef.current && cablePathRef.current) {
      const anchorX = 108;
      const anchorY = 32;

      Draggable.create(lampRef.current, {
        type: "x,y",
        onDrag: function () {
          const rawX = this.x;
          const rawY = this.y;
          const dist = Math.sqrt(rawX * rawX + rawY * rawY);
          const tension = 1 / (1 + dist * 0.003);
          const actualX = rawX * tension;
          const actualY = rawY * tension;
          gsap.set(this.target, { x: actualX, y: actualY });

          const lampBaseX = 37 + actualX;
          const lampBaseY = 65 + actualY;
          const cp1x = lampBaseX + 15;
          const cp1y = lampBaseY + 30;
          const cp2x = anchorX - 5;
          const cp2y = anchorY + 35;
          cablePathRef.current?.setAttribute("d", `M ${lampBaseX} ${lampBaseY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${anchorX} ${anchorY}`);
        },
        onDragEnd: function () {
          gsap.to(this.target, {
            x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)", onUpdate: () => {
              const x = gsap.getProperty(this.target, "x") as number;
              const y = gsap.getProperty(this.target, "y") as number;
              const lampBaseX = 37 + x;
              const lampBaseY = 65 + y;
              const cp1x = lampBaseX + 15;
              const cp1y = lampBaseY + 30;
              const cp2x = anchorX - 5;
              const cp2y = anchorY + 35;
              cablePathRef.current?.setAttribute("d", `M ${lampBaseX} ${lampBaseY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${anchorX} ${anchorY}`);
            }
          });
        }
      });
    }
  }, [loading, mounted]);

  const toggleLogos = () => {
    setShowLogos(prev => !prev);
    if (!showLogos) setShowOutside(false);
  };

  const toggleOutside = () => {
    setShowOutside(prev => !prev);
    if (!showOutside) setShowLogos(false);
  };

  return (
    <>
      <CustomCursor />
      
      <div className="grain-overlay" />

      <main style={{
        position: isMobile ? "relative" : "fixed", 
        inset: 0, 
        width: "100vw", 
        height: isMobile ? "auto" : "100vh", 
        minHeight: isMobile ? "100vh" : "auto",
        overflowX: "hidden",
        overflowY: (isMobile || showLogos || showOutside) ? "auto" : "hidden",
        backgroundColor: "transparent",
        transition: "background-color 0.4s ease, filter 1.2s ease-in-out",
        filter: showOutside ? "sepia(0.15) saturate(1.2) contrast(0.95)" : "none",
        zIndex: 20,
        pointerEvents: "none"
      }}>
        {/* Opaque Loader Backdrop - Sits inside main but behind the header */}
        <div className="loader-backdrop" style={{
          position: "fixed",
          inset: 0,
          zIndex: 5,
          backgroundColor: isLightMode ? "#f8f8f8" : "#0a0a0a",
          pointerEvents: "none"
        }} />

        <h1 className="sr-only">Omkaar Shenoy - Data Engineer based in Philadelphia</h1>

        <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
          <defs>
            <filter id="sticker-outline" x="-20%" y="-20%" width="140%" height="140%">
              <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="dilatedAlpha" />
              <feFlood floodColor="white" result="whiteColor" />
              <feComposite in="whiteColor" in2="dilatedAlpha" operator="in" result="outline" />
              <feDropShadow in="outline" dx="4" dy="6" stdDeviation="4" floodColor="rgba(0,0,0,0.4)" result="shadow" />
              <feMerge>
                <feMergeNode in="shadow" />
                <feMergeNode in="outline" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        <header style={{ 
          position: isMobile ? "relative" : "absolute", 
          inset: isMobile ? "auto" : 0, 
          display: "flex", 
          alignItems: "center", 
          paddingLeft: isMobile ? "1.5rem" : "clamp(3rem, 8vw, 9rem)",
          paddingRight: isMobile ? "1.5rem" : "0",
          paddingTop: isMobile ? "6rem" : "0",
          paddingBottom: isMobile ? "2rem" : "0",
          zIndex: 20, 
          pointerEvents: "none", 
          userSelect: "none", 
          mixBlendMode: "normal" 
        }}>
          <div style={{ width: "100%" }}>
            <div style={{ position: "relative", width: "fit-content" }}>
              <h1 className="luxury-text" style={{ 
                margin: 0, 
                display: "block", 
                fontSize: isMobile ? "clamp(2.8rem, 12vw, 3.8rem)" : "clamp(3.8rem, 4vw, 8.5rem)", 
                position: "relative", 
                opacity: 1, 
                transition: "opacity 0.2s ease" 
              }}>
                Omkaar Shenoy.
                
                <span className="hero-underline" style={{ 
                  position: "absolute", 
                  bottom: "0.06em", 
                  left: 0, 
                  width: "100%", 
                  height: "1px", 
                  background: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", 
                  display: "block", 
                  transformOrigin: "left center", 
                  transition: "background 0.4s ease",
                  opacity: loading ? 0 : 1
                }} />
              </h1>

              {/* Loader Percentage */}
              {!loaderFinished && (
                <div className="loader-aux" style={{
                  position: "absolute",
                  top: isMobile ? "-1.2rem" : "-1.8rem",
                  right: "0.2rem",
                  fontSize: isMobile ? "12px" : "14px",
                  fontFamily: "var(--font-luxury)",
                  fontStyle: "italic",
                  fontWeight: 600,
                  opacity: loading ? 0.9 : undefined,
                  color: isLightMode ? "#111" : "#fff",
                  letterSpacing: "0.05em",
                  transition: "opacity 0.2s ease, color 0.4s ease"
                }}>
                  {Math.floor(progress)}%
                </div>
              )}
            </div>

            <div style={{ position: "relative", marginTop: "2rem", display: isMobile ? "grid" : "block" }}>
              <div style={{
                gridArea: isMobile ? "1 / 1" : "auto",
                opacity: showOutside ? 0 : 1,
                transform: showOutside ? "translateY(-10px)" : "translateY(0)",
                transition: showOutside ? "none" : "opacity 0.8s ease, transform 0.8s ease",
                pointerEvents: (showOutside || isMobile && (showLogos || showOutside)) ? "none" : "auto",
              }}>
                <div className="hero-sub luxury-subtext" style={{ opacity: 0, fontSize: "clamp(0.85rem, 1.4vw, 1.1rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  I&apos;m a Data Engineer at Aramark, with previous experience at WebstaurantStore, NPR, and others.
                </div>

                <div className="hero-sub luxury-subtext" style={{ opacity: 0, marginTop: "1rem", fontSize: "clamp(0.8rem, 1.2vw, 0.95rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  My daily work involves building core data infrastructure for millions of records moving at a global scale.
                </div>

                <div className="hero-sub luxury-subtext" style={{ opacity: 0, marginTop: "1rem", fontSize: "clamp(0.75rem, 1.1vw, 0.85rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  Please reach out below for any interesting opportunities &mdash; I&apos;m always happy to talk.
                </div>
              </div>

              <div style={{
                gridArea: isMobile ? "1 / 1" : "auto",
                opacity: showOutside ? 1 : 0,
                transform: showOutside ? "translateY(0)" : "translateY(10px)",
                transition: showOutside ? "opacity 0.8s ease, transform 0.8s ease" : "none",
                pointerEvents: (showOutside && !isMobile) ? "auto" : "none",
                position: isMobile ? "relative" : "absolute",
                top: 0,
                left: 0,
                display: isMobile && !showOutside ? "none" : "block"
              }}>
                <div className="luxury-subtext" style={{ fontSize: "clamp(0.85rem, 1.4vw, 1rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  I spend most of my time outside engineering experimenting new dishes in the kitchen, building weird side projects, and getting involved in random side quests around the city.
                </div>

                <div className="luxury-subtext" style={{ marginTop: "1rem", fontSize: "clamp(0.8rem, 1.2vw, 0.95rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  Most of the stuff here started as a random idea that sounded interesting enough to start obsessing over.
                </div>

                <div className="luxury-subtext" style={{ marginTop: "1rem", fontSize: "clamp(0.75rem, 1.1vw, 0.85rem)", maxWidth: "48ch", transition: "opacity 0.4s ease" }}>
                  Every background photo on this site was taken by me somewhere along the way.
                </div>
              </div>
            </div>

            <div className="hero-sub" style={{ opacity: 0, marginTop: "2.2rem", display: "flex", flexWrap: "wrap", gap: "1.2rem", pointerEvents: "auto", alignItems: "center" }}>
              <a href="/Omkaar_Resume.pdf" target="_blank"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: isLightMode ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)", fontSize: "0.85rem", fontWeight: 500, fontFamily: "var(--font-luxury)", textDecoration: "none", letterSpacing: "0.01em", borderBottom: `1px solid ${isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"}`, paddingBottom: "1px", transition: "color 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "#FFFFFF"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "#111111" : "#FFFFFF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)" } }
              >
                <ArrowUpRight size={14} /> resume
              </a>
              <span style={{ color: isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.7)", fontSize: "0.7rem", transition: "color 0.4s ease" }}>/</span>
              <button
                type="button"
                onClick={toggleLogos}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: (showLogos && isMobile) ? (isLightMode ? "#111" : "#fff") : (isLightMode ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)"), fontSize: "0.85rem", fontWeight: showLogos && isMobile ? 600 : 500, fontFamily: "var(--font-luxury)", textDecoration: "none", letterSpacing: "0.01em", borderBottom: `1px solid ${(showLogos && isMobile) ? (isLightMode ? "#111" : "#fff") : (isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)")}`, paddingBottom: "1px", background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "#FFFFFF"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "#111111" : "#FFFFFF"; }}
                onMouseLeave={e => { if (!(showLogos && isMobile)) { (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,0.7)" : "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"; } }}
              >
                <SuitcaseSimple size={14} />experiences + skills

                <CaretDown
                  size={12}
                  weight="bold"
                  style={{
                    transform: showLogos ? "rotate(-180deg)" : "rotate(0deg)",
                    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    opacity: 0.8,
                    marginLeft: "0.1rem"
                  }}
                />
              </button>
              <span style={{ color: isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.7)", fontSize: "0.7rem", transition: "color 0.4s ease" }}>/</span>
              <button
                type="button"
                onClick={toggleOutside}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: (showOutside && isMobile) ? (isLightMode ? "#111" : "#fff") : (isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"), fontSize: "0.85rem", fontWeight: showOutside && isMobile ? 600 : 500, fontFamily: "var(--font-luxury)", textDecoration: "none", letterSpacing: "0.01em", borderBottom: `1px solid ${(showOutside && isMobile) ? (isLightMode ? "#111" : "#fff") : (isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)")}`, paddingBottom: "1px", background: "transparent", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer", transition: "all 0.2s", paddingLeft: '0px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "#FFFFFF"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "#111111" : "#FFFFFF"; }}
                onMouseLeave={e => { if (!(showOutside && isMobile)) { (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,0.7)" : "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"; } }}
              >
                <GameController size={14} /> outside of work
                <CaretDown
                  size={12}
                  weight="bold"
                  style={{
                    transform: showOutside ? "rotate(-180deg)" : "rotate(0deg)",
                    transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    opacity: 0.8,
                    marginLeft: "0.1rem"
                  }}
                />
              </button>
            </div>
          </div>
        </header>

        {isMobile && (showLogos || showOutside) && (
          <div className="mobile-scraps-container" style={{ 
            padding: "1.5rem", 
            paddingBottom: "8rem", 
            display: "flex", 
            flexDirection: "column", 
            gap: "2rem",
            pointerEvents: "auto",
            animation: "fadeInUp 0.6s ease-out"
          }}>
            <div style={{ height: "1px", background: isLightMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)", margin: "0.5rem 0" }} />
            
            {showLogos && (
              <MobileProjectList 
                items={LOGO_SCRAPS} 
                isLightMode={isLightMode} 
              />
            )}
            
            {showOutside && (
              <MobileProjectList 
                items={PERSONAL_SCRAPS} 
                isLightMode={isLightMode} 
              />
            )}

            <div style={{ marginTop: "4rem", opacity: 0.8 }}>

              
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <a href="mailto:omkaarshenoyos@gmail.com" style={{ textDecoration: "none", color: isLightMode ? "#111" : "#fff" }}>
                  <Envelope size={20} weight="fill" />
                </a>
                <a href="https://github.com/omkaarshenoy" target="_blank" rel="me" style={{ textDecoration: "none", color: isLightMode ? "#111" : "#fff" }}>
                  <GithubLogo size={20} weight="fill" />
                </a>
                <a href="https://linkedin.com/in/omkaarshenoy" target="_blank" rel="me" style={{ textDecoration: "none", color: isLightMode ? "#111" : "#fff" }}>
                  <LinkedinLogo size={20} weight="fill" />
                </a>
              </div>
            </div>
          </div>
        )}

        {!isMobile && LOGO_SCRAPS.map((scrap) => (
          <LogoScrap
            key={scrap.id}
            {...scrap}
            isVisible={showLogos}
          />
        ))}

        {!isMobile && PERSONAL_SCRAPS.map((scrap) => (
          <PersonalScrap
            key={scrap.id}
            {...scrap}
            isVisible={showOutside}
          />
        ))}

        <nav className="animate-on-load" style={{ position: "fixed", top: isMobile ? "1.5rem" : "2rem", right: isMobile ? "1.5rem" : "2rem", zIndex: 1000, display: "flex", flexDirection: "row", gap: "1.5rem", pointerEvents: "auto" }} aria-label="Theme toggle">
          {!isMobile && (
            <svg style={{ position: "absolute", top: "0", left: "0", width: "150px", height: "150px", overflow: "visible", pointerEvents: "none", zIndex: 0 }}>
              <rect x="106" y="24" width="8" height="16" rx="1" fill={isLightMode ? "rgba(17,17,17,0.15)" : "rgba(255,255,255,0.1)"} />
              <path ref={cablePathRef} d="M 37 65 C 52 95, 103 67, 108 32" stroke={isLightMode ? "rgba(17,17,17,0.7)" : "rgba(255,255,255,0.4)"} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <rect x="106" y="28" width="6" height="8" rx="1" fill={isLightMode ? "rgba(17,17,17,0.8)" : "rgba(255,255,255,0.5)"} />
            </svg>
          )}

          <button
            ref={lampRef}
            title="Toggle Light Mode"
            onClick={() => setTheme(isLightMode ? "dark" : "light")}
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "block", position: "relative", zIndex: 1 }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1) rotate(5deg)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            {!isLightMode && (
              <div style={{ position: "absolute", top: "50%", left: "-90%", width: "180px", height: "280px", background: "linear-gradient(190deg, rgba(255,250,210,0.25) 0%, transparent 75%)", clipPath: "polygon(50% -32px, 0% 100%, 100% 100%)", transformOrigin: "top center", transform: "rotate(30deg)", pointerEvents: "none", zIndex: -1, filter: "blur(12px)", transition: "opacity 0.4s ease" }} />
            )}
            <img src="/images/lamp.webp" alt="Light Mode" style={{ position: "relative", zIndex: 1, width: isMobile ? "45px" : "75px", height: isMobile ? "45px" : "75px", objectFit: "contain", filter: isLightMode ? `drop-shadow(2px 4px 6px rgba(0,0,0,0.3)) ${showOutside ? 'sepia(0.3) saturate(1.2)' : ''}` : `drop-shadow(0 0 10px rgba(255,250,210,${showOutside ? '0.6' : '0.3'}))`, transition: "filter 1.2s ease-in-out" }} />
          </button>
        </nav>

        {!isMobile && (
          <nav className="animate-on-load" style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", zIndex: 1000, display: "flex", gap: "1rem", alignItems: "center", pointerEvents: "auto", flexWrap: "wrap" }} aria-label="Social links">
            <a href="mailto:omkaarshenoyos@gmail.com" style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
            >
              <Envelope size={15} weight="fill" />
              <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>get in touch</span>
            </a>
            <a href="https://github.com/omkaarshenoy" target="_blank" rel="me" style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
            >
              <GithubLogo size={15} weight="fill" />
              <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>github</span>
            </a>
            <a href="https://linkedin.com/in/omkaarshenoy" target="_blank" rel="me" style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
            >
              <LinkedinLogo size={15} weight="fill" />
              <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>linkedin</span>
            </a>
          </nav>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
