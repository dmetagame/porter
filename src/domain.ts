import {
  getAddress,
  isAddress,
  parseUnits,
  formatUnits,
  keccak256,
  type Address,
  type Hex,
} from "viem";
import artifact from "./porter-artifact.json";
export const USDC = "0x3600000000000000000000000000000000000000" as Address;
export const EXPLORER = "https://explorer.arc.io";
export function amount(text: string): bigint {
  if (!/^\d+(\.\d{1,6})?$/.test(text))
    throw new Error(
      "Use a positive USDC amount with at most 6 decimal places.",
    );
  const value = parseUnits(text, 6);
  if (value <= 0n)
    throw new Error("Payout and bounty must both be greater than zero.");
  return value;
}
export function recipient(text: string, contract?: Address): Address {
  if (!isAddress(text)) throw new Error("Enter a valid payee wallet address.");
  const value = getAddress(text);
  if (
    value === "0x0000000000000000000000000000000000000000" ||
    value === getAddress(USDC) ||
    value === (contract && getAddress(contract))
  )
    throw new Error(
      "The payee must be a wallet, not the zero, token, or Porter address.",
    );
  return value;
}
export function units(value: bigint) {
  return formatUnits(value, 6);
}
export function gasDollars(value: bigint) {
  return formatUnits(value, 18);
}
export function short(value: string) {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
export function txLink(hash: string) {
  return `${EXPLORER}/tx/${hash}`;
}
export function expectedRuntime(): Hex {
  let bytes = artifact.runtime.replace(/^0x/, "");
  const token = USDC.slice(2).toLowerCase().padStart(64, "0");
  const references = artifact.immutableReferences as Record<
    string,
    { start: number; length: number }[]
  >;
  for (const refs of Object.values(references))
    for (const ref of refs) {
      if (ref.length !== 32)
        throw new Error("Unexpected Porter immutable layout.");
      bytes =
        bytes.slice(0, ref.start * 2) +
        token +
        bytes.slice((ref.start + ref.length) * 2);
    }
  return `0x${bytes}`;
}
export const EXPECTED_RUNTIME_HASH = keccak256(expectedRuntime());
export function errorText(error: unknown): string {
  const value = error as { shortMessage?: string; message?: string };
  return (
    value?.shortMessage ||
    value?.message?.split("\n")[0] ||
    "The wallet or Arc RPC could not complete this action. Refresh and check its transaction before retrying."
  );
}
