// Fresh read-only browser; no injected wallet and no signing requests.
import { chromium } from "../../node_modules/playwright-core/index.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const proof = JSON.parse(
  readFileSync("../evidence/mainnet-proof.json", "utf8"),
);
const pin = JSON.parse(readFileSync("../evidence/deployment.json", "utf8"));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "light",
  reducedMotion: "reduce",
});
const page = await context.newPage();
const manifest = {
  capturedAt: new Date().toISOString(),
  sourceCommit: "d2a896cfa67327b0435726cd1980501692889fe7",
  url: "https://porter-gilt.vercel.app",
  walletInjected: false,
  transactionsSigned: false,
  rpcFixtures: false,
  inputsOnly: true,
  assets: [],
};
async function shot(name, locator) {
  await locator.screenshot({ path: "public/captures/" + name + ".png" });
  manifest.assets.push({
    file: name + ".png",
    source: page.url(),
    kind: "Actual live browser capture",
    cssBounds: await locator.boundingBox(),
  });
}
try {
  const response = await page.goto(manifest.url, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200);
  await page.getByText("Runtime + USDC verified", { exact: true }).waitFor();
  assert(await page.evaluate(() => !window.ethereum));
  await page.evaluate(() => document.fonts.ready);
  assert(await page.locator(`a[href="${proof.openUrl}"]`).isVisible());
  assert(await page.locator(`a[href="${proof.settleUrl}"]`).isVisible());
  await shot("overview", page.locator(".instrument"));
  await shot("receipt", page.locator(".payment-receipt"));
  await shot("contract", page.locator(".status-strip"));
  await page.getByLabel("Payee wallet").fill(proof.payee);
  assert(
    await page
      .getByRole("button", { name: "Approve exactly 0.11 USDC" })
      .isDisabled(),
  );
  await shot("funding", page.locator(".composer"));
  await shot("room", page.locator(".room").first());
  for (const [name, url] of [
    ["open-explorer", proof.openUrl],
    ["settle-explorer", proof.settleUrl],
  ]) {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(2000);
      const text = await page.locator("body").innerText();
      if (
        !/Transaction|Success|USDC|Block/i.test(text) ||
        /security checkpoint|Verify you are human|Access denied/i.test(text)
      )
        throw Error("Explorer content unavailable");
      await page.screenshot({ path: "public/captures/" + name + ".png" });
      manifest.assets.push({
        file: name + ".png",
        source: url,
        kind: "Actual public explorer capture",
        visibleExcerpt: text.slice(0, 450),
      });
    } catch {
      manifest.assets.push({
        file: null,
        source: url,
        kind: "Explorer capture unavailable; use editorial link to the existing receipt, never fake explorer UI",
      });
    }
  }
  writeFileSync(
    "public/captures/manifest.json",
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(JSON.stringify(manifest, null, 2));
} finally {
  await browser.close();
}
