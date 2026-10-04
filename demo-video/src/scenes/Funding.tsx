import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, Frame, Note, Pill, Shell, Title } from "../shared";
export const Funding: React.FC<{ duration: number }> = ({ duration }) => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [60, duration - 100], [0, -538], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Shell step="Open a scheduled room" badge="Unsigned UI walkthrough">
      <Title
        kicker="Sender chooses the terms"
        title={"Choose the\npayee and due time."}
      >
        <div style={{ display: "flex", gap: 40, marginTop: 35 }}>
          {[
            ["0.10", "Payee payout"],
            ["0.01", "Caller bounty"],
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 62, fontWeight: 600, letterSpacing: -2 }}>
                {v}
                <span style={{ fontSize: 25, color: C.muted, marginLeft: 12 }}>
                  USDC
                </span>
              </div>
              <div style={{ fontSize: 26, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
        <Pill>Labeled defaults · total 0.11 USDC</Pill>
        <Note>
          Approve the exact total, then fund the room. No signature is made in
          this recording.
        </Note>
      </Title>
      <Frame
        src="funding"
        label="Porter · actual form, entered without signing"
        x={930}
        y={160}
        width={850}
        height={725}
        imageY={pan}
      />
    </Shell>
  );
};
