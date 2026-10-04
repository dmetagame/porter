import React from "react";
import { Frame, Note, Shell, Title } from "../shared";
export const Intro: React.FC = () => (
  <Shell step="Scheduled USDC payments">
    <Title
      kicker="An early payment prototype"
      title={"One lock.\nTwo payments."}
    >
      <Note>A scheduled payout and caller bounty, together on Arc.</Note>
      <div style={{ fontSize: 32, fontWeight: 600 }}>
        Payout, bounty and gas. All USDC.
      </div>
    </Title>
    <Frame
      src="overview"
      label="porter-gilt.vercel.app · live app capture"
      x={765}
      y={250}
      width={1080}
      height={605}
    />
  </Shell>
);
