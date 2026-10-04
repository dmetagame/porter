import React from "react";
import { useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import captions from "./captions.json";
import { C } from "./shared";
export const CaptionTrack: React.FC = () => {
  const ms = (useCurrentFrame() / 30) * 1000;
  const caption = (captions as Caption[]).find(
    (c) => c.startMs <= ms && c.endMs > ms,
  );
  if (!caption) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 190,
        right: 190,
        bottom: 35,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: C.ink,
          color: C.paper,
          padding: "16px 30px",
          fontFamily: "DM Sans",
          fontSize: 34,
          lineHeight: 1.3,
          textAlign: "center",
          borderRadius: 10,
          maxWidth: 1460,
          boxSizing: "border-box",
        }}
      >
        {caption.text}
      </div>
    </div>
  );
};
