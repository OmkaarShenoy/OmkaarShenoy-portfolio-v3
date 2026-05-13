"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DownloadSimple, X } from "@phosphor-icons/react";
import { useEffect } from "react";
import posthog from "posthog-js";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode: boolean;
}

export function ResumeModal({ isOpen, onClose, isLightMode }: ResumeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      posthog.capture("resume_modal_opened");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const textColor = isLightMode ? "rgba(17,17,17,1)" : "rgba(255,255,255,1)";
  const bgColor = isLightMode ? "rgba(248,248,248,0.85)" : "rgba(10,10,10,0.85)";
  const borderColor = isLightMode ? "rgba(17,17,17,0.1)" : "rgba(255,255,255,0.1)";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bgColor,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "2rem",
          }}
          onClick={onClose}
        >
          {/* Header Controls */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              display: "flex",
              gap: "2rem",
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href="/Omkaar_Shenoy_Resume.pdf"
              download
              onClick={() => posthog.capture("resume_downloaded")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: textColor,
                textDecoration: "none",
                fontFamily: "var(--font-luxury)",
                fontSize: "0.9rem",
                opacity: 0.7,
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <DownloadSimple size={18} />
              download
            </a>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: textColor,
                opacity: 0.7,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "var(--font-luxury)",
                fontSize: "0.9rem",
                transition: "opacity 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <X size={18} />
              close
            </button>
          </motion.div>

          {/* PDF Container */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "850px",
              height: "85vh",
              backgroundColor: isLightMode ? "#fff" : "#1a1a1a",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: isLightMode
                ? "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)"
                : "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading placeholder just in case */}
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-luxury)",
              fontSize: "0.9rem",
              color: textColor,
              opacity: 0.5,
              zIndex: 0
            }}>
              loading...
            </div>
            
            <iframe
              src="/Omkaar_Shenoy_Resume.pdf#toolbar=0&navpanes=0&scrollbar=0"
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                position: "relative",
                zIndex: 1,
                backgroundColor: "transparent"
              }}
              title="Omkaar Shenoy Resume"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
