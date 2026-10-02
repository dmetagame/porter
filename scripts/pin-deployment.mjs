import { readFileSync, writeFileSync } from "node:fs";
import { options, verifyDeployment } from "./arc.mjs";
const args = options();
if (!args.address || !args.transaction)
  throw new Error(
    "Usage: npm run pin -- --address ADDRESS --transaction DEPLOY_HASH",
  );
const record = await verifyDeployment(args.address, args.transaction);
writeFileSync(
  "evidence/deployment.json",
  JSON.stringify(record, null, 2) + "\n",
);
const readme = readFileSync("README.md", "utf8").replace(
  /<!-- PIN START -->[\s\S]*?<!-- PIN END -->/,
  `<!-- PIN START -->\nPinned address: [${record.address}](${record.explorer}) on Arc mainnet (5042).\n\nDeployment: [confirmed transaction](${record.transactionUrl}). Creation input, runtime, and canonical USDC verified by the read-only pin tool.\n<!-- PIN END -->`,
);
writeFileSync("README.md", readme);
console.log("Verified and pinned Porter:", record.address);
