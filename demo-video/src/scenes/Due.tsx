import React from "react";
import { C, Frame, Note, Pill, Shell, Title } from "../shared";
export const Due: React.FC = () => (
  <Shell step="Wait, then settle" badge="Mechanism explained">
    <Title
      kicker="No scheduled automation"
      title={"Anyone can settle\nonce it is due."}
    >
      <Note>
        The caller checks the fee and signs. Both transfers must succeed
        together.
      </Note>
      <Pill>One successful settlement per room</Pill>
      <div style={{ fontSize: 25, color: C.muted, marginTop: 24 }}>
        The caller needs real USDC for gas up front.
      </div>
    </Title>
    <Frame
      src="room"
      label="Existing room #1 · already settled"
      x={820}
      y={265}
      width={1020}
      height={532}
    />
  </Shell>
);
