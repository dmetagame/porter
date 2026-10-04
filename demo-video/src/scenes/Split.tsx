import React from "react";
import { Frame, Note, Pill, Shell, Title } from "../shared";
export const Split: React.FC = () => (
  <Shell step="Existing Arc receipt · room 1">
    <Title kicker="Recorded payment" title={"0.11 USDC\nlocked together."}>
      <div style={{ fontSize: 45, lineHeight: 1.4, marginTop: 35 }}>
        0.10 to the payee.
        <br />
        0.01 to the caller.
      </div>
      <Note>
        Paid in the same transaction. These are the existing proof figures.
      </Note>
      <Pill>Builder-controlled test</Pill>
    </Title>
    <Frame
      src="receipt"
      label="Porter · actual mainnet receipt panel"
      x={950}
      y={160}
      width={880}
      height={775}
    />
  </Shell>
);
