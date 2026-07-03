import React from "react";
import { T, solid } from "./primitives";

// Cover slide. Placeholder content — replace copy as the deck grows.
export default function TitleSlide() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 96px",
        boxSizing: "border-box",
        background: `radial-gradient(1000px 700px at 20% 0%, rgb(var(--e3) / 0.06), transparent)`,
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.22em", color: solid(T.muted) }}>
        THE FUTURE OF DATA CENTERS
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 0.98,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          marginTop: 18,
          maxWidth: 1050,
        }}
      >
        The full-stack <span style={{ color: solid(T.e3) }}>rebuild</span>
      </div>
      <div style={{ fontFamily: "var(--font-sans)", fontSize: 22, color: solid(T.muted), marginTop: 26, maxWidth: 720, lineHeight: 1.4 }}>
        How the entire stack — from workloads down to the power plant — is being redesigned at once.
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 56 }}>
        <div style={{ width: 46, height: 2, background: solid(T.e3) }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: solid(T.muted), letterSpacing: "0.06em" }}>
          press → or click to begin
        </span>
      </div>
    </div>
  );
}

TitleSlide.steps = 0;
TitleSlide.title = "The full-stack rebuild";
