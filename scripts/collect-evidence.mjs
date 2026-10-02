import { readFileSync, writeFileSync } from "node:fs";
import { getAddress, decodeFunctionData, formatUnits } from "viem";
import {
  options,
  hash,
  client,
  artifact,
  tokenAbi,
  USDC,
  EXPLORER,
  events,
  verifyDeployment,
} from "./arc.mjs";
const args = options();
const pin = JSON.parse(readFileSync("evidence/deployment.json", "utf8"));
if (!pin.address || !pin.transactionHash)
  throw new Error("Pin a confirmed Porter deployment first.");
await verifyDeployment(pin.address, pin.transactionHash);
const openHash = hash(args.open);
const settleHash = hash(args.settle);
const [opening, settlement, openTx, settleTx] = await Promise.all([
  client.getTransactionReceipt({ hash: openHash }),
  client.getTransactionReceipt({ hash: settleHash }),
  client.getTransaction({ hash: openHash }),
  client.getTransaction({ hash: settleHash }),
]);
if (
  [opening, settlement].some((r) => r.status !== "success") ||
  [openTx, settleTx].some(
    (t) => !t.to || getAddress(t.to) !== getAddress(pin.address),
  )
)
  throw new Error(
    "Both transactions must succeed against the pinned Porter contract.",
  );
const opened = events(opening, pin.address, artifact.abi).find(
  (e) => e.eventName === "RoomOpened",
);
const settled = events(settlement, pin.address, artifact.abi).find(
  (e) => e.eventName === "RoomSettled",
);
if (!opened || !settled)
  throw new Error("Missing Porter opening/settlement events.");
const a = opened.args;
const b = settled.args;
if (
  a.roomId !== b.roomId ||
  getAddress(a.payee) !== getAddress(b.payee) ||
  a.payout !== b.payout ||
  a.bounty !== b.bounty ||
  getAddress(a.sender) !== getAddress(openTx.from) ||
  getAddress(b.caller) !== getAddress(settleTx.from)
)
  throw new Error("Events do not prove a matching room and caller.");
const decoded = decodeFunctionData({ abi: artifact.abi, data: settleTx.input });
if (
  decoded.functionName !== "settle" ||
  decoded.args[0] !== a.roomId ||
  decoded.args[1] !== a.payout ||
  decoded.args[2] !== a.bounty
)
  throw new Error("Settlement input differs from locked terms.");
const settlementBlock = await client.getBlock({
  blockNumber: settlement.blockNumber,
});
if (
  settlementBlock.timestamp < a.dueAt ||
  opening.blockNumber > settlement.blockNumber
)
  throw new Error("Due time or transaction ordering is not proved.");
const transfers = events(settlement, USDC, tokenAbi).filter(
  (e) => e.eventName === "Transfer",
);
const remaining = [...transfers];
for (const [recipient, value] of [
  [a.payee, a.payout],
  [b.caller, a.bounty],
]) {
  const index = remaining.findIndex(
    (e) =>
      getAddress(e.args.from) === getAddress(pin.address) &&
      getAddress(e.args.to) === getAddress(recipient) &&
      e.args.value === value,
  );
  if (index < 0)
    throw new Error("Missing exact 6-decimal ERC-20 payout/bounty transfer.");
  remaining.splice(index, 1);
}
const funding = events(opening, USDC, tokenAbi).find(
  (e) =>
    e.eventName === "Transfer" &&
    getAddress(e.args.from) === getAddress(a.sender) &&
    getAddress(e.args.to) === getAddress(pin.address) &&
    e.args.value === a.payout + a.bounty,
);
if (!funding) throw new Error("Exact sender funding transfer is missing.");
const state = await client.readContract({
  address: pin.address,
  abi: artifact.abi,
  functionName: "rooms",
  args: [a.roomId],
});
if (!state[5]) throw new Error("Room is not settled in current state.");
const gasCost = settlement.gasUsed * settlement.effectiveGasPrice;
const record = {
  project: "Porter",
  status: "confirmed",
  chainId: 5042,
  contract: pin.address,
  token: USDC,
  roomId: a.roomId.toString(),
  openTransaction: openHash,
  settleTransaction: settleHash,
  openUrl: `${EXPLORER}/tx/${openHash}`,
  settleUrl: `${EXPLORER}/tx/${settleHash}`,
  sender: a.sender,
  payee: a.payee,
  caller: b.caller,
  senderAlsoSettled: getAddress(a.sender) === getAddress(b.caller),
  builderControlled: true,
  independentUse: false,
  payoutBaseUnits: a.payout.toString(),
  bountyBaseUnits: a.bounty.toString(),
  payoutUSDC: formatUnits(a.payout, 6),
  bountyUSDC: formatUnits(a.bounty, 6),
  dueAt: a.dueAt.toString(),
  settlementTimestamp: settlementBlock.timestamp.toString(),
  gasUsed: settlement.gasUsed.toString(),
  effectiveGasPrice: settlement.effectiveGasPrice.toString(),
  gasCostNativeBaseUnits: gasCost.toString(),
  gasCostUSDC: formatUnits(gasCost, 18),
  claims: [
    "Exact sender funding verified",
    "Matching due room settled once",
    "Exact payee and caller transfers verified",
  ],
  checkedAt: new Date().toISOString(),
};
writeFileSync(
  "evidence/mainnet-proof.json",
  JSON.stringify(record, null, 2) + "\n",
);
writeFileSync(
  "evidence/receipts.json",
  JSON.stringify(
    { opening, settlement },
    (_key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  ) + "\n",
);
const readme = readFileSync("README.md", "utf8").replace(
  /<!-- PROOF START -->[\s\S]*?<!-- PROOF END -->/,
  `<!-- PROOF START -->\nMainnet proof: [open](${record.openUrl}) and [settle](${record.settleUrl}).\n\nBuilder-controlled test: payout ${record.payoutUSDC} USDC; bounty ${record.bountyUSDC} USDC; actual settlement gas ${record.gasCostUSDC} USDC. ${record.senderAlsoSettled ? "The sender also settled." : "A distinct builder-controlled caller wallet settled."} No independent usage or future profitability is claimed.\n<!-- PROOF END -->`,
);
writeFileSync("README.md", readme);
// The four-sentence submission is created ONLY after both real receipts passed every check.
writeFileSync(
  "docs/HACKATHON_BLURB.md",
  `Porter lets a sender lock a scheduled USDC payout plus a caller bounty, then lets anyone settle the room once due.\nIt uses Arc so payout, bounty, and gas share USDC, allowing callers to assess the fee without holding a second gas token.\nThe [opening transaction](${record.openUrl}) and [settlement transaction](${record.settleUrl}) prove ${record.payoutUSDC} USDC reached the payee and ${record.bountyUSDC} USDC reached the caller.\nIt is an early builder-controlled payment prototype, not a keeper network, a bounty-over-gas guarantee, or evidence of independent use.\n`,
);
console.log("Confirmed Porter evidence saved. No submission was sent.");
