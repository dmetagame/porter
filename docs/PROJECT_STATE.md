# Project State

> Living handoff for Codex sessions. Read this file before working. Do not put
> secrets or raw credential-bearing values here.

Last updated: 2026-10-03
Status: VERIFIED_UNSIGNED_DELIVERY
Active objective: Implementation and verification are complete. Checkpoint and push only the new Porter repository, verify publication, then stop.

## Workspace

- Repository: https://github.com/dmetagame/porter (new, public)
- Worktree: /home/rouma/porter
- Branch: main; no initial commit yet
- Origin: https://github.com/dmetagame/porter.git; authenticated as dmetagame.
- All existing repositories are protected and outside the write scope. No clone, fetch, fork, branch, commit, push, issue, PR, or artifact reuse there.

## Constraints

- New independent implementation only; no reused source, artifacts, proof, demo or deployment identities.
- Arc mainnet 5042; https://rpc.mainnet.arc.io; https://explorer.arc.io. Official docs verified 2026-10-03.
- USDC 0x3600000000000000000000000000000000000000: ERC-20 6 decimals, native gas 18 decimals, shared balance.
- No faucet, secrets in files/logs, DoraHacks submission, or video deliverable. Stop after push.

## Current Context

- One-shot rooms with exact funding, two atomic transfers, and early/repeat/wrong-amount rejection.
- Process-environment key checks: PORTER_DEPLOYER_PRIVATE_KEY, ARC_MAINNET_PRIVATE_KEY and DEPLOYER_PRIVATE_KEY are absent. No existing repository environment files were read.
- Automatic deployment unavailable. Deliver unsigned browser deployment/open/settle and operator instructions. No pinned address or mainnet proof exists yet.

## Work Completed

- Created new public repository and isolated local Git repository; origin verified.
- Adapted reusable workspace state template and recorded read-only existing-repository head metadata for final boundary check.
- Independently implemented contracts/Porter.sol: exact funding, immutable room terms, one-shot atomic payout/bounty, early/repeat/wrong-amount guards, received-balance validation, no native sweep/admin/refund.
- Built browser-only Arc wallet app with runtime/token verification, exact approval, room opening, per-caller gas estimation with a disclosed 20% gas-limit buffer, settlement, storage-independent receipt handling, pending/revert recovery and operator deployment. Self-hosted product typography; desktop/mobile production verification complete.
- Added read-only pin and proof collectors; claims and hashes remain empty until successful matching real Arc receipts exist. No blurb file exists yet.

## Verification

| Check               | Result | Evidence/date                                                                                                                        |
| ------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Contract            | passed | 16 Foundry tests including 256-run fuzz conservation                                                                                 |
| Frontend values     | passed | 4 Vitest tests                                                                                                                       |
| Production build    | passed | Solidity artifact generation, TypeScript and Vite                                                                                    |
| Browser             | passed | 2 Playwright checks: honest unsigned states at 1440/390/320px; complete local-EVM wallet deployment/open/settle with distinct caller |
| Mainnet proof gate  | passed | Missing pin/receipt inputs rejected; claims empty, address/hashes null; blurb absent                                                 |
| Dependency audit    | passed | npm audit --omit=dev: 0 vulnerabilities                                                                                              |
| Repository boundary | passed | 43 existing repository default branches compared against start metadata; no changes                                                  |
| Mainnet RPC         | passed | Read-only eth_chainId returned 0x13b2 (5042); no mainnet transactions sent                                                           |

- Browser screenshots inspected in evidence/browser/. Local-EVM screenshot has a prominent fixture label; it is not mainnet proof. No page errors or mobile horizontal overflow.
- Initial local browser fixture failed because its token double lacked decimals(); fixed the local double, then the complete final suite passed. Product verification correctly refused the unrecognized token interface.
- Foundry reports intentional timestamp-boundary lint warnings; Vite reports a 539.86-kB JS chunk warning. Neither is a failing check. No claimed audit, gas profitability, independent usage or real Arc settlement.

## Risks And Blockers

- No available environment key. Operator must sign deployment, approval, opening and settlement; mainnet qualification remains incomplete.

## Next Actions

1. Operator follows docs/OPERATOR.md using a funded browser wallet: sign deployment, independently verify/pin, rebuild, approve exact funding, open, estimate, then settle.
2. Only after confirmed opening and settlement, collect real evidence and create the blurb. Unsigned state does not qualify for the grant.
3. No further product work or DoraHacks submission is authorized in this session. Publication handoff must verify origin/main and GitHub main, then stop.

## Session Handoff

- Read this document first. No other repository is in scope.
- Mainnet address and proof intentionally absent. README and evidence files state this; exact operator signatures are documented.
- Source, new generated Porter artifact and UI/test evidence belong only to this repository. Build caches and temporary local test processes are disposable; preserve evidence screenshots and lockfile.

## Change Log

| Timestamp                            | Session/agent | Event                        | Result                                                                                                                  |
| ------------------------------------ | ------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-10-03                           | Codex         | New project created          | GitHub name available; new public Porter; no environment key; mainnet proof absent                                      |
| 2026-10-03                           | Codex         | Core implementation verified | 16 Foundry and 4 value tests pass; production build passes; unsigned operator path and evidence gates implemented       |
| 2026-10-02T23:48Z (2026-10-03 Lagos) | Codex         | Final verification           | 16 contract + 4 values + 2 production-browser checks pass; no real proof or key; 43 existing default branches unchanged |
