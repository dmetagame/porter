// Explicit one-run operator script. Reads .env only in memory, never logs errors
// containing signing material, and refuses to repeat a recorded run.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  createPublicClient, createWalletClient, defineChain, http, parseAbi,
  encodeDeployData, encodeFunctionData, getAddress, getContractAddress,
  zeroAddress, formatUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { artifact, USDC, RPC, events, verifyRuntime } from "./arc.mjs";

const chain = defineChain({
  id: 5042, name: "Arc", nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
});
const client = createPublicClient({ chain, transport: http(RPC, { timeout: 20000, retryCount: 0 }) });
const tokenAbi = parseAbi([
  "function balanceOf(address) view returns(uint256)",
  "function decimals() view returns(uint8)",
  "function allowance(address,address) view returns(uint256)",
  "function approve(address,uint256) returns(bool)",
]);
const journalPath = "evidence/mainnet-run.json";
const payout = 100000n, bounty = 10000n, funding = payout + bounty;
let stage = "repository and secret safeguards";
let journal;
const requireThat = (condition) => { if (!condition) throw new Error("guard"); };
const save = () => writeFileSync(journalPath, JSON.stringify(journal, null, 2) + "\n");

function credentials() {
  const text = readFileSync(".env", "utf8");
  const read = (name) => {
    const matches = [...text.matchAll(new RegExp("^\\s*(?:export\\s+)?" + name + "\\s*=\\s*(.*?)\\s*$", "gm"))];
    requireThat(matches.length <= 1);
    if (!matches.length) return undefined;
    let value = matches[0][1].trim();
    if (value.startsWith('"') || value.startsWith("'")) {
      const end = value.indexOf(value[0], 1);
      requireThat(end > 0);
      value = value.slice(1, end);
    } else value = value.split(/\s+#/)[0].trim();
    return value;
  };
  const key = read("PORTER_DEPLOYER_PRIVATE_KEY");
  requireThat(/^0x[0-9a-fA-F]{64}$/.test(key || ""));
  const account = privateKeyToAccount(key);
  const recipient = read("PORTER_PAYEE_ADDRESS");
  return { account, payee: recipient ? getAddress(recipient) : account.address };
}

async function main() {
  requireThat(execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim() === process.cwd());
  execFileSync("git", ["check-ignore", ".env"], { stdio: "pipe" });
  requireThat(execFileSync("git", ["status", "--short", "--untracked-files=all", "--", ".env"], { encoding: "utf8" }).trim() === "");
  requireThat(execFileSync("git", ["ls-files", "--", ".env"], { encoding: "utf8" }).trim() === "");
  requireThat(execFileSync("git", ["remote", "get-url", "--push", "origin"], { encoding: "utf8" }).trim() === "https://github.com/dmetagame/porter.git");
  requireThat(!existsSync(journalPath));
  requireThat(!JSON.parse(readFileSync("evidence/deployment.json", "utf8")).address);
  const identity = credentials();
  const sender = identity.account.address;
  const payee = identity.payee;
  requireThat(payee !== zeroAddress && getAddress(payee) !== getAddress(USDC));
  requireThat(await client.getChainId() === 5042);
  requireThat(await client.readContract({ address: USDC, abi: tokenAbi, functionName: "decimals" }) === 6);
  const deployData = encodeDeployData({ abi: artifact.abi, bytecode: artifact.bytecode, args: [USDC] });
  stage = "full-run balance preflight";
  const estimate = await client.estimateGas({ account: sender, data: deployData, value: 0n });
  const caps = [(estimate * 120n + 99n) / 100n, 200000n, 400000n, 250000n];

  async function budget(index) {
    requireThat(await client.getChainId() === 5042);
    const [native, token, fees] = await Promise.all([
      client.getBalance({ address: sender }),
      client.readContract({ address: USDC, abi: tokenAbi, functionName: "balanceOf", args: [sender] }),
      client.estimateFeesPerGas(),
    ]);
    requireThat(fees.maxFeePerGas > 0n && fees.maxPriorityFeePerGas <= fees.maxFeePerGas);
    const reserved = caps.slice(index).reduce((a, b) => a + b, 0n) * fees.maxFeePerGas;
    const remainingFunding = index <= 2 ? funding : 0n;
    requireThat(native >= remainingFunding * 1000000000000n + reserved);
    requireThat(token >= remainingFunding + (reserved + 999999999999n) / 1000000000000n);
    return fees;
  }
  await budget(0);
  journal = { project: "Porter", chainId: 5042, token: USDC, sender, payee, caller: sender,
    senderAlsoSettled: true, builderControlled: true, independentUse: false,
    payoutBaseUnits: payout.toString(), bountyBaseUnits: bounty.toString(),
    startedAt: new Date().toISOString(), status: "in-progress", transactions: {} };
  save();

  async function send(name, index, request) {
    stage = name + " pre-sign checks";
    const fees = await budget(index);
    const gasEstimate = await client.estimateGas({ ...request, account: sender, value: 0n });
    const gas = (gasEstimate * 120n + 99n) / 100n;
    requireThat(gas <= caps[index]);
    const [nonce, minedNonce] = await Promise.all([
      client.getTransactionCount({ address: sender, blockTag: "pending" }),
      client.getTransactionCount({ address: sender, blockTag: "latest" }),
    ]);
    requireThat(nonce === minedNonce);
    if (name === "deployment") requireThat(payee !== getContractAddress({ from: sender, nonce: BigInt(nonce) }));
    // Re-read .env at this signing boundary; no key in argv, environment exports,
    // logs, journal, request metadata, or persisted wallet configuration.
    const { account, payee: currentPayee } = credentials();
    requireThat(account.address === sender && currentPayee === payee);
    const wallet = createWalletClient({ account, chain, transport: http(RPC, { timeout: 20000, retryCount: 0 }) });
    stage = name + " signing/broadcast";
    const hash = await wallet.sendTransaction({ ...request, account, chain, nonce, value: 0n, gas,
      maxFeePerGas: fees.maxFeePerGas, maxPriorityFeePerGas: fees.maxPriorityFeePerGas });
    journal.transactions[name] = { hash, status: "submitted" };
    save();
    console.log(name + " submitted: " + hash);
    stage = name + " receipt check";
    const receipt = await client.waitForTransactionReceipt({ hash, timeout: 180000 });
    journal.transactions[name] = { hash, status: receipt.status, blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed.toString(), gasCostUSDC: formatUnits(receipt.gasUsed * receipt.effectiveGasPrice, 18) };
    save();
    requireThat(receipt.status === "success");
    console.log(name + " confirmed.");
    return receipt;
  }

  const deployment = await send("deployment", 0, { data: deployData });
  requireThat(deployment.contractAddress);
  const address = getAddress(deployment.contractAddress);
  journal.contract = address;
  save();
  stage = "deployed runtime/token verification";
  await verifyRuntime(address);
  await send("approval", 1, { to: USDC, data: encodeFunctionData({ abi: tokenAbi, functionName: "approve", args: [address, funding] }) });
  requireThat(await client.readContract({ address: USDC, abi: tokenAbi, functionName: "allowance", args: [sender, address] }) === funding);
  const dueAt = (await client.getBlock()).timestamp + 60n;
  const opening = await send("opening", 2, { to: address, data: encodeFunctionData({ abi: artifact.abi, functionName: "openRoom", args: [payee, payout, bounty, dueAt] }) });
  const opened = events(opening, address, artifact.abi).find((e) => e.eventName === "RoomOpened");
  requireThat(opened && opened.args.payout === payout && opened.args.bounty === bounty && opened.args.dueAt === dueAt);
  journal.roomId = opened.args.roomId.toString();
  journal.dueAt = dueAt.toString();
  save();
  stage = "waiting for room due time";
  console.log("Room #" + journal.roomId + " due at " + dueAt + "; waiting for Arc block time.");
  const deadline = Date.now() + 180000;
  while ((await client.getBlock()).timestamp < dueAt) {
    requireThat(Date.now() < deadline);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  await send("settlement", 3, { to: address, data: encodeFunctionData({ abi: artifact.abi, functionName: "settle", args: [opened.args.roomId, payout, bounty] }) });
  journal.status = "transactions-confirmed-awaiting-proof-tools";
  journal.completedAt = new Date().toISOString();
  save();
  console.log("All four Arc transactions confirmed. Sender also settled. Run pin and evidence validators next.");
}

main().catch(() => {
  if (journal) { journal.status = "stopped"; journal.stoppedAtStage = stage; save(); }
  console.error("STOP: " + stage + " failed. Error details suppressed to protect signing material. Do not rerun or deploy a replacement; inspect public journal receipts.");
  process.exitCode = 1;
});
