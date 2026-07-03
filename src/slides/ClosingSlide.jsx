import React from "react";
import { T, solid, Reveal } from "./primitives";

// Closing slide. Placeholder — swap in your real closing / call-to-action.
export default function ClosingSlide({ step = 0 }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "0 96px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.22em", color: solid(T.muted) }}>
        THE TAKEAWAY
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 60,
          lineHeight: 1.05,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          marginTop: 20,
          maxWidth: 1000,
        }}
      >
        The data center <span style={{ color: solid(T.e3) }}>becomes the computer</span>
      </div>
      <Reveal on={step >= 1} delay={100} style={{ marginTop: 30 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 20, color: solid(T.muted), maxWidth: 640, lineHeight: 1.5 }}>
          One coherent machine, designed top to bottom — not a building that happens to hold servers.
        </div>
      </Reveal>
    </div>
  );
}

ClosingSlide.steps = 1;
ClosingSlide.title = "The data center becomes the computer";
