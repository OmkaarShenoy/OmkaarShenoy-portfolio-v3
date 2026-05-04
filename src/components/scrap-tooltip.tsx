import React from "react";

export interface TooltipData {
  category?: string;
  title: string;
  sub?: string;
  period?: string;
  tags?: string[];
  stat?: string;
  statLabel?: string;
}

interface ScrapTooltipProps {
  tooltip: TooltipData;
  tooltipDir: "right" | "left";
  isVisible: boolean;
  href?: string;
}

export function ScrapTooltip({ tooltip, tooltipDir, isVisible, href }: ScrapTooltipProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        ...(tooltipDir === "right"
          ? { left: `calc(100% + 12px)` }
          : { right: `calc(100% + 12px)` }),
        transform: isVisible
          ? "translateY(-50%) translateX(0)"
          : tooltipDir === "right"
            ? "translateY(-50%) translateX(-10px)"
            : "translateY(-50%) translateX(10px)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity 0.22s ease, transform 0.22s ease",
        zIndex: 200,
        minWidth: "175px",
        maxWidth: "230px",
      }}
    >
      <div style={{
        background: "#FFFFFF",
        border: "2px solid #111111",
        outline: "2px dotted #111111",
        outlineOffset: "-6px",
        borderRadius: "0.25rem",
        padding: "1rem 1.1rem",
        boxShadow: "3px 3px 0 rgba(255,255,255,0.15)",
      }}>
        {tooltip.category && (
          <div className="luxury-subtext" style={{ fontSize: "0.55rem", fontWeight: 800, marginBottom: "0.2rem", letterSpacing: "0.1em" }}>
            {tooltip.category}
          </div>
        )}
        <div className="luxury-subtext" style={{ fontSize: "1.3rem", letterSpacing: "0.01em", lineHeight: 1.15, display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {tooltip.title}
          {href && (
            <svg width="10" height="10" viewBox="0 0 256 256" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
            </svg>
          )}
        </div>
        {tooltip.sub && (
          <div className="luxury-subtext" style={{ fontSize: "0.65rem", fontWeight: 600, marginTop: "0.2rem", letterSpacing: "0.02em" }}>
            {tooltip.sub}
          </div>
        )}
        {tooltip.period && (
          <div className="luxury-subtext" style={{ fontSize: "0.6rem", fontWeight: 500, marginTop: "0.1rem", letterSpacing: "0.02em" }}>
            {tooltip.period}
          </div>
        )}
        {tooltip.tags && tooltip.tags.length > 0 && (
          <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
            {tooltip.tags.map(t => (
              <span key={t} className="luxury-subtext" style={{ border: "1px solid #DDDDDD", borderRadius: "2px", padding: "2px 6px", fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.02em" }}>
                {t}
              </span>
            ))}
          </div>
        )}
        {tooltip.stat && (
          <div style={{ marginTop: "0.5rem", borderTop: "1px solid #EEEEEE", paddingTop: "0.4rem", display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
            <span className="luxury-subtext" style={{ fontSize: "1.6rem", lineHeight: 1 }}>
              {tooltip.stat}
            </span>
            {tooltip.statLabel && (
              <span className="luxury-subtext" style={{ fontSize: "0.55rem", fontWeight: 500, letterSpacing: "0.02em" }}>
                {tooltip.statLabel}
              </span>
            )}
          </div>
        )}
        <div style={{
          position: "absolute",
          top: "50%",
          ...(tooltipDir === "right"
            ? { left: "-4px", borderRight: "none", borderTop: "none" }
            : { right: "-4px", borderLeft: "none", borderBottom: "none" }),
          transform: "translateY(-50%) rotate(45deg)",
          width: "8px",
          height: "8px",
          background: "#FFFFFF",
          border: "2px solid #111111",
        }} />
      </div>
    </div>
  );
}
