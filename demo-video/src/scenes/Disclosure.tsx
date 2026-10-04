import React from "react";
import { C, Note, Shell, Title, mono } from "../shared";
import proof from "../../../evidence/mainnet-proof.json";
export const Disclosure: React.FC = () => (
  <Shell step="Keep the proof in context">
    <Title kicker="Builder-controlled test" title={"One builder\nwallet."}>
      <Note>
        The sender, payee and caller were the same address. The sender also
        settled.
      </Note>
      <div
        style={{
          fontFamily: mono,
          fontSize: 25,
          overflowWrap: "anywhere",
          maxWidth: 590,
          lineHeight: 1.5,
        }}
      >
        {proof.sender}
      </div>
    </Title>
    <div
      style={{
        position: "absolute",
        left: 855,
        top: 220,
        width: 950,
        padding: 44,
        boxSizing: "border-box",
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: 18,
      }}
    >
      {[
        ["Sender", "Locked 0.11 USDC"],
        ["Payee", "Received 0.10 USDC"],
        ["Caller", "Received 0.01 USDC"],
      ].map(([name, label], i) => (
        <div
          key={name}
          style={{
            padding: "22px 0",
            borderBottom: i < 2 ? `1px solid ${C.line}` : "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 37, fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: 29, color: C.muted }}>{label}</span>
        </div>
      ))}
      <div
        style={{ fontSize: 31, lineHeight: 1.5, color: C.muted, marginTop: 30 }}
      >
        No keeper network.
        <br />
        No profit guarantee.
        <br />
        No evidence of independent use.
      </div>
      <div style={{ fontSize: 23, marginTop: 20, color: C.muted }}>
        Editorial summary of the existing receipt.
      </div>
    </div>
  </Shell>
);
