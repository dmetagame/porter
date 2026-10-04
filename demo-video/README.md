# Porter demo video

A narrated walkthrough of the existing Porter app and its existing builder-controlled Arc mainnet room. Built as a separate editable Remotion project; the application, wallet, contract, deployment, proof, and hackathon blurb are unchanged.

## Deliverables

- [Download MP4](https://github.com/dmetagame/porter/raw/refs/heads/main/demo-video/output/porter-demo.mp4) — 1920×1080, 30 fps, H.264/AAC, 99.33 seconds.
- [Thumbnail](output/thumbnail.png).
- [Subtitles](output/porter-demo.srt), also burned into the video.
- [Transcript](output/TRANSCRIPT.md), including product, source and existing proof links.
- [Verification](output/verification.json), populated after encoded-output checks.

The visual style follows the user's saved MystiqueMide reference brief: a framed application walkthrough, deliberate cuts, concise narration, readable timed captions, inspectable evidence, and closing product/source links. The user approved using that saved brief; no separate named skill package or original reference video was available for inspection. Production uses the installed Remotion skill and Porter's own mineral-paper/green identity, DM Sans and JetBrains Mono. This does not claim the reference creator's tooling or voice.

## What the viewer is seeing

The app and explorer shots are real read-only browser captures. [Capture manifest](public/captures/manifest.json) records their origin and date. The funding form is filled without a wallet or signature; its 0.10+0.01 USDC values are labeled defaults. The queue shows the existing settled room, not an artificially due room. Moving across a still capture is an editorial camera pan, not a new wallet interaction.

Recorded proof: room 1 locked 0.11 USDC, paid 0.10 USDC to its payee and 0.01 USDC to its caller, and used 0.00171944 USDC in settlement gas. Sender, payee and caller were the same builder-controlled wallet. The sender also settled. No second caller, profit guarantee, keeper network, automatic execution or independent user is claimed. The editorial disclosure panel summarizes that receipt; it is labeled as editorial.

Voiceover is synthetic `en-US-GuyNeural`, generated from the public script using the installed key-free Edge TTS tool. The word-boundary timings are retained beside each MP3. Numeric gas subtitles use the exact value while narration speaks the digits. No private key, seed, token or `.env` content is used in producing the demo. No music or third-party stock footage is included. Font license files are retained in `public/fonts/`.

## Edit and render

Dependencies are isolated here; the app's package and lockfile are untouched. Node 22, Python 3, FFmpeg/ffprobe and a Chromium executable are required. Narration regeneration additionally uses `edge_tts`; already-generated audio is included, so ordinary editing/rendering needs no TTS service or credentials.

Run commands from this folder **inside the `.env`-masked namespace** shown below. Install with `npm ci`, then `npm run typecheck`. Use `npm run dev -- --no-open` to edit the composition in Remotion Studio.

```sh
bwrap --ro-bind / / \
  --bind /home/rouma/porter /home/rouma/porter --bind /tmp /tmp --dev /dev \
  --ro-bind /dev/null /home/rouma/porter/.env \
  --chdir /home/rouma/porter/demo-video \
  npm run render -- --browser-executable=/home/rouma/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome
```

The mask prevents accidental environment-file reads by tools and never reads or modifies the real `.env`. On another machine, substitute this checkout's absolute path and an available Chromium executable. Set `npm_config_cache` to a disposable writable path inside the namespace when installing.

- `scenes.json`: narrative script and storyboard.
- `scripts/capture.mjs`: captures the actual public app and explorer; it never injects a wallet. It uses the parent Porter's already-installed Playwright browser tooling.
- `scripts/narrate.py`: regenerates synthetic audio and exact word timings (`--force` to replace existing task-generated audio).
- `scripts/timeline.py`: rebuilds scene/caption JSON, transcript and SRT from those timings; exact 30-fps starts, speech padding and readable numeric gas caption.
- `src/scenes/`: separate editable scenes. `src/Root.tsx` exposes the video, thumbnail and scene compositions.
- `npm run render -- --browser-executable=PATH`: produces the MP4.
- `npm run thumbnail -- --browser-executable=PATH`: produces the thumbnail.
- `npm run verify`: checks codecs, dimensions, duration/frame count, full decoding, caption/scene/audio bounds, and records hashes.

After changing scene audio lengths, update the explicit scene duration values in `src/PorterDemo.tsx` and `src/Root.tsx` to match `src/timeline.json`; these remain visible/editable in Studio. Watch the result and inspect cut/end frames before replacing the delivered MP4. Do not change the app or proof to fit a demo.

## Existing project links

- App: https://porter-gilt.vercel.app
- Source: https://github.com/dmetagame/porter
- Contract: https://explorer.arc.io/address/0x3E92CbEe456dBcBdafaC5b2054347c36367d60d6
- Open: https://explorer.arc.io/tx/0x18ab61c5dd1c812a7bdd1096ad096e6d9bfd48b1db9bc86329db331cc2353835
- Settle: https://explorer.arc.io/tx/0x1e90ded621847c72c7ae6a45f87f6b5c73cbc4928609fde654df27071e5fb2a1

No app redeployment or DoraHacks submission was performed to produce this video.
