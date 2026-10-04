import { test, expect, type Page } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
import { decodeFunctionData, encodeFunctionResult, toHex, parseAbi } from "viem";
const artifact = JSON.parse(readFileSync("src/porter-artifact.json", "utf8"));
const pin = JSON.parse(readFileSync("evidence/deployment.json", "utf8"));
const proof = JSON.parse(readFileSync("evidence/mainnet-proof.json", "utf8"));

const token = "0x3600000000000000000000000000000000000000";
const sender = proof.sender;
function expectedRuntime() {
  let bytes = artifact.runtime.replace(/^0x/, "");
  for (const refs of Object.values(artifact.immutableReferences) as {start: number; length: number}[][])
    for (const ref of refs) bytes = bytes.slice(0, ref.start * 2) + token.slice(2).padStart(64, "0") + bytes.slice((ref.start + ref.length) * 2);
  return `0x${bytes}`;
}
const abi = parseAbi([
  "function decimals() view returns(uint8)", "function balanceOf(address) view returns(uint256)",
  "function allowance(address,address) view returns(uint256)", "function approve(address,uint256) returns(bool)",
]);
const screenshots = "evidence/browser/redesign";
mkdirSync(screenshots, { recursive: true });

async function fixture(page: Page, options: { empty?: boolean; due?: boolean; wallet?: boolean; wrongChain?: boolean; pending?: boolean; unpinned?: boolean; exactAllowance?: boolean } = {}) {
  const writes: { method: string; params: any[] }[] = [];
  const timestamp = Math.floor(Date.now() / 1000);
  const dueAt = options.due ? timestamp - 60 : Number(proof.dueAt);
  await page.route("https://rpc.mainnet.arc.io/**", async route => {
    const requests = JSON.parse(route.request().postData()!);
    function reply(request: any) {
      const { method, params = [] } = request;
      let result: any;
      if (/send|sign|wallet/i.test(method)) throw new Error("Public RPC writes forbidden in browser checks");
      switch (method) {
        case "eth_chainId": result = "0x13b2"; break;
        case "eth_getCode": result = expectedRuntime(); break;
        case "eth_blockNumber": result = "0x1717463"; break;
        case "eth_getBalance": result = toHex(1000000000000000000n); break;
        case "eth_estimateGas": result = toHex(100000n); break;
        case "eth_maxPriorityFeePerGas": result = toHex(1000000000n); break;
        case "eth_gasPrice": result = toHex(20000000000n); break;
        case "eth_getBlockByNumber": result = {
          number: "0x1717463", timestamp: toHex(timestamp), baseFeePerGas: toHex(20000000000n),
          hash: "0x" + "11".repeat(32), parentHash: "0x" + "00".repeat(32),
          gasLimit: toHex(30000000n), gasUsed: "0x0", size: "0x0", difficulty: "0x0", totalDifficulty: "0x0",
          transactions: [], uncles: [], miner: sender, extraData: "0x", nonce: "0x0000000000000000",
        }; break;
        case "eth_getTransactionReceipt": result = {
          transactionHash: proof.openTransaction, transactionIndex: "0x0", blockHash: "0x" + "11".repeat(32), blockNumber: "0x1717463",
          from: sender, to: pin.address, cumulativeGasUsed: toHex(216518n), gasUsed: toHex(216518n), effectiveGasPrice: toHex(20000000000n),
          contractAddress: null, status: "0x1", type: "0x2", logs: [], logsBloom: "0x" + "00".repeat(256),
        }; break;
        case "eth_call": {
          const contract = params[0].to.toLowerCase() === token.toLowerCase() ? abi : artifact.abi;
          const decoded = decodeFunctionData({ abi: contract, data: params[0].data });
          const value: Record<string, any> = {
            usdc: token, decimals: 6, balanceOf: 1000000n, allowance: options.exactAllowance ? 110000n : 0n,
            roomCount: options.empty ? 0n : 1n,
            rooms: [sender, sender, 100000n, 10000n, BigInt(dueAt), !options.due],
          };
          if (!(decoded.functionName in value)) throw new Error("Unexpected read: " + decoded.functionName);
          result = encodeFunctionResult({ abi: contract, functionName: decoded.functionName, result: value[decoded.functionName] });
          break;
        }
        default: throw new Error("Unexpected RPC method: " + method);
      }
      return { jsonrpc: "2.0", id: request.id, result };
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(Array.isArray(requests) ? requests.map(reply) : reply(requests)) });
  });
  if (options.unpinned) {
    await page.route("**/assets/index-*.js", async route => {
      const response = await route.fetch();
      let body = await response.text();
      const addressPattern = new RegExp("address:([`\"'])" + pin.address + "\\1");
      const statusPattern = /status:([`"'])confirmed\1/;
      expect(addressPattern.test(body)).toBe(true);
      expect(statusPattern.test(body)).toBe(true);
      body = body.replace(addressPattern, "address:null").replace(statusPattern, 'status:"not-established"');
      await route.fulfill({ response, body });
    });
  }
  await page.exposeFunction("recordWalletRequest", (request: { method: string; params: any[] }) => writes.push(request));
  await page.addInitScript(({ options, sender, openHash }) => {
    if (options.pending) sessionStorage.setItem("porter.pending", JSON.stringify({ hash: openHash, action: "Open room", status: "submitted" }));
    if (options.wallet) {
      let chain = options.wrongChain ? "0x1" : "0x13b2";
      const listeners = new Map<string, Function[]>();
      (window as any).ethereum = {
        request: async ({ method, params = [] }: any) => {
          if (method === "eth_requestAccounts" || method === "eth_accounts") return [sender];
          if (method === "eth_chainId") return chain;
          await (window as any).recordWalletRequest({ method, params });
          if (method === "wallet_switchEthereumChain") { chain = "0x13b2"; listeners.get("chainChanged")?.forEach(f => f(chain)); return null; }
          throw Object.assign(new Error("Mock wallet rejects signing; no transaction sent."), { code: 4001 });
        },
        on: (event: string, callback: Function) => listeners.set(event, [...(listeners.get(event) || []), callback]),
        removeListener: (event: string, callback: Function) => listeners.set(event, (listeners.get(event) || []).filter(f => f !== callback)),
      };
    }
    document.addEventListener("DOMContentLoaded", () => {
      const banner = document.createElement("div");
      banner.textContent = "BROWSER FIXTURE — wallet and RPC values are mocked; no signatures or transactions";
      banner.style.cssText = "padding:12px;background:#20332b;color:white;font:600 12px sans-serif;text-align:center";
      document.body.prepend(banner);
    });
  }, { options, sender, openHash: proof.openTransaction });
  return writes;
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const button of await page.locator("button:visible").all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
}

for (const scheme of ["light", "dark"] as const) {
  test(`${scheme}: proved page, empty form, keyboard focus and responsive layout`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await fixture(page);
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expect(page.getByText("Runtime + USDC verified", { exact: true })).toBeVisible();
      await expect(page.locator(`a[href="${pin.explorer}"]`)).toHaveText(new RegExp(pin.address));
      await expect(page.locator(`a[href="${proof.openUrl}"]`)).toBeVisible();
      await expect(page.locator(`a[href="${proof.settleUrl}"]`)).toBeVisible();
      await expect(page.getByText("0.00171944 USDC", { exact: true })).toBeVisible();
      await expect(page.getByText(/The sender also settled; the payee and caller/)).toBeVisible();
      await expect(page.getByRole("button", { name: "Fund and open room" })).toBeDisabled();
      await noOverflow(page);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${screenshots}/proved-${scheme}-${width}.png`, fullPage: true });
    }
    await page.getByRole("button", { name: "Connect wallet", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("No browser wallet found");
    await page.getByLabel("Payee wallet").fill("bad");
    await expect(page.getByText("Enter a valid payee wallet address.", { exact: true })).toBeVisible();
    await page.getByLabel("Payee wallet").fill(sender);
    await page.getByLabel("Payout · USDC").fill("0.0000001");
    await expect(page.getByText("Use a positive USDC amount with at most 6 decimal places.", { exact: true })).toBeVisible();
    await page.getByLabel("Payee wallet").focus();
    expect(await page.getByLabel("Payee wallet").evaluate(el => getComputedStyle(el).outlineStyle)).toBe("solid");
    await page.getByLabel("Payout · USDC").fill("1000000000000000000");
    await noOverflow(page);
    expect(errors).toEqual([]);
  });
}

test("empty queue and connected wallet retain exact approval and network switch", async ({ page }) => {
  const writes = await fixture(page, { empty: true, wallet: true, wrongChain: true });
  await page.goto("/");
  await expect(page.getByText("No rooms opened yet", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Connect wallet", exact: true }).click();
  await page.getByRole("button", { name: "Switch to Arc · 5042" }).click();
  await page.getByRole("button", { name: /^Reconnect|^Connect wallet$/ }).click();
  await expect(page.getByText("1 USDC available · one balance for payment and gas", { exact: true })).toBeVisible();
  await page.getByLabel("Payee wallet").fill(sender);
  await page.getByRole("button", { name: "Approve exactly 0.11 USDC" }).click();
  await expect(page.getByRole("alert")).toContainText("User rejected the request");
  const approval = writes.find(r => r.method === "eth_sendTransaction");
  expect(approval).toBeTruthy();
  const decoded = decodeFunctionData({ abi, data: approval!.params[0].data });
  expect(decoded.functionName).toBe("approve");
  expect(String(decoded.args![0]).toLowerCase()).toBe(pin.address.toLowerCase());
  expect(decoded.args![1]).toBe(110000n);
  expect(writes.find(r => r.method === "wallet_switchEthereumChain")!.params).toEqual([{ chainId: "0x13b2" }]);
  await page.setViewportSize({ width: 390, height: 900 });
  await noOverflow(page);
  await page.screenshot({ path: `${screenshots}/connected-empty-fixture.png`, fullPage: true });
});

test("due room fee and funding requests preserve terms without signing", async ({ page }) => {
  const writes = await fixture(page, { wallet: true, due: true, exactAllowance: true });
  await page.goto("/");
  await expect(page.getByText("Runtime + USDC verified", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Connect wallet", exact: true }).click();
  await page.getByLabel("Payee wallet").fill(sender);
  await page.getByRole("button", { name: "Fund and open room" }).click();
  await expect(page.getByRole("alert")).toContainText("User rejected the request");
  const opening = writes.find(r => r.method === "eth_sendTransaction")!;
  const opened = decodeFunctionData({ abi: artifact.abi, data: opening.params[0].data });
  expect(opened.functionName).toBe("openRoom");
  expect(String(opened.args![0]).toLowerCase()).toBe(sender.toLowerCase());
  expect(opened.args!.slice(1, 3)).toEqual([100000n, 10000n]);
  await page.getByRole("button", { name: "Estimate settle fee" }).click();
  await expect(page.getByText(/native base units · 18 decimals/)).toBeVisible();
  await expect(page.getByText(/Estimate, not a receipt/)).toBeVisible();
  await page.getByRole("button", { name: "Settle · collect 0.01 USDC" }).click();
  await expect(page.getByRole("alert")).toContainText("User rejected the request");
  const settlement = writes.filter(r => r.method === "eth_sendTransaction").at(-1)!;
  const decoded = decodeFunctionData({ abi: artifact.abi, data: settlement.params[0].data });
  expect(decoded.functionName).toBe("settle");
  expect(decoded.args).toEqual([1n, 100000n, 10000n]);
  await page.setViewportSize({ width: 320, height: 900 });
  await noOverflow(page);
  await page.screenshot({ path: `${screenshots}/fee-fixture-320.png`, fullPage: true });
});

test("known pending receipt can recover without any wallet request", async ({ page }) => {
  const writes = await fixture(page, { pending: true });
  await page.goto("/");
  await expect(page.getByText(/New signatures are paused/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect wallet", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Check confirmation" }).click();
  await expect(page.getByText(/Transaction confirmed. State refreshed/)).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("porter.pending"))).toBeNull();
  expect(writes).toEqual([]);
});

test("unpinned layout keeps the operator control secondary and disabled without wallet", async ({ page }) => {
  await fixture(page, { unpinned: true, empty: true });
  await page.goto("/");
  await expect(page.getByText("No pinned mainnet address yet", { exact: true })).toBeVisible();
  await expect(page.getByText("Default room · not a receipt", { exact: true })).toBeVisible();
  await page.getByText("Operator setup · deploy with your own wallet").click();
  await expect(page.getByRole("button", { name: "Deploy Porter · wallet signature" })).toBeDisabled();
  await page.setViewportSize({ width: 320, height: 900 });
  await noOverflow(page);
});
