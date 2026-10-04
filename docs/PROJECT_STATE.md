# Project State

> Living handoff for Codex sessions. Never record secrets or raw credential-bearing values.

Last updated: 2026-10-04
Status: AUDIT_COMPLETE
Active objective: Audit complete and audit checkpoint pushed/independently verified. No P0; one P1 verification-documentation finding fixed; no unresolved P0/P1. Publish this state receipt only, verify the current main ID and clean worktree, then stop. App/contract/proof/design unchanged; no manual redeploy, .env read or signing.

## Workspace

- Audit baseline reconciled: local and public main d78a1e551e9249d39f5269d43e478f861bf17c8a; clean worktree, sole origin dmetagame/porter, GitHub authenticated as dmetagame. Previous receipt-push instruction was stale: that receipt is already public.

- Redesign starting main/public main: b994a6269bad2b550e54a7568a3484215d7c7a26; worktree initially clean. Sole remote still Porter and GitHub auth verified. All prior mainnet work is completed history, not current signing authorization.
- Repository/origin: https://github.com/dmetagame/porter.git; sole fetch/push remote, authenticated GitHub dmetagame.
- Worktree: /home/rouma/porter; branch main.
- Starting local/public main: 3790bb00a3cac23a5e08e79ebf3f4d55ffc630d0; worktree initially clean. State's previous hosting receipt is reconciled with that observed commit.
- Earlier implementation: 6bc946c211564991623b7075bd401c7533dad8aa; hosting checkpoint: 522111286e42e468b4fdc8522443ed62a9131897.
- Mainnet proof checkpoint: 80077e08f0a2d08615ac9738c90ed810917ceb8b. Push to origin/main succeeded and git ls-remote independently confirmed the public main ID. Worktree clean after that checkpoint. This publication-receipt-only handoff follows it; resolve its own ID with git rev-parse HEAD and compare origin/main before ending.
- Existing Vercel project only: dmetagames-projects/porter, prj_9DlI1gjs2YDzbfg1nNBZKm5eTj2r; public operator app https://porter-gilt.vercel.app. CLI authenticated as dmetagame.
- No other repository was read, written, fetched, branched, committed or pushed during this mainnet session. Do not access any other repository to perform boundary checks.

## Authorization And Safeguards

- Current redesign: do not read .env, use a key, sign, deploy any contract, or access another repository. Build/preview commands run in a verified bwrap namespace masking Porter .env with /dev/null; the actual file is neither read nor modified.
- Frozen hashes recorded outside the repository for contracts/, deployment.json, mainnet-proof.json, HACKATHON_BLURB.md, OPERATOR.md and the entire App wallet-handler section. Presentation changes must pass that comparison before committing.
- New visual direction: mineral paper and deep green, one DM Sans voice, a real locked-amount split receipt above the form, exact explorer links and same-wallet disclosure. Retire dispatch blue and Barlow display styling. No invented metrics, chart or decorative motion.
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

- Redesign: actual locked amount now branches into payee payout/caller bounty at the top, with real receipt links, exact measured gas and same-builder disclosure. One DM Sans voice, mineral-paper/deep-green tokens, dark preference, larger amount inputs, labeled defaults, separate wallet activity and truthful loading/empty states. docs/DESIGN.md retires dispatch blue and describes the new system.
- npm run build passed in the .env-masked bwrap namespace. vercel build --prod also passed there, using the existing Porter project. No secret file contents were read.
- Six replacement Playwright checks passed. Read-only RPC fixtures and injected mock wallets cover empty/connected/proved, chain switch, exact approval/open/settle request terms, fee estimate, pending recovery, validation/focus, 1440/390/320 widths, both themes, reduced motion and disabled unpinned operator setup. Mock signing requests were rejected locally; no transaction was broadcast and no contract was deployed, including locally.
- Real read-only local production loads showed settled room #1 without a wallet. Screenshots in evidence/browser/redesign/ separate clearly banner-labeled fixtures from actual-* images. Measured primary/quiet/link/error text contrasts exceed 4.5:1 in both themes; minimum measured light pair 5.33:1, dark pair 6.51:1. evidence/redesign-verification.json records the checks.
- Frozen contracts, pin JSON, mainnet proof, four-sentence blurb and operator runbook remain byte-for-byte unchanged. Entire App wallet-handler section also matches the starting file. Form approval, funding, fee and settlement guards/callbacks are preserved.
- Initial browser harness needed JSON imports compatible with the runner, Vite quote-aware fixture matching and the SDK-normalized rejection text. Final six tests pass. Contrast utility corrected its parsing of minified #fff; actual CSS contrast passes without palette changes.


- Prior mainnet delivery changed no contract/app source. Current redesign changes only src/main.tsx presentation and src/styles.css; wallet handlers are byte-identical and src/porter-artifact.json is unchanged.
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
- Post-push production https://porter-q0poroi5y-dmetagames-projects.vercel.app is Ready (8s build). At 2026-10-04T11:40Z a fresh browser rechecked the stable https://porter-gilt.vercel.app: HTTPS 200, exact pinned contract/open/settle links, no alert state. evidence/hosting.json records the verified source checkpoint and subsequent production build.

## Risks And Next Actions

- The frozen proof establishes one builder-controlled payment. No independent use, profitability, keeper network or third-party audit is claimed. Permanent funding and possible caller races remain as documented in OPERATOR.md.
- Verify fresh public light/dark desktop/mobile pages show the redesigned receipt and exact existing pinned address/open/settle links, then push only this repository's main branch and verify GitHub/Vercel publication.
- Never stage .env, .vercel/ files, frozen mainnet records, contract sources or unrelated files. No other repository is accessible for this task.

## Session Handoff

- Read this file first. The mainnet proof section above is historical confirmed evidence, not permission to repeat signing. Current work is presentation only.
- Current allowed frontend/design/test files are src/main.tsx, src/styles.css, docs/DESIGN.md, browser-tests/porter.spec.ts, this handoff and redesign verification/screenshots. OPERATOR.md and HACKATHON_BLURB.md are preserved exactly.
- Build/preview with a bwrap namespace masking /home/rouma/porter/.env using /dev/null. Do not run the old mainnet signing script. The mask never reads or modifies the actual file.
- Keep the existing Vercel link and all public proof intact. After production verification, stop the task preview and remove only reproducible task-created dist/out/cache/.vercel/output/test-results; preserve source, lockfile, evidence and the user's unread .env.

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
| 2026-10-04T11:40Z | Codex | Proof publication receipt verified | 80077e0 pushed and independently verified on Porter public main; Git-triggered production Ready; stable public app rechecked against exact proof links; disposable output cleaned, root .env preserved |

| 2026-10-04 | Codex | Frontend redesign verified locally | Actual split receipt, mineral/green light/dark system, 6 mock-only browser tests pass; build/env masking and contrast pass; all frozen files and wallet handlers unchanged |

- Final refinement: a very long typed payout exposed mobile total overflow. The total now wraps within bounded grid columns without rounding/truncation. Rebuilt and all six browser tests pass, including the added long-amount check; frozen hashes still match.

- Final public verification 2026-10-04T15:13:20.122Z: existing Porter project deployment dpl_EGu8tYDKEmo6fKKqPj3iYj9uvp8B is Ready. HTTPS 200 across light/dark and 1440/390/320px; exact pinned address, open/settle URLs, 0.11/0.10/0.01 split and 0.00171944 gas preserved; long typed payout wraps. No injected wallet, signing, mocks, page errors or horizontal overflow on public checks.

- Redesign source checkpoint 4d93911179c665386e3b4802db9bb401c3ba186d pushed to Porter main and independently verified with git ls-remote; tracked worktree was clean after push. Git-triggered production https://porter-q1iudcaa2-dmetagames-projects.vercel.app is Ready. Fresh stable URL checked again at 2026-10-04T15:25:21.087Z with the new heading, frozen proof links/gas and no error/overflow. This receipt-only handoff follows that checkpoint; resolve its own ID with git rev-parse HEAD and compare public main before ending.

- Cleanup: task production preview stopped (exit 130); removed reproducible dist/, out/, cache/, .vercel/output/ and test-results/. Source, lockfile, all verified/labeled images, frozen proof, Vercel link and the unread .env are preserved. No other repository was read or written. No DoraHacks submission. Final action: commit/push this handoff and redesign-verification.json only, verify main, then stop.

- 2026-10-04 audit checkpoint: .env ignore check passed and git log --all -- .env is empty; contents not read. npm run test:contract passed 16 tests including 256 conservation fuzz cases under a namespace masking .env. Fresh RPC/bytecode comparison, wallet/browser audit and secret-history scan pending.

## Audit handoff — 2026-10-04T15:51:10.364226Z

- Baseline/workspace: /home/rouma/porter, main, public/local d78a1e551e9249d39f5269d43e478f861bf17c8a. Sole origin Porter; authenticated dmetagame. Older redesign handoff is historical and does not authorize further styling or deployments.
- Report: docs/AUDIT.md. P1: README/VERIFICATION falsely described current mock-only browser tests as local-EVM execution, and VERIFICATION still denied the existing proof. Corrected that reproducible documentation defect; proof claims unchanged. Note: issuer-blocked payee can keep funds locked without cancellation; contract unchanged.
- Changed: README.md test-scope sentence; docs/VERIFICATION.md; test/Porter.t.sol payee-failure rollback/retry check; browser-tests/porter.spec.ts reverted/unmined recovery checks; docs/AUDIT.md; evidence/audit-rpc.json, audit-browser.json, audit-security.json; this state. No src/, contracts/, pinned address, recorded transactions, blurb, design or operator-runbook change.
- Verification: 17 contract tests (256 fuzz cases), 4 unit tests, build and 8 production browser fixtures passed. Fresh Arc runtime/creation/token/room/transfers/gas matched independently compiled output and frozen proof. Six real public pages (light/dark,1440/390/320) HTTPS 200, correct proof, visible focus and no overflow; JS/CSS bytes match main build.
- .env ignored/untracked and absent from all reachable history; never read. Pattern/BIP39/history scans found no detected secrets in stated scope. All Foundry/Vite/browser commands masked .env; mock images redirected to /tmp, leaving old evidence intact. No wallet request on actual live checks; simulated tests only. No contract deployment, other repository access or DoraHacks submission.
- Next: inspect scoped diff/frozen comparison, commit and push only these files to Porter main, verify local/upstream/public IDs. No manual Vercel deployment because the app did not change. Resolve the audit commit ID with git rev-parse HEAD; do not add an endless self-referential receipt commit.

- Audit cleanup: removed only task-created reproducible dist/out/cache/test-results and disposable /tmp audit scripts/fixture images after successful checks. Preserved dependencies, source, lockfile, historical proof/images, new audit evidence, Vercel link and unread .env.

- 2026-10-04T15:55:52.889987Z audit publication receipt: 27edb6578d0e7ccf52648e99a070ecbdafe3e77e pushed to Porter main and independently matched by git ls-remote. Worktree clean and main aligned with origin/main. Frozen contract, pin, receipts, proof, blurb, runbook and src/ comparison passed again after commit. All audit deliverables are backed up on public main. This state-only receipt follows that verified checkpoint; resolve its own commit with git rev-parse HEAD and verify public main before handoff.
