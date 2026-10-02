# Porter verification

Mainnet proof does not exist yet. Claims remain empty. The tests described here are implementation checks only.

## Commands

- `npm run test:contract`: accounting, exact funding, early/wrong-amount/double settlement, caller bounty, multi-room conservation, transfer rollback, unsafe recipient and constructor rejection, sender settlement and 256-run fuzz conservation.
- `npm test`: exact 6-decimal transaction values, input precision rejection, unsafe recipients and distinct 18-decimal gas conversion.
- `npm run build`: independent Solidity artifact generation, TypeScript and production build.
- `npm run test:browser`: production browser at 1440px, 390px and 320px; missing wallet, field validation and no-proof states; isolated local-EVM complete wallet flow.

## Local browser fixture boundary

The wallet-flow test starts a disposable Anvil chain with chain ID 5042, installs a local token double at the USDC interface address, and forwards the browser's RPC requests to that local process. It uses Anvil's unlocked test accounts; it never stores, logs or passes a private key or seed into the app. The screenshot is marked **LOCAL EVM FIXTURE — NOT ARC MAINNET PROOF**. This tests the wallet workflow against real local EVM execution, not actual Arc USDC semantics, real balances, mainnet gas pricing, or customer activity.

Unsigned desktop/mobile screenshots show the actual production app without RPC/payment fixtures. Browser screenshots are UI evidence only and never feed `mainnet-proof.json`. The real pin/evidence scripts use the fixed mainnet RPC and reject missing or mismatched receipts.

## Remaining operator verification

Follow `docs/OPERATOR.md` to sign the real deployment and room. Verify source publication, pinned fresh-browser contract, actual USDC funding/payee/bounty logs, receipt statuses, due timestamp and actual gas. Native gas and ERC-20 USDC share a balance on Arc; the local token double does not reproduce that runtime behavior.
