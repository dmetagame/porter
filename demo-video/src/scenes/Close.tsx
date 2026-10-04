import React from "react";
import { CanvasImage, staticFile } from "remotion";
import { C, mono, Shell } from "../shared";
export const Close: React.FC = () => (
  <Shell step="Public product and source">
    <div style={{ position: "absolute", left: 90, top: 235, width: 1050 }}>
      <div
        style={{
          fontSize: 100,
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: -4,
        }}
      >
        Inspect Porter.
      </div>
      <div style={{ fontSize: 37, color: C.muted, marginTop: 30 }}>
        An early scheduled-payment prototype on Arc.
      </div>
      <div style={{ marginTop: 65, fontSize: 41, color: C.accent }}>
        porter-gilt.vercel.app
      </div>
      <div style={{ marginTop: 20, fontSize: 36, color: C.accent }}>
        github.com/dmetagame/porter
      </div>
      <div style={{ marginTop: 60, fontSize: 25, color: C.muted }}>
        Pinned contract
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 25,
          marginTop: 12,
          lineHeight: 1.5,
          maxWidth: 1010,
        }}
      >
        0x3E92CbEe456dBcBdafaC5b2054347c36367d60d6
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        left: 1210,
        top: 265,
        width: 580,
        height: 495,
        overflow: "hidden",
        border: `1px solid ${C.line}`,
        borderRadius: 20,
      }}
    >
      <CanvasImage
        src={staticFile("captures/receipt.png")}
        style={{ width: 580 }}
      />
    </div>
  </Shell>
);
