import React from "react";
import { CanvasImage, staticFile, useCurrentFrame } from "remotion";
import { C, Note, Shell, Title, mono } from "../shared";
import proof from "../../../evidence/mainnet-proof.json";
export const Receipts: React.FC<{ duration: number }> = ({ duration }) => {
  const f = useCurrentFrame();
  const settle = f > duration * 0.45;
  return (
    <Shell step="Inspect the real transactions">
      <Title kicker="Public Arc explorer" title={"Two receipts.\nOne room."}>
        <Note>
          {settle
            ? "The settlement contains both USDC transfers."
            : "The opening locks payout plus bounty."}
        </Note>
        <div
          style={{
            fontSize: 24,
            lineHeight: 1.45,
            color: C.accent,
            marginTop: 36,
          }}
        >
          explorer.arc.io/tx/
          <div
            style={{
              fontFamily: mono,
              fontSize: 22,
              overflowWrap: "anywhere",
              maxWidth: 610,
              marginTop: 10,
            }}
          >
            {settle ? proof.settleTransaction : proof.openTransaction}
          </div>
        </div>
        <div style={{ fontSize: 25, color: C.muted, marginTop: 24 }}>
          Full links in the transcript and video README.
        </div>
      </Title>
      <div
        style={{
          position: "absolute",
          left: 800,
          top: 180,
          width: 1050,
          height: 710,
          overflow: "hidden",
          border: `1px solid ${C.line}`,
          borderRadius: 18,
          background: C.paper,
        }}
      >
        <div
          style={{
            height: 58,
            display: "flex",
            alignItems: "center",
            paddingLeft: 24,
            fontSize: 25,
            color: C.accent,
            background: C.wash,
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          {settle
            ? "Settlement · existing transaction"
            : "Opening · existing transaction"}
        </div>
        <CanvasImage
          src={staticFile(
            "captures/" +
              (settle ? "settle-explorer" : "open-explorer") +
              ".png",
          )}
          style={{ position: "absolute", top: 58, width: 1280, left: -205 }}
        />
      </div>
    </Shell>
  );
};
