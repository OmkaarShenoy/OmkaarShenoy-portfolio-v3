"use client";

import React from "react";
import Image from "next/image";
import { TooltipData } from "./scrap-tooltip";
import posthog from "posthog-js";

interface MobileProjectItemProps {
  id: string;
  src: string;
  alt: string;
  tooltip: TooltipData;
  href?: string;
  isLightMode: boolean;
}

function MobileProjectItem({ id, src, alt, tooltip, href, isLightMode }: MobileProjectItemProps) {
  const handleClick = () => {
    posthog.capture("mobile_project_clicked", { title: tooltip.title, href });
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        background: isLightMode ? "rgba(255, 255, 255, 0.8)" : "rgba(20, 20, 20, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: "0.5rem",
        padding: "1.25rem",
        border: `1px solid ${isLightMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        cursor: href ? "pointer" : "default",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <div style={{ 
          width: "50px", 
          height: "50px", 
          position: "relative", 
          flexShrink: 0,
          background: isLightMode ? "#fff" : "#111",
          borderRadius: "0.25rem",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${isLightMode ? "#eee" : "#222"}`
        }}>
          <Image 
            src={src} 
            alt={alt} 
            width={40} 
            height={40} 
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              {tooltip.category && (
                <div className="luxury-subtext" style={{ fontSize: "0.55rem", fontWeight: 800, marginBottom: "0.1rem", letterSpacing: "0.1em", opacity: 0.6 }}>
                  {tooltip.category}
                </div>
              )}
              <div className="luxury-subtext" style={{ fontSize: "1.1rem", letterSpacing: "0.01em", lineHeight: 1.2, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {tooltip.title}
                {href && (
                  <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor" style={{ flexShrink: 0, opacity: 0.6 }}>
                    <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {tooltip.sub && (
            <div className="luxury-subtext" style={{ fontSize: "0.75rem", fontWeight: 500, marginTop: "0.25rem", opacity: 0.8 }}>
              {tooltip.sub}
            </div>
          )}

          {tooltip.period && (
            <div className="luxury-subtext" style={{ fontSize: "0.65rem", fontWeight: 400, marginTop: "0.2rem", opacity: 0.6 }}>
              {tooltip.period}
            </div>
          )}

          {tooltip.tags && tooltip.tags.length > 0 && (
            <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {tooltip.tags.map(t => (
                <span 
                  key={t} 
                  className="luxury-subtext" 
                  style={{ 
                    border: `1px solid ${isLightMode ? "#ddd" : "#333"}`, 
                    borderRadius: "2px", 
                    padding: "2px 6px", 
                    fontSize: "0.55rem", 
                    fontWeight: 500, 
                    letterSpacing: "0.02em" 
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {tooltip.stat && (
            <div style={{ marginTop: "0.75rem", borderTop: `1px solid ${isLightMode ? "#eee" : "#222"}`, paddingTop: "0.5rem", display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
              <span className="luxury-subtext" style={{ fontSize: "1.4rem", lineHeight: 1 }}>
                {tooltip.stat}
              </span>
              {tooltip.statLabel && (
                <span className="luxury-subtext" style={{ fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.02em", opacity: 0.6 }}>
                  {tooltip.statLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MobileProjectListProps {
  items: any[];
  isLightMode: boolean;
}

export function MobileProjectList({ items, isLightMode }: MobileProjectListProps) {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "1.25rem",
      width: "100%",
      maxWidth: "100%"
    }}>
      {items.map((item) => (
        <MobileProjectItem 
          key={item.id} 
          {...item} 
          isLightMode={isLightMode} 
        />
      ))}
    </div>
  );
}
