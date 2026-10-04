import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
export const C = {
  canvas: "#f1f4f0",
  paper: "#ffffff",
  ink: "#20332b",
  muted: "#526359",
  line: "#c9d4cc",
  accent: "#275942",
  wash: "#e4ede4",
};
export const mono = "JetBrains Mono, monospace";
export const Brand: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      fontWeight: 700,
      fontSize: size,
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M14 3v9M6 23v-7h16v7M14 12v4" />
      <circle cx="14" cy="3" r="2" />
      <circle cx="6" cy="23" r="2" />
      <circle cx="22" cy="23" r="2" />
    </svg>
    Porter
  </div>
);
export const Shell: React.FC<{
  step: string;
  children: React.ReactNode;
  badge?: string;
}> = ({ step, children, badge = "Existing mainnet proof" }) => (
  <AbsoluteFill
    style={{
      background: C.canvas,
      color: C.ink,
      fontFamily: "DM Sans, sans-serif",
      padding: 64,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: `1px solid ${C.line}`,
        paddingBottom: 24,
      }}
    >
      <Brand />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          fontSize: 24,
          color: C.muted,
        }}
      >
        <span>{step}</span>
        <span
          style={{
            border: `1px solid ${C.line}`,
            borderRadius: 100,
            padding: "10px 22px",
            background: C.paper,
          }}
        >
          {badge}
        </span>
      </div>
    </div>
    {children}
  </AbsoluteFill>
);
export const Title: React.FC<{
  kicker: string;
  title: string;
  children?: React.ReactNode;
}> = ({ kicker, title, children }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 225,
        width: 660,
        opacity: interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" }),
        translate: `0 ${interpolate(f, [0, 16], [12, 0], { extrapolateRight: "clamp" })}px`,
      }}
    >
      <div
        style={{
          fontSize: 24,
          letterSpacing: 2,
          color: C.accent,
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 26,
        }}
      >
        {kicker}
      </div>
      <Interactive.H1
        name="Scene title"
        style={{
          fontSize: 80,
          lineHeight: 1.08,
          fontWeight: 600,
          letterSpacing: -3,
          whiteSpace: "pre-line",
          margin: "0 0 32px",
        }}
      >
        {title}
      </Interactive.H1>
      {children}
    </div>
  );
};
export const Frame: React.FC<{
  src: string;
  label: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  imageWidth?: number;
  imageY?: number;
}> = ({
  src,
  label,
  x = 830,
  y = 185,
  width = 1010,
  height = 660,
  imageWidth,
  imageY = 0,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      border: `1px solid ${C.line}`,
      borderRadius: 18,
      overflow: "hidden",
      background: C.paper,
      boxShadow: "0 18px 50px rgba(32,51,43,0.08)",
    }}
  >
    <div
      style={{
        height: 58,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "0 22px",
        background: C.wash,
        borderBottom: `1px solid ${C.line}`,
        fontSize: 22,
        color: C.muted,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 10,
            background: C.line,
          }}
        />
      ))}
      <span style={{ marginLeft: 18 }}>{label}</span>
    </div>
    <div
      style={{ height: height - 58, overflow: "hidden", position: "relative" }}
    >
      <CanvasImage
        src={staticFile("captures/" + src + ".png")}
        style={{
          display: "block",
          width: imageWidth || width,
          position: "absolute",
          top: imageY,
          left: 0,
        }}
      />
    </div>
  </div>
);
export const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    style={{
      fontSize: 31,
      lineHeight: 1.5,
      color: C.muted,
      maxWidth: 630,
      margin: "28px 0",
    }}
  >
    {children}
  </p>
);
export const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "inline-block",
      padding: "12px 18px",
      border: `1px solid ${C.line}`,
      borderRadius: 8,
      background: C.wash,
      fontSize: 25,
      fontWeight: 600,
      marginTop: 16,
    }}
  >
    {children}
  </div>
);
