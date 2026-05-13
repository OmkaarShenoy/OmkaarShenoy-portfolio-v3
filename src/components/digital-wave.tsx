"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HandWaving, PaperPlaneRight, Check, X } from "@phosphor-icons/react";
import posthog from "posthog-js";

interface DigitalWaveProps {
  isLightMode: boolean;
}

export default function DigitalWave({ isLightMode }: DigitalWaveProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [waves, setWaves] = useState<{ id: number }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    posthog.capture("wave_submitted", { has_message: !!message });
    setStatus("sending");
    try {
      const res = await fetch("/api/system/wave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      if (res.ok) {
        setStatus("sent");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
          setMessage("");
          setEmail("");
        }, 2500);
      } else {
        setStatus("error");
        posthog.captureException(new Error(`Wave submission failed: ${res.status}`));
      }
    } catch (err) {
      setStatus("error");
      posthog.captureException(err);
    }
  };

  const triggerWave = () => {
    if (isOpen) return;
    const id = Date.now();
    setWaves((prev) => [...prev, { id }]);
    setTimeout(() => {
      setWaves((prev) => prev.filter((w) => w.id !== id));
    }, 1000);
    setIsOpen(true);
    posthog.capture("wave_form_opened");
  };

  const textColor = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)";
  const placeholderColor = isLightMode ? "rgba(17,17,17,0.4)" : "rgba(255,255,255,0.4)";
  const dividerColor = isLightMode ? "rgba(17,17,17,0.2)" : "rgba(255,255,255,0.2)";

  const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="relative flex items-center h-full">
      {/* Decorative Floating Waves */}
      <div className="absolute left-0 -top-2 pointer-events-none">
        <AnimatePresence>
          {waves.map((w) => (
            <motion.div
              key={w.id}
              initial={{ y: 0, opacity: 1, scale: 0.9, rotate: -5 }}
              animate={{ y: -35, opacity: 0, scale: 1.2, rotate: 10 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: easeOutExpo }}
              className="absolute"
              style={{ color: textColor }}
            >
              <HandWaving size={15} weight="fill" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center h-full">
        <button
          onClick={triggerWave}
          disabled={isOpen || status === "sent"}
          className="flex items-center gap-[0.35rem]"
          style={{ 
            background: "none", 
            border: "none", 
            padding: 0, 
            cursor: (isOpen || status === "sent") ? "default" : "pointer",
            color: textColor,
            transition: "opacity 0.2s"
          }}
          onMouseEnter={e => {
            if (!isOpen && status !== "sent") {
              (e.currentTarget as HTMLElement).style.opacity = "0.7";
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }}
        >
          {status === "sent" ? (
            <Check size={15} weight="bold" style={{ color: "#22c55e" }} />
          ) : (
            <HandWaving size={15} weight="fill" />
          )}

          <AnimatePresence mode="popLayout">
            {!isOpen && status !== "sent" && (
              <motion.span 
                initial={{ opacity: 0, width: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
                exit={{ opacity: 0, width: 0, filter: "blur(2px)", transition: { duration: 0.2 } }}
                transition={{ duration: 0.6, ease: easeOutExpo }}
                style={{ 
                  fontSize: "11px", 
                  fontWeight: 500, 
                  letterSpacing: "0.05em", 
                  fontFamily: "var(--font-luxury)",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden"
                }}
              >
                wave
              </motion.span>
            )}
            
            {status === "sent" && (
              <motion.span 
                initial={{ opacity: 0, width: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, width: "auto", filter: "blur(0px)" }}
                exit={{ opacity: 0, width: 0, filter: "blur(2px)" }}
                transition={{ duration: 0.6, ease: easeOutExpo }}
                style={{ 
                  fontSize: "11px", 
                  fontWeight: 500, 
                  letterSpacing: "0.05em", 
                  fontFamily: "var(--font-luxury)",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden"
                }}
              >
                wave sent
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence mode="popLayout">
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: -5, filter: "blur(4px)" }}
              animate={{ width: "auto", opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ width: 0, opacity: 0, x: -5, filter: "blur(4px)", transition: { duration: 0.3 } }}
              transition={{ duration: 0.7, ease: easeOutExpo }}
              className="flex items-center overflow-hidden"
              style={{ marginLeft: "0.35rem" }}
            >
              <form onSubmit={handleSubmit} className="flex items-center h-full">
                <input
                  required
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  className="bg-transparent outline-none italic"
                  style={{
                    border: "none",
                    borderBottom: `1px solid transparent`,
                    color: textColor,
                    fontSize: "11px",
                    fontWeight: 400,
                    letterSpacing: "0.05em",
                    fontFamily: "var(--font-luxury)",
                    width: "120px",
                    padding: "0 0 2px 0",
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={(e) => e.target.style.borderBottom = `1px solid ${dividerColor}`}
                  onBlur={(e) => e.target.style.borderBottom = `1px solid transparent`}
                />
                
                <span style={{ color: dividerColor, margin: "0 0.5rem", fontSize: "11px" }}>/</span>

                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="msg"
                  className="bg-transparent outline-none italic"
                  style={{
                    border: "none",
                    borderBottom: `1px solid transparent`,
                    color: textColor,
                    fontSize: "11px",
                    fontWeight: 400,
                    letterSpacing: "0.05em",
                    fontFamily: "var(--font-luxury)",
                    width: "140px",
                    padding: "0 0 2px 0",
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={(e) => e.target.style.borderBottom = `1px solid ${dividerColor}`}
                  onBlur={(e) => e.target.style.borderBottom = `1px solid transparent`}
                />

                <div className="flex items-center gap-3 ml-4">
                  <button
                    type="submit"
                    disabled={status === "sending" || !email}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      padding: 0, 
                      cursor: "pointer",
                      color: textColor,
                      opacity: email ? 1 : 0.4,
                      transition: "opacity 0.2s, transform 0.2s"
                    }}
                    onMouseEnter={e => {
                      if (email) (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={e => {
                      if (email) (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    }}
                  >
                    <PaperPlaneRight size={14} weight="fill" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      posthog.capture("wave_form_closed");
                    }}
                    style={{ 
                      background: "none", 
                      border: "none", 
                      padding: 0, 
                      cursor: "pointer",
                      color: textColor,
                      opacity: 0.4,
                      transition: "opacity 0.2s, transform 0.2s"
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                      (e.currentTarget as HTMLElement).style.transform = "rotate(90deg)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.opacity = "0.4";
                      (e.currentTarget as HTMLElement).style.transform = "rotate(0deg)";
                    }}
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style jsx>{`
        ::placeholder {
          color: ${placeholderColor};
        }
      `}</style>
    </div>
  );
}
