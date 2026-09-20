"use client";

import dynamic from "next/dynamic";
import { LOGO_SCRAPS, PERSONAL_SCRAPS } from "@/lib/data";
import {
  ArrowUpRight, GithubLogo, LinkedinLogo, Envelope, CaretDown, GameController, SuitcaseSimple
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import posthog from "posthog-js";

const CustomCursor = dynamic(
  () => import("@/components/custom-cursor").then((m) => m.CustomCursor),
  { ssr: false }
);

const LogoScrap = dynamic(
  () => import("@/components/logo-scrap").then((m) => m.LogoScrap),
  { ssr: false }
);

const PersonalScrap = dynamic(
  () => import("@/components/personal-scrap").then((m) => m.PersonalScrap),
  { ssr: false }
);

const MobileProjectList = dynamic(
  () => import("@/components/mobile-project-list").then((m) => m.MobileProjectList),
  { ssr: false }
);

const DigitalWave = dynamic(() => import("@/components/digital-wave"), {
  ssr: false,
});

const ResumeModal = dynamic(
  () => import("@/components/resume-modal").then((m) => m.ResumeModal),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaderFinished, setLoaderFinished] = useState(false);
  const isLightMode = true;
  const [showLogos, setShowLogos] = useState(false);
  const [showOutside, setShowOutside] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(motionQuery.matches);

    const onMotionChange = () => setReduceMotion(motionQuery.matches);
    window.addEventListener("resize", checkMobile);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  // ── INTEGRATED LOADING LOGIC ──
  useEffect(() => {
    if (!mounted) return;

    if (reduceMotion) {
      setProgress(100);
      setLoading(false);
      return;
    }
    
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
  }, [mounted, reduceMotion]);

  useEffect(() => {
    if (!loading && mounted && !reduceMotion) {
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
  }, [loading, mounted, reduceMotion]);

  const toggleLogos = () => {
    const next = !showLogos;
    setShowLogos(next);
    if (!showLogos) setShowOutside(false);
    posthog.capture("experiences_toggled", { expanded: next });
  };

  const toggleOutside = () => {
    const next = !showOutside;
    setShowOutside(next);
    if (!showOutside) setShowLogos(false);
    posthog.capture("outside_work_toggled", { expanded: next });
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

        <h1 className="sr-only">omkaar shenoy  - Data Engineer based in Philadelphia</h1>

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
                omkaar shenoy .
                
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
              <button
                onClick={() => {
                  posthog.capture("resume_clicked");
                  setIsResumeOpen(true);
                }}
                aria-label="Open resume preview"
                style={{ background: "transparent", border: "none", borderTop: "none", borderLeft: "none", borderRight: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem", color: isLightMode ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)", fontSize: "0.85rem", fontWeight: 500, fontFamily: "var(--font-luxury)", textDecoration: "none", letterSpacing: "0.01em", borderBottom: `1px solid ${isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)"}`, paddingBottom: "1px", paddingLeft: "0px", transition: "color 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "#FFFFFF"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "#111111" : "#FFFFFF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLElement).style.borderColor = isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)" } }
              >
                <ArrowUpRight size={14} /> resume
              </button>
              <span style={{ color: isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.7)", fontSize: "0.7rem", transition: "color 0.4s ease" }}>/</span>
              <button
                type="button"
                onClick={toggleLogos}
                aria-expanded={showLogos}
                aria-label="Toggle experiences and skills section"
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
                aria-expanded={showOutside}
                aria-label="Toggle outside of work section"
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
                <a href="mailto:omkaarshenoyos@gmail.com" aria-label="Email Omkaar" onClick={() => posthog.capture("social_link_clicked", { platform: "email" })} style={{ textDecoration: "none", color: isLightMode ? "#111" : "#fff" }}>
                  <Envelope size={20} weight="fill" />
                </a>
                <a href="https://github.com/omkaarshenoy" aria-label="Open GitHub profile" target="_blank" rel="me" onClick={() => posthog.capture("social_link_clicked", { platform: "github" })} style={{ textDecoration: "none", color: isLightMode ? "#111" : "#fff" }}>
                  <GithubLogo size={20} weight="fill" />
                </a>
                <a href="https://linkedin.com/in/omkaarshenoy" aria-label="Open LinkedIn profile" target="_blank" rel="me" onClick={() => posthog.capture("social_link_clicked", { platform: "linkedin" })} style={{ textDecoration: "none", color: isLightMode ? "#111" : "#fff" }}>
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

        {!isMobile && (
          <nav className="animate-on-load" style={{ position: "fixed", bottom: "1.5rem", left: "1.5rem", zIndex: 1000, display: "flex", gap: "1rem", alignItems: "center", pointerEvents: "auto", flexWrap: "wrap" }} aria-label="Social links">
            <a href="mailto:omkaarshenoyos@gmail.com" aria-label="Email Omkaar" onClick={() => posthog.capture("social_link_clicked", { platform: "email" })} style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
            >
              <Envelope size={15} weight="fill" />
              <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>get in touch</span>
            </a>
            <a href="https://github.com/omkaarshenoy" aria-label="Open GitHub profile" target="_blank" rel="me" onClick={() => posthog.capture("social_link_clicked", { platform: "github" })} style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
            >
              <GithubLogo size={15} weight="fill" />
              <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>github</span>
            </a>
            <a href="https://linkedin.com/in/omkaarshenoy" aria-label="Open LinkedIn profile" target="_blank" rel="me" onClick={() => posthog.capture("social_link_clicked", { platform: "linkedin" })} style={{ display: "flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "#111111" : "rgba(255,255,255,1)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)"}
            >
              <LinkedinLogo size={15} weight="fill" />
              <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", fontFamily: "var(--font-luxury)" }}>linkedin</span>
            </a>
            <div style={{ marginLeft: "0.5rem" }}>
              <DigitalWave isLightMode={isLightMode} />
            </div>
          </nav>
        )}
      </main>

      <ResumeModal 
        isOpen={isResumeOpen} 
        onClose={() => { setIsResumeOpen(false); posthog.capture("resume_modal_closed"); }} 
        isLightMode={isLightMode} 
      />

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
