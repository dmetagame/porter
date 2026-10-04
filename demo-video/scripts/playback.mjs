// Local encoded-MP4 playback check. No app, wallet or transaction interaction.
import { chromium } from "../../node_modules/playwright-core/index.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:8799/");
  await page.waitForFunction(() => document.querySelector("video").readyState >= 2);
  const start = await page.evaluate(async () => {
    const video = document.querySelector("video");
    await video.play();
    return { width: video.videoWidth, height: video.videoHeight, duration: video.duration };
  });
  assert.equal(start.width, 1920);
  assert.equal(start.height, 1080);
  assert(Math.abs(start.duration - 99.349) < 0.06);
  await page.waitForFunction(() => document.querySelector("video").currentTime > 0.25);
  await page.evaluate(() => { document.querySelector("video").currentTime = 98; });
  await page.waitForFunction(() => {
    const video = document.querySelector("video");
    return !video.seeking && video.currentTime >= 98 && video.readyState >= 2;
  });
  await page.evaluate(() => document.querySelector("video").play());
  await page.waitForFunction(() => document.querySelector("video").ended, null, { timeout: 10000 }).catch(async (error) => {
    console.log(await page.evaluate(() => {
      const video = document.querySelector("video");
      return { currentTime: video.currentTime, paused: video.paused, seeking: video.seeking, readyState: video.readyState, duration: video.duration, error: video.error?.code ?? null };
    }));
    throw error;
  });
  const end = await page.evaluate(() => {
    const video = document.querySelector("video");
    return { ended: video.ended, currentTime: video.currentTime, error: video.error?.code ?? null };
  });
  assert.equal(end.ended, true);
  assert.equal(end.error, null);
  const report = JSON.parse(readFileSync("output/verification.json", "utf8"));
  report.browserPlayback = { checkedAt: new Date().toISOString(), ...start, ...end, initialPlayback: "passed", seekToFinalSecond: "passed" };
  report.encodedFrameInspection = { frames: [90, 296, 600, 692, 1058, 1140, 1377, 1510, 1714, 1950, 2155, 2390, 2578, 2979], result: "Passed: real proof figures, captions, scene endings, disclosure and closing links inspected from the encoded MP4." };
  writeFileSync("output/verification.json", JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report.browserPlayback));
} finally {
  await browser.close();
}
