import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { encodeFunctionData, parseAbi } from "viem";

const token = "0x3600000000000000000000000000000000000000";
const sender = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const caller = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const payee = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const url = "http://127.0.0.1:18542";
async function rpc(method: string, params: unknown[] = []) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = await response.json();
  if (body.error) throw new Error(JSON.stringify(body.error));
  return body.result;
}
test("unsigned production app has honest desktop/mobile and validation states", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page).toHaveTitle(/Porter/);
  await expect(page.getByText("No pinned mainnet address yet")).toBeVisible();
  await expect(
    page.getByText("Mainnet proof does not exist yet", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fund and open room" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Connect wallet", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "No browser wallet found",
  );
  await page.getByLabel("Payee wallet").fill("bad");
  await expect(
    page.getByText("Enter a valid payee wallet address.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Payee wallet").fill(payee);
  await page.getByLabel("Payout · USDC").fill("0.0000001");
  await expect(
    page.getByText(
      "Use a positive USDC amount with at most 6 decimal places.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByLabel("Payout · USDC").fill("0.10");
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  mkdirSync("evidence/browser", { recursive: true });
  await page.screenshot({
    path: "evidence/browser/desktop-unsigned.png",
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Connect wallet", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: `evidence/browser/mobile-${width}-unsigned.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});

test("local EVM fixture exercises wallet deployment, exact funding, due gating and distinct caller settlement", async ({
  page,
}) => {
  // Unlocked Anvil accounts; no key or seed is stored, printed, or passed into the browser.
  // Mainnet RPC requests are explicitly intercepted ONLY in this isolated local test.
  const anvil = spawn(
    process.env.ANVIL_BIN || "anvil",
    ["--port", "18542", "--chain-id", "5042", "--silent"],
    { stdio: "ignore" },
  );
  try {
    let started = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      try {
        await rpc("eth_chainId");
        started = true;
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    expect(started).toBe(true);
    const mock = JSON.parse(
      readFileSync("out/Porter.t.sol/TestUSDC.json", "utf8"),
    );
    await rpc("anvil_setCode", [token, mock.deployedBytecode.object]);
    await rpc("eth_sendTransaction", [
      {
        from: sender,
        to: token,
        data: encodeFunctionData({
          abi: parseAbi(["function mint(address,uint256)"]),
          functionName: "mint",
          args: [sender, 1000000n],
        }),
      },
    ]);
    await page.route("https://rpc.mainnet.arc.io/**", async (route) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: route.request().postData(),
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: await response.text(),
      });
    });
    await page.addInitScript(
      ({ sender, rpcUrl }) => {
        let selected = sender;
        const listeners = new Map<string, ((...args: unknown[]) => void)[]>();
        const win = window as unknown as {
          ethereum: unknown;
          porterFixtureAccount: (address: string) => void;
        };
        win.ethereum = {
          request: async ({
            method,
            params,
          }: {
            method: string;
            params?: unknown[];
          }) => {
            if (method === "eth_requestAccounts" || method === "eth_accounts")
              return [selected];
            if (
              method === "wallet_switchEthereumChain" ||
              method === "wallet_addEthereumChain"
            )
              return null;
            const res = await fetch(rpcUrl, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method,
                params: params || [],
              }),
            });
            const data = await res.json();
            if (data.error)
              throw Object.assign(new Error(data.error.message), data.error);
            return data.result;
          },
          on: (event: string, callback: (...args: unknown[]) => void) =>
            listeners.set(event, [...(listeners.get(event) || []), callback]),
          removeListener: (
            event: string,
            callback: (...args: unknown[]) => void,
          ) =>
            listeners.set(
              event,
              (listeners.get(event) || []).filter((item) => item !== callback),
            ),
        };
        win.porterFixtureAccount = (address: string) => {
          selected = address;
          listeners
            .get("accountsChanged")
            ?.forEach((callback) => callback([address]));
        };
        document.addEventListener("DOMContentLoaded", () => {
          const label = document.createElement("div");
          label.textContent = "LOCAL EVM FIXTURE — NOT ARC MAINNET PROOF";
          label.style.cssText =
            "background:#903022;color:#fff;padding:14px;text-align:center;font:700 14px sans-serif";
          document.body.prepend(label);
        });
      },
      { sender, rpcUrl: url },
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page
      .getByRole("button", { name: "Connect wallet", exact: true })
      .click();
    await expect(
      page.getByText("1 USDC available · one balance for payment and gas"),
    ).toBeVisible();
    await page
      .getByText("Operator setup · deploy with your own wallet")
      .click();
    await page
      .getByRole("button", { name: "Deploy Porter · wallet signature" })
      .click();
    await expect(
      page.getByText("Runtime + USDC verified", { exact: true }),
    ).toBeVisible({ timeout: 20000 });
    await page.getByLabel("Payee wallet").fill(payee);
    await page
      .getByRole("button", { name: "Approve exactly 0.11 USDC" })
      .click();
    await expect(
      page.getByText("Confirmed exact allowance: 0.11 USDC."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Fund and open room" }).click();
    await expect(
      page.getByRole("heading", { name: "Room #1", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Estimate settle fee" }),
    ).toBeDisabled();
    await rpc("evm_increaseTime", [70]);
    await rpc("evm_mine");
    await page.evaluate(
      (caller) =>
        (
          window as unknown as { porterFixtureAccount: (a: string) => void }
        ).porterFixtureAccount(caller),
      caller,
    );
    await page
      .getByRole("button", { name: /^Reconnect|^Connect wallet$/ })
      .click();
    // UI's local clock may lag the accelerated chain; refresh uses the chain data.
    await page.clock.install({ time: new Date(Date.now() + 120000) });
    await page.clock.runFor(1200);
    await page.getByRole("button", { name: "Estimate settle fee" }).click();
    await expect(
      page.getByText(/native base units · 18 decimals/),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Settle · collect 0.01 USDC" })
      .click();
    await expect(
      page.getByText(/A distinct caller wallet settled/),
    ).toBeVisible();
    await expect(page.getByText("Settled", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Settle · collect 0.01 USDC" }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Mainnet proof does not exist yet", { exact: true }),
    ).toBeVisible();
    const abi = parseAbi([
      "function balanceOf(address) view returns (uint256)",
    ]);
    const payeeBalance = await rpc("eth_call", [
      {
        to: token,
        data: encodeFunctionData({
          abi,
          functionName: "balanceOf",
          args: [payee],
        }),
      },
      "latest",
    ]);
    const callerBalance = await rpc("eth_call", [
      {
        to: token,
        data: encodeFunctionData({
          abi,
          functionName: "balanceOf",
          args: [caller],
        }),
      },
      "latest",
    ]);
    expect(BigInt(payeeBalance)).toBe(100000n);
    expect(BigInt(callerBalance)).toBe(10000n);
    await page.screenshot({
      path: "evidence/browser/local-evm-fixture-settled.png",
      fullPage: true,
    });
    expect(errors).toEqual([]);
  } finally {
    anvil.kill("SIGTERM");
  }
});
