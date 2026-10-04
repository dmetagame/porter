import React from "react";
import { C, Frame, Note, Pill, Shell, Title } from "../shared";
export const Gas: React.FC = () => (
  <Shell step="One currency on Arc">
    <Title kicker="Payout, bounty and gas" title={"All USDC."}>
      <div
        style={{
          fontSize: 63,
          fontWeight: 600,
          letterSpacing: -2,
          marginTop: 40,
        }}
      >
        0.00171944<span style={{ fontSize: 26, marginLeft: 14 }}>USDC</span>
      </div>
      <div style={{ fontSize: 27, color: C.muted, marginTop: 12 }}>
        Actual gas for the recorded settlement
      </div>
      <Note>
        6-decimal transfers.
        <br />
        18-decimal native gas accounting.
      </Note>
      <Pill>Caller pays gas before receiving the bounty</Pill>
    </Title>
    <Frame
      src="receipt"
      label="Existing room #1 · measured gas, not a forecast"
      x={950}
      y={185}
      width={880}
      height={775}
    />
  </Shell>
);
