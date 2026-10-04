# Project State

> Living handoff for Codex sessions. Never record secrets or raw credential-bearing values.

Last updated: 2026-10-04
Status: VERIFIED_MAINNET_PROOF_PUBLISHED
Active objective: Mainnet proof and the existing public app are verified. Push the scoped Porter checkpoint and publication receipt to main, then stop. No additional signing or DoraHacks submission is authorized.

## Workspace

- Repository/origin: https://github.com/dmetagame/porter.git; sole fetch/push remote, authenticated GitHub dmetagame.
- Worktree: /home/rouma/porter; branch main.
- Starting local/public main: 3790bb00a3cac23a5e08e79ebf3f4d55ffc630d0; worktree initially clean. State's previous hosting receipt is reconciled with that observed commit.
- Earlier implementation: 6bc946c211564991623b7075bd401c7533dad8aa; hosting checkpoint: 522111286e42e468b4fdc8522443ed62a9131897.
- Existing Vercel project only: dmetagames-projects/porter, prj_9DlI1gjs2YDzbfg1nNBZKm5eTj2r; public operator app https://porter-gilt.vercel.app. CLI authenticated as dmetagame.
- No other repository was read, written, fetched, branched, committed or pushed during this mainnet session. Do not access any other repository to perform boundary checks.

## Authorization And Safeguards

- User authorized one Arc mainnet deployment, exact 0.11 USDC approval, one scheduled room and same-key settlement on 2026-10-04. This superseded the earlier hosting-only prohibition on signing. All four transactions are now complete; do not repeat them.
- .env is gitignored: git check-ignore .env passed; git status and git ls-files do not include it. Key format validated privately; key read only in memory, re-read at signing boundaries, never printed/exported/copied into another file. No seed phrase requested. Preserve .env without committing or uploading it.
- No bridge, faucet, funds request, second caller, profit or independent-user claim. No DoraHacks submission. Only the existing Vercel project may be republished.
- Arc chain 5042, RPC https://rpc.mainnet.arc.io; canonical USDC 0x3600000000000000000000000000000000000000, ERC-20 6 decimals, native gas 18 decimals. Verified through live RPC.

## Mainnet Proof

- Pinned contract: 0x3E92CbEe456dBcBdafaC5b2054347c36367d60d6.
- Deployment: 0xa0c578a5831a51f7ab7327b34ceadd940df28a0e0863d64d04d7d335a8a99580.
- Approval: 0xae15b1348dee74f09dc5a5bdfd14b1fa557e4dc6d3a146de37268cbd61fcc10d; exactly 110000 ERC-20 units (0.11 USDC).
- Open: https://explorer.arc.io/tx/0x18ab61c5dd1c812a7bdd1096ad096e6d9bfd48b1db9bc86329db331cc2353835.
- Settle: https://explorer.arc.io/tx/0x1e90ded621847c72c7ae6a45f87f6b5c73cbc4928609fde654df27071e5fb2a1.
- Room #1: payout 0.10 USDC, bounty 0.01 USDC; dueAt 1791112738, settlement block timestamp 1791112745.
- Sender, payee and caller all 0xEE3eA6f858aE84dD6959f241DfC257a2f8fA3f53. Sender also settled. Builder-controlled test only, independentUse false.
- Actual settlement gas: 85972 units at 20000000000 native base units/gas = 0.00171944 USDC. No profitability claim.
- npm run pin accepted creation receipt, constructor token and exact runtime; only the tool wrote evidence/deployment.json and README pin.
- npm run evidence accepted opening/settlement receipts, exact funding/transfers, matching locked room and due time; only the tool wrote evidence/mainnet-proof.json (confirmed), receipts.json, README proof and docs/HACKATHON_BLURB.md. No hand-written pin/proof/blurb.

## Work And Verification

- No contract source or app source change. Regenerated src/porter-artifact.json identical to starting commit.
- Added scripts/prove-mainnet.mjs: one-run .env signing path; refuses a prior journal/pin, checks chain/token/balance/pending nonce before signing, persists only public hashes/receipt facts, suppresses credential-bearing error details. It must not be rerun for this completed proof.
- Added public evidence/mainnet-run.json for all four successful transactions, actual gas and same-wallet identity; journal marked proof-validators-confirmed only after tools succeeded.
- Updated README and docs/OPERATOR.md to remove stale unsigned claims and state the completed same-wallet proof. Historical evidence/verification.json and evidence/browser/ describe earlier local/unsigned tests and are not current mainnet claims.
- 16 Foundry contract tests passed, including 256-run conservation fuzzing. npm run build passed before signing; unchanged artifact verified with git diff. node --check scripts/prove-mainnet.mjs passed.
- Preflight native balance 0.160081239867511752 USDC; deployment estimate 604477 gas; current max fee 24000000000. Funding plus conservative reservation caps required 0.147808952 USDC; passed. Budgets rechecked before every signature. Caps are not measured gas usage; actual receipts are preserved.
- All four live receipts succeeded. Pin and evidence validator commands passed. README, pin, proof and journal addresses/hashes agree; senderAlsoSettled true and independentUse false checked programmatically.
- Previous Vite chunk-size and intentional Foundry timestamp lint warnings remain non-failing. No explorer source-verification badge or third-party audit is claimed.
- Post-proof npm run build and vercel build --prod both passed. Existing project ID checked; 38 prebuilt upload files contain no .env filename or signing-variable marker. vercel deploy --prebuilt --prod completed Ready as dpl_ChZzJGJLZHjagpxQc7574t6kjLJR, aliased to the same https://porter-gilt.vercel.app.
- 2026-10-04T11:34Z fresh public Playwright loads at 1440/390/320px returned HTTPS 200, showed the exact pinned address/open/settle links matching README and mainnet-proof.json, had no wallet injected, page errors, alert state, RPC fixtures or horizontal overflow. Real settled room #1 is visible. evidence/hosting.json and evidence/browser/mainnet-*.png record current production; mobile screenshot visually inspected.
- Pre-commit .env ignore/untracked checks passed again; sole push remote remains dmetagame/porter. App/contract source and generated artifact remain unchanged. No other repository was accessed.

## Risks And Next Actions

- This proves one builder-controlled scheduled payment. Broader token restrictions and failure modes are not a mainnet audit. Room funding has no cancellation/refund/admin path; callers may race and lose gas.
- Rebuild/republication and fresh production checks are complete. Do not create another project/domain/account or sign more transactions.
- Commit/push the validated evidence, generated blurb, README/runbook, one-run script, current hosting checks/screenshots and this handoff only to Porter main. Verify public main and final production alias after the Git-triggered build.
- Before commit, repeat .env ignore/status/tracked checks. Stage explicit paths, never .env or .vercel/ environment files. Stop if a secret safeguard fails.

## Session Handoff

- Mainnet signing, validators and production verification complete; source checkpoint/push verification remains. No additional mainnet transaction is needed.
- Preserve all mainnet receipts, generated proof/blurb, source artifact, lockfile and .env. Only reproducible task-created build caches/output may be cleaned after publishing; retain ignored nonsecret Vercel project link settings.
- evidence/hosting.json now records the confirmed mainnet proof in fresh production browsers. Historical local/unsigned screenshots remain explicitly historical; only new mainnet-*.png screenshots show current real Arc proof.

## Change Log

| Timestamp                            | Session/agent | Event                        | Result                                                                                                                  |
| ------------------------------------ | ------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 2026-10-03                           | Codex         | New project created          | GitHub name available; new public Porter; no environment key; mainnet proof absent                                      |
| 2026-10-03                           | Codex         | Core implementation verified | 16 Foundry and 4 value tests pass; production build passes; unsigned operator path and evidence gates implemented       |
| 2026-10-02T23:48Z (2026-10-03 Lagos) | Codex         | Final verification           | 16 contract + 4 values + 2 production-browser checks pass; no real proof or key; 43 existing default branches unchanged |
| 2026-10-03T11:45Z | Codex | Unsigned app hosted | Separate Porter Vercel project; HTTPS 200; fresh desktop/mobile prove unpinned/no mainnet proof; only hosting configuration and documentation/evidence changed |
| 2026-10-03T13:33Z | Codex | Publication receipt verified | Hosting commit 5221112 pushed and verified on GitHub main; automatic Vercel production build Ready; public fresh load still unsigned; 43 other repository heads and 51 local configurations unchanged; disposable build/env output cleaned |
| 2026-10-04 | Codex | Mainnet signing authorized and preflight passed | Porter-only checkout verified at 3790bb0; .env ignored/untracked; key format accepted privately; Arc chain/token and balance/gas budget pass; same wallet will deploy, open and settle |

| 2026-10-04T11:20Z | Codex | Real mainnet proof validated | Deploy/approve/open/settle succeeded; pin/runtime and evidence tools accepted all receipts; sender/payee/caller same wallet; generated confirmed proof/blurb; publication pending |
| 2026-10-04T11:34Z | Codex | Mainnet proof publicly verified | Existing Porter project redeployed; HTTPS 200 at 1440/390/320px; address and open/settle links match README and collector proof; settled room #1 visible; .env excluded from upload and source scope |
