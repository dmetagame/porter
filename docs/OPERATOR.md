# Porter operator runbook

## Current status

Porter is deployed and pinned on Arc mainnet at [0x3E92CbEe456dBcBdafaC5b2054347c36367d60d6](https://explorer.arc.io/address/0x3E92CbEe456dBcBdafaC5b2054347c36367d60d6). The [README](../README.md) and [mainnet proof](../evidence/mainnet-proof.json) link the validated opening and settlement of room #1. Sender, payee and caller were the same builder-controlled wallet; the sender also settled. Nothing is submitted to DoraHacks.

The authorized 2026-10-04 run used only the ignored Porter-root .env in memory at signing boundaries, without copying or logging its key. Public transaction hashes and gas receipts are in [mainnet-run.json](../evidence/mainnet-run.json). The one-run script refuses to rerun when that journal or a pin exists. Do not redeploy or repeat this completed proof. Fresh visitors can use the existing pinned contract at https://porter-gilt.vercel.app.

## Deploy and pin

This deployment procedure is retained as a reference. It is already complete for the address above; the pinned public app hides its deployment setup.

1. Install dependencies and build: `npm ci`, `npm run build`. Use the production app with `npm run preview` or serve `dist/` on an operator-controlled host.
2. Fund the browser wallet with a small amount of **real** Arc USDC. Include deployment and approval/open/settle gas plus the 0.11-USDC room. There is no mainnet faucet. The actual required gas is determined by the wallet/RPC; this runbook supplies no invented fee figure.
3. In the app click **Connect wallet**, switch to chain 5042 if required, and reconnect after the network switch. Confirm the shared USDC balance.
4. Expand **Operator setup**. Click **Deploy Porter · wallet signature**. Inspect the wallet request: Arc mainnet, newly compiled Porter creation code, constructor token `0x3600000000000000000000000000000000000000`, zero native value. Sign only if those facts match.
5. Wait for a successful receipt. The app checks the exact runtime and canonical 6-decimal USDC token. Download the deployment receipt. This tab can use the verified deployment, but a fresh visitor will not have a pinned address yet.
6. Copy the real address and deployment hash from that receipt into the read-only command:

```sh
npm run pin -- --address ADDRESS_FROM_RECEIPT --transaction DEPLOYMENT_HASH_FROM_RECEIPT
npm run build
```

The pin tool independently reads Arc, checks successful contract creation and exact constructor bytecode/runtime, then updates `evidence/deployment.json` and README. It never signs. Publish the rebuilt `dist/` on the operator's chosen host and check that a fresh browser sees the same pinned address. Changes and future pushes belong only in `dmetagame/porter`.

## Publish source verification

Use the confirmed Porter address on https://explorer.arc.io and its contract verification interface. Compiler `0.8.30`, optimization on, 200 runs, EVM Cancun, MIT license, constructor address as above. `forge verify-contract ADDRESS_FROM_RECEIPT contracts/Porter.sol:Porter --show-standard-json-input` produces this project's exact standard JSON input; redirect it to `evidence/porter-standard-input.json` if the explorer requests that file. Constructor encoding is the 32-byte left-padded canonical USDC address. Verify the explorer actually displays the source before claiming an explorer verified badge. The pin tool's runtime match is distinct evidence and does not claim that badge.

## Sign the proof room

1. Use a second builder-controlled wallet as payee. Enter 0.10 USDC payout, 0.01 USDC bounty, and a 1-minute delay. This is a builder-controlled test, not customer use.
2. Sign the exact 0.11-USDC **approval**, wait for confirmation, then sign **Fund and open room**. Preserve the real opening explorer link. Approval alone is not opening evidence.
3. If a separate caller wallet exists, connect it after the room is due. It must already hold USDC for gas. Otherwise use the sender wallet and state that the sender also settled. Do not create or save a key for this demonstration.
4. Refresh the room queue, click **Estimate settle fee**, inspect the 18-decimal native gas maximum and 6-decimal caller bounty, then sign **Settle**. Preserve the real settlement explorer link and confirmed receipt. A pending/reverted transaction does not establish payment.
5. Run the read-only collector:

```sh
npm run evidence -- --open REAL_OPEN_HASH --settle REAL_SETTLE_HASH
npm run build
```

Only after both successful real Arc receipts pass the checks does the tool populate claims, save receipts and generate the four-sentence `docs/HACKATHON_BLURB.md`. It records actual gas, exact payee/caller amounts, and whether the sender settled. It does not claim independent use or bounty profitability.

## Transaction recovery

If a request times out after submission, use **Check confirmation** or the explorer link. New signatures pause until the known transaction is resolved; do not blindly open another room. The app remembers the outstanding transaction in session storage without keys. Pending hashes are references, not proof. Funding has no cancellation path; only the programmed payment can release it once due.
