import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { loadFont } from "@remotion/fonts";
import timeline from "./timeline.json";
import { CaptionTrack } from "./CaptionTrack";
import { Intro } from "./scenes/Intro";
import { Funding } from "./scenes/Funding";
import { Due } from "./scenes/Due";
import { Split } from "./scenes/Split";
import { Receipts } from "./scenes/Receipts";
import { Gas } from "./scenes/Gas";
import { Disclosure } from "./scenes/Disclosure";
import { Close } from "./scenes/Close";
void Promise.all([
  loadFont({
    family: "DM Sans",
    url: staticFile("fonts/dm-sans-latin-400-normal.woff2"),
    weight: "400",
  }),
  loadFont({
    family: "DM Sans",
    url: staticFile("fonts/dm-sans-latin-600-normal.woff2"),
    weight: "600",
  }),
  loadFont({
    family: "DM Sans",
    url: staticFile("fonts/dm-sans-latin-700-normal.woff2"),
    weight: "700",
  }),
  loadFont({
    family: "JetBrains Mono",
    url: staticFile("fonts/jetbrains-mono-latin-400-normal.woff2"),
    weight: "400",
  }),
]);
export const PorterDemo: React.FC = () => (
  <AbsoluteFill>
    <TransitionSeries>
      <TransitionSeries.Sequence name="Porter overview" durationInFrames={297}>
        <Intro />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Unsigned form walkthrough"
        durationInFrames={396}
      >
        <Funding duration={396} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Due-time mechanism"
        durationInFrames={366}
      >
        <Due />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Actual payout split"
        durationInFrames={319}
      >
        <Split />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Existing explorer receipts"
        durationInFrames={337}
      >
        <Receipts duration={337} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="Actual USDC gas" durationInFrames={441}>
        <Gas />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Builder-wallet disclosure"
        durationInFrames={423}
      >
        <Disclosure />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence
        name="Product and source links"
        durationInFrames={401}
      >
        <Close />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    {timeline.scenes.map((s) => (
      <Sequence
        key={s.id}
        from={s.from + s.audioFrom}
        durationInFrames={Math.ceil(s.audioDurationSeconds * 30)}
        layout="none"
        name={"Narration · " + s.id}
      >
        <Audio src={staticFile("voice/" + s.id + ".mp3")} />
      </Sequence>
    ))}
    <CaptionTrack />
  </AbsoluteFill>
);
