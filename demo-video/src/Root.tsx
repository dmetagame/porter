import React from "react";
import { Composition, Still, Folder } from "remotion";
import { PorterDemo } from "./PorterDemo";
import { Thumbnail } from "./Thumbnail";
import { Intro } from "./scenes/Intro";
import { Due } from "./scenes/Due";
import { Split } from "./scenes/Split";
import { Gas } from "./scenes/Gas";
import { Disclosure } from "./scenes/Disclosure";
import { Close } from "./scenes/Close";
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PorterDemo"
      component={PorterDemo}
      durationInFrames={2980}
      fps={30}
      width={1920}
      height={1080}
    />
    <Still
      id="PorterThumbnail"
      component={Thumbnail}
      width={1920}
      height={1080}
    />
    <Folder name="Porter-scenes">
      {[
        ["Intro", Intro, 297],
        ["Due", Due, 366],
        ["Split", Split, 319],
        ["Gas", Gas, 441],
        ["Disclosure", Disclosure, 423],
        ["Close", Close, 401],
      ].map(([id, component, duration]) => (
        <Composition
          key={id as string}
          id={id as string}
          component={component as React.FC}
          durationInFrames={duration as number}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}
    </Folder>
  </>
);
