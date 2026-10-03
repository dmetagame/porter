# Project State

> Living handoff for Codex sessions. Read this file before working. Do not put
> secrets or raw credential-bearing values here.

Last updated: 2026-10-03
Status: VERIFIED_UNSIGNED_APP_HOSTING
Active objective: Completed unsigned production hosting and public verification. Stop after the publication-receipt handoff is pushed only to Porter main. No contract deployment or wallet signature is authorized.

## Workspace

- Repository: https://github.com/dmetagame/porter (new, public)
- Worktree: /home/rouma/porter
- Branch: main
- Implementation checkpoint: `6bc946c211564991623b7075bd401c7533dad8aa`, verified locally after all checks. This documentation-only handoff follows it; resolve the handoff ID with `git rev-parse HEAD`.
- Starting publication verified: local main, origin/main and GitHub public main all resolve to `139cb3ae030df793248fabfac8376e4ec96a07cf`; worktree was clean. Compare the final documentation checkpoint with GitHub main before ending.
- Hosting checkpoint: `522111286e42e468b4fdc8522443ed62a9131897` pushed successfully to origin/main; independently verified through git ls-remote. Tracked worktree clean after push. This publication-receipt-only handoff follows that checkpoint; resolve its ID with git rev-parse HEAD and compare origin/main before ending.
- Origin: https://github.com/dmetagame/porter.git; authenticated as dmetagame.
- All existing repositories are protected and outside the write scope. No clone, fetch, fork, branch, commit, push, issue, PR, or artifact reuse there.

## Constraints

- New independent implementation only; no reused source, artifacts, proof, demo or deployment identities.
- Arc mainnet 5042; https://rpc.mainnet.arc.io; https://explorer.arc.io. Official docs verified 2026-10-03.
- USDC 0x3600000000000000000000000000000000000000: ERC-20 6 decimals, native gas 18 decimals, shared balance.
- No faucet, secrets in files/logs, DoraHacks submission, or video deliverable. Stop after push.

## Current Context

- Hosting session: cached Vercel CLI 51.2.1 is already authenticated as dmetagame in dmetagames-projects. Porter did not exist at session start; it is now a separate new hosting project linked only to this repository.
- Existing repository default heads and 51 local repository configuration hashes recorded outside repositories for the final boundary comparison. No existing repository was modified or fetched.
- Deploy only local production assets. Keep deployment.json and mainnet-proof.json unchanged; pinned address remains null, proof status not-established, claims empty, no hackathon blurb. The operator performs docs/OPERATOR.md later.
- One-shot rooms with exact funding, two atomic transfers, and early/repeat/wrong-amount rejection.
- Previous implementation-session environment checks found no deployment key. This hosting session did not inspect or use signing credentials; no existing repository environment files were read.
- Contract deployment is outside this session's authorization. The existing browser operator deployment/open/settle path remains unsigned. No pinned address or mainnet proof exists yet.

## Work Completed

- Created new public repository and isolated local Git repository; origin verified.
- Adapted reusable workspace state template and recorded read-only existing-repository head metadata for final boundary check.
- Independently implemented contracts/Porter.sol: exact funding, immutable room terms, one-shot atomic payout/bounty, early/repeat/wrong-amount guards, received-balance validation, no native sweep/admin/refund.
- Built browser-only Arc wallet app with runtime/token verification, exact approval, room opening, per-caller gas estimation with a disclosed 20% gas-limit buffer, settlement, storage-independent receipt handling, pending/revert recovery and operator deployment. Self-hosted product typography; desktop/mobile production verification complete.
- Added read-only pin and proof collectors; claims and hashes remain empty until successful matching real Arc receipts exist. No blurb file exists yet.
- Published https://porter-gilt.vercel.app from the existing production app to a new, separate dmetagames-projects/porter Vercel project. Initial hosting deployment: dpl_4wS2xjXd7PaGFNZ6MwXragsvtC79. Existing authenticated account dmetagame; Git integration connects only dmetagame/porter.
- Added vercel.json for a TypeScript/Vite-only hosting build using the committed contract artifact; npm run build still compiles it locally. No contract/app source or mainnet evidence changed. README documents the operator URL and absent mainnet proof; evidence/hosting.json records public checks.

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
- Hosting verification 2026-10-03: npm run build and vercel build --prod pass; generated artifact unchanged. Prebuilt production deployment READY. Public curl returns HTTPS 200. Fresh Playwright contexts at 1440px and 390px show unpinned contract, absent mainnet proof, disabled approval and zero Arc transaction links; no injected wallet, page errors or horizontal overflow. No wallet interaction occurred.
- Boundary comparison passed: 43 other GitHub default branches and 51 existing local repository configurations unchanged. Porter origin remains its sole fetch/push remote. Only README.md, docs/PROJECT_STATE.md, vercel.json and evidence/hosting.json belong to this hosting checkpoint.
- Post-push verification: Vercel Git integration built production https://porter-ps96piic7-dmetagames-projects.vercel.app successfully (Ready, 19s). At 2026-10-03T13:33Z the stable public operator URL again returned HTTPS 200 in a fresh browser, with no pinned address, no mainnet proof and no Arc transaction links. Final read-only boundary comparison still shows all 43 other remote default branches and 51 local repository configurations unchanged.

## Risks And Blockers

- Operator must sign deployment, approval, opening and settlement in a later operator session; mainnet qualification remains incomplete. Hosting itself is complete.

## Next Actions

1. Operator follows docs/OPERATOR.md using a funded browser wallet: sign deployment, independently verify/pin, rebuild, approve exact funding, open, estimate, then settle.
2. Only after confirmed opening and settlement, collect real evidence and create the blurb. Unsigned state does not qualify for the grant.
3. Hosting is complete and its checkpoint is backed up on Porter main. Push this publication-receipt-only handoff, verify the final main commit, then stop. No contract deployment, wallet signatures or DoraHacks submission is authorized in this hosting session.

## Session Handoff

- Read this document first. No other repository is in scope.
- Mainnet address and proof intentionally absent. README and evidence files state this; exact operator signatures are documented.
- Source, new generated Porter artifact and UI/test evidence belong only to this repository. Build caches and temporary local test processes are disposable; preserve evidence screenshots and lockfile.
- After verified hosting, removed task-created reproducible dist/, out/, cache/, .vercel/output/ and the ignored .vercel/.env.production.local file. Preserved source, generated Porter artifact, dependencies, lockfile, hosting link settings and evidence. Tracked worktree was clean before cleanup; verify again after this documentation-only receipt. Rebuild with npm run build before serving or rerunning browser tests.
- Hosting handoff: public operator app https://porter-gilt.vercel.app. The operator, not Codex, follows docs/OPERATOR.md. .vercel/ is ignored; never commit its environment files or authentication material. Mainnet pin and proof remain empty and unchanged.

## Change Log

| Timestamp                            | Session/agent | Event                        | Result                                                                                                                  |
| ------------------------------------ | ------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-10-03                           | Codex         | New project created          | GitHub name available; new public Porter; no environment key; mainnet proof absent                                      |
| 2026-10-03                           | Codex         | Core implementation verified | 16 Foundry and 4 value tests pass; production build passes; unsigned operator path and evidence gates implemented       |
| 2026-10-02T23:48Z (2026-10-03 Lagos) | Codex         | Final verification           | 16 contract + 4 values + 2 production-browser checks pass; no real proof or key; 43 existing default branches unchanged |
| 2026-10-03T11:45Z | Codex | Unsigned app hosted | Separate Porter Vercel project; HTTPS 200; fresh desktop/mobile prove unpinned/no mainnet proof; only hosting configuration and documentation/evidence changed |
| 2026-10-03T13:33Z | Codex | Publication receipt verified | Hosting commit 5221112 pushed and verified on GitHub main; automatic Vercel production build Ready; public fresh load still unsigned; 43 other repository heads and 51 local configurations unchanged; disposable build/env output cleaned |
