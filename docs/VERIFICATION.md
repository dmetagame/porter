# Porter verification

The existing builder-controlled mainnet proof is linked in [README](../README.md) and recorded in [mainnet-proof.json](../evidence/mainnet-proof.json). Sender, payee and caller were the same wallet. Tests below are implementation checks and do not establish additional mainnet payments or independent use. See [AUDIT.md](AUDIT.md) for the fresh RPC and public-browser checks performed on 2026-10-04.

## Commands

- `npm run test:contract`: accounting, exact funding, early/wrong-amount/double settlement, caller bounty, multi-room conservation, transfer rollback, unsafe recipient and constructor rejection, sender settlement and 256-run fuzz conservation. A payee-transfer failure test checks that funds remain locked and the room remains unsettled until the transfer can succeed.
- `npm test`: exact 6-decimal transaction values, input precision rejection, unsafe recipients and distinct 18-decimal gas conversion.
- `npm run build`: Solidity artifact generation, TypeScript and production build.
- `npm run test:browser`: production browser at 1440px, 390px and 320px in light/dark themes; missing wallet, field validation, empty/connected/proved states, exact approval/open/settle requests, fee estimate, operator setup and pending/reverted/unmined receipt recovery.

## Browser fixture boundary

`browser-tests/porter.spec.ts` intercepts the public RPC URL with explicitly simulated read responses and injects a browser-wallet double. Signing requests are recorded and rejected locally. Receipt-recovery checks read simulated receipts without a wallet. The unpinned check changes the compiled script response only inside that browser; it does not edit the committed pin or proof. These tests do not launch Anvil, deploy contracts, sign or broadcast a transaction. Screenshots carry a **BROWSER FIXTURE** banner.

Fixture balances, room states and fee estimates are labeled test values, not mainnet evidence. Browser screenshots never feed `mainnet-proof.json`. The real pin/evidence scripts use the fixed mainnet RPC and reject missing or mismatched receipts.

## Read-only public verification

The audit compared fresh Arc creation/runtime, room terms, funding/payee/bounty logs, receipt statuses, due timestamp and actual gas with the existing records. Public desktop/mobile pages were loaded without a wallet or RPC fixtures. Native gas and ERC-20 USDC share a balance on Arc; the fixture does not reproduce all issuer restrictions or token semantics. The recorded proof covers one builder-controlled room. Source publication on the explorer is not claimed. Do not redeploy or repeat the completed proof to run these checks.

The audit ran build/test commands with the actual Porter-root `.env` masked by `/dev/null` in a filesystem namespace. This prevents Foundry/Vite from automatically reading it.
