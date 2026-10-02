import { readFileSync } from "node:fs";
import {
  createPublicClient,
  http,
  getAddress,
  keccak256,
  encodeDeployData,
  decodeEventLog,
  parseAbi,
} from "viem";
export const USDC = "0x3600000000000000000000000000000000000000";
export const RPC = "https://rpc.mainnet.arc.io";
export const EXPLORER = "https://explorer.arc.io";
export const artifact = JSON.parse(
  readFileSync(new URL("../src/porter-artifact.json", import.meta.url), "utf8"),
);
export const client = createPublicClient({
  transport: http(RPC, { timeout: 20000 }),
});
export const tokenAbi = parseAbi([
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
export function options(args = process.argv.slice(2)) {
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i]?.startsWith("--") || !args[i + 1])
      throw new Error("Use named --option value arguments.");
    result[args[i].slice(2)] = args[i + 1];
  }
  return result;
}
export function hash(value) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(value || ""))
    throw new Error("A real 32-byte transaction hash is required.");
  return value;
}
export function runtime() {
  let bytes = artifact.runtime.replace(/^0x/, "");
  for (const refs of Object.values(artifact.immutableReferences))
    for (const { start, length } of refs) {
      if (length !== 32) throw new Error("Unexpected immutable layout.");
      bytes =
        bytes.slice(0, start * 2) +
        USDC.slice(2).padStart(64, "0") +
        bytes.slice((start + length) * 2);
    }
  return `0x${bytes}`;
}
export async function verifyRuntime(address) {
  if ((await client.getChainId()) !== 5042) throw new Error("Not Arc mainnet.");
  const code = await client.getCode({ address });
  if (!code || code.toLowerCase() !== runtime().toLowerCase())
    throw new Error(
      "Porter runtime mismatch; refusing to pin or publish proof.",
    );
  const token = await client.readContract({
    address,
    abi: artifact.abi,
    functionName: "usdc",
  });
  if (
    getAddress(token) !== getAddress(USDC) ||
    (await client.readContract({
      address: USDC,
      abi: tokenAbi,
      functionName: "decimals",
    })) !== 6
  )
    throw new Error("Canonical 6-decimal USDC was not verified.");
  return keccak256(code);
}
export async function verifyDeployment(address, transactionHash) {
  address = getAddress(address);
  transactionHash = hash(transactionHash);
  const runtimeHash = await verifyRuntime(address);
  const receipt = await client.getTransactionReceipt({ hash: transactionHash });
  const transaction = await client.getTransaction({ hash: transactionHash });
  if (
    receipt.status !== "success" ||
    !receipt.contractAddress ||
    getAddress(receipt.contractAddress) !== address ||
    transaction.to !== null
  )
    throw new Error(
      "Not a successful creation receipt for this Porter address.",
    );
  const expected = encodeDeployData({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [USDC],
  });
  if (transaction.input.toLowerCase() !== expected.toLowerCase())
    throw new Error("Creation bytecode or constructor does not match Porter.");
  return {
    project: "Porter",
    chainId: 5042,
    token: USDC,
    address,
    transactionHash,
    runtimeHash,
    blockNumber: receipt.blockNumber.toString(),
    explorer: `${EXPLORER}/address/${address}`,
    transactionUrl: `${EXPLORER}/tx/${transactionHash}`,
    verified: true,
    verification:
      "Creation input, runtime and canonical token independently read from Arc RPC; no explorer source badge claimed.",
    checkedAt: new Date().toISOString(),
  };
}
export function events(receipt, address, abi) {
  return receipt.logs
    .filter((log) => getAddress(log.address) === getAddress(address))
    .flatMap((log) => {
      try {
        return [decodeEventLog({ abi, topics: log.topics, data: log.data })];
      } catch {
        return [];
      }
    });
}
