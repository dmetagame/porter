import React from "react";
import { AbsoluteFill, CanvasImage, staticFile } from "remotion";
import { Brand, C } from "./shared";
export const Thumbnail: React.FC = () => (
  <AbsoluteFill
    style={{
      background: C.canvas,
      color: C.ink,
      fontFamily: "DM Sans",
      padding: 80,
    }}
  >
    <Brand size={50} />
    <div
      style={{
        position: "absolute",
        left: 85,
        top: 295,
        fontSize: 112,
        fontWeight: 600,
        lineHeight: 1.05,
        letterSpacing: -5,
      }}
    >
      One lock.
      <br />
      Two payments.
    </div>
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 630,
        fontSize: 39,
        color: C.accent,
      }}
    >
      Payout, bounty and gas. All USDC.
    </div>
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 845,
        fontSize: 29,
        color: C.muted,
      }}
    >
      Porter · builder-controlled Arc mainnet proof
    </div>
    <CanvasImage
      src={staticFile("captures/receipt.png")}
      style={{ position: "absolute", left: 1070, top: 200, width: 770 }}
    />
  </AbsoluteFill>
);
