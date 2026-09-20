"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, GameController } from "@phosphor-icons/react";
import Link from "next/link";
import posthog from "posthog-js";

export default function NotFound() {
  const [isLightMode, setIsLightMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [konami, setKonami] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsLightMode(true);
  }, []);

  // Konami code Easter egg
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const arrows = ["arrowup", "arrowdown", "arrowleft", "arrowright"];
      
      const newKonami = [...konami];
      
      if (arrows.includes(key) || key === "b" || key === "a") {
        newKonami.push(key);
        if (newKonami.length > 10) newKonami.shift();
        
        const sequence = newKonami.join("");
        const target = "arrowuparrowuparrowdownarrowdownarrowleftarrowright";
        
        if (sequence.includes(target) || sequence.endsWith("arrowuparrowuparrowdownarrowdownarrowleftarrowrightarrowleftarrowright")) {
          activateGlitch();
          posthog.capture("easter_404_konami");
        }
        
        setKonami(newKonami);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konami]);

  const activateGlitch = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 2000);
  };

  const spawnParticles = (e: React.MouseEvent) => {
    posthog.capture("easter_404_particles");
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.slice(newParticles.length));
    }, 1000);
  };

  if (!mounted) {
    return null;
  }

  const bgColor = isLightMode ? "bg-white" : "bg-black";
  const textColor = isLightMode ? "text-neutral-900" : "text-white";
  const accentColor = isLightMode ? "text-neutral-400" : "text-neutral-600";

  return (
    <div
      ref={containerRef}
      className={`${bgColor} ${textColor} min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden`}
      onClick={spawnParticles}
    >
      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
            animate={{ x: p.x + (Math.random() - 0.5) * 100, y: p.y - 100, opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed w-2 h-2 bg-blue-500 rounded-full pointer-events-none"
          />
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl z-10"
      >
        {/* ASCII Art 404 */}
        <pre
          className={`text-xs md:text-sm font-mono mb-8 overflow-hidden ${
            glitchActive ? "text-red-500 opacity-70" : accentColor
          } transition-all duration-300`}
        >
          {glitchActive ? (
            <>
              {`  ╔═══════════════════════════════════╗
  ║  S Y S T E M  E R R O R          ║
  ║  [404] PAGE NOT FOUND            ║
  ║  └─ ACCESS DENIED ─┘             ║
  ╚═══════════════════════════════════╝`}
            </>
          ) : (
            <>
              {`   _  _     _   
  | || |   | |  
  | || |_  | |_ 
  |__   _| |_  |
     | |     | |
     |_|     |_|`}
            </>
          )}
        </pre>

        {/* Glitch Text */}
        <div className="relative mb-8 h-20 flex flex-col items-center justify-center">
          <motion.h1
            key={glitchActive ? "glitch" : "normal"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`text-5xl md:text-7xl font-bold transition-all duration-300 ${
              glitchActive ? "text-red-500 drop-shadow-lg" : ""
            }`}
          >
            4{glitchActive && <span className="animate-pulse">!</span>}04
          </motion.h1>
        </div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <h2 className={`text-2xl md:text-3xl font-semibold mb-3 ${textColor}`}>
            {glitchActive ? "🔓 SYSTEM BREACH DETECTED" : "Page not found"}
          </h2>
          <p className={`text-lg ${accentColor} mb-2`}>
            {glitchActive
              ? "The void has spoken... returning to safety.."
              : "The page you're looking for could not be found."}
          </p>
          <p className={`text-sm ${accentColor}`}>
            {glitchActive ? "Or try the Konami Code... 👀" : "Click around for a surprise."}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link
            href="/"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isLightMode
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            <ArrowLeft size={20} />
            Back Home
          </Link>

          <button
            onClick={() => {
              posthog.capture("easter_404_game");
              window.location.href = "/?game=true";
            }}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isLightMode
                ? "bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
                : "bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-700"
            }`}
          >
            <GameController size={20} />
            Play Game
          </button>
        </motion.div>

        {/* Easter Egg Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1, duration: 1 }}
          className={`text-xs font-mono ${accentColor} hover:opacity-100 transition-opacity`}
        >
          ↑ ↑ ↓ ↓ ← → ← → B A
        </motion.p>
      </motion.div>

      {/* Background Decoration */}
      <div className={`absolute inset-0 opacity-[0.02] pointer-events-none ${textColor}`}>
        <div className="absolute top-20 left-10 text-6xl font-bold">404</div>
        <div className="absolute bottom-32 right-20 text-4xl font-bold rotate-45">ERROR</div>
      </div>
    </div>
  );
}
