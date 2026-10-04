# Porter audit — 2026-10-04

Baseline: public/local `main` at `d78a1e551e9249d39f5269d43e478f861bf17c8a`, sole remote `https://github.com/dmetagame/porter.git`, initially clean worktree. This audit used public Arc reads and simulated test wallets only. No `.env` contents were read, wallet signed, contract deployed, key requested, other repository accessed or DoraHacks submission made.

**No P0 findings. One P1 finding was reproduced and fixed in documentation. No unresolved P0 or P1 remains.** App source, visual design, contract, pin, recorded payment proof and four-sentence blurb were not changed. The audit does not extend the existing builder-controlled proof or establish third-party use.

## Findings

| ID | Severity | File or transaction | Observation and reproduction | Fixed? |
| --- | --- | --- | --- | --- |
| A-01 | P1 | `README.md` Run and verify; `docs/VERIFICATION.md` | At the baseline, README said browser tests exercised an isolated local-EVM wallet workflow. VERIFICATION said mainnet proof did not exist, described an Anvil deployment/payment test, and instructed the operator to sign a proof. Current `browser-tests/porter.spec.ts` instead intercepts RPC reads and rejects mock signing requests; it does not run Anvil or execute payment transactions. The verified Arc proof already exists. Reading these files together reproduces an inconsistent and overstated verification account, preventing a judge from trusting the documented test scope. | **Yes.** Corrected only those documentation statements to describe the existing proof and actual mock boundary. The proof links, figures, blurb and app claims remain unchanged. |
| A-02 | note | `contracts/Porter.sol:90`, `test/Porter.t.sol` | A token refusing transfers to the locked payee prevents settlement. The added `testPayeeFailureKeepsFundsLockedUntilTransferCanSucceed` makes the payee transfer fail on two attempts: no recipient is paid, `settled` remains false and 110000 units remain locked. Removing the simulated restriction permits exactly the programmed payout and bounty. No cancel/refund/admin path exists, so a permanent issuer restriction can keep a room locked permanently. README already discloses issuer restrictions and the absence of refund paths. This is an existing dependency boundary, not an observed mainnet failure or incorrect accounting. | **No contract change.** Recorded the limitation and added a regression check. A recovery mechanism would change the product and deployed address, outside this audit. |

The stale verification description was the only defect fixed. No style, feature, contract or application change was needed. No deployment command was run; the authorized documentation push may trigger the repository's existing Vercel integration.

## Contract review

Reviewed `contracts/Porter.sol` against the tests and fresh Arc runtime. `openRoom` rejects zero, Porter and token recipients, zero amounts and elapsed due times. Checked arithmetic rejects overflow. It pulls payout plus bounty and checks the exact received-balance delta before creating a room. Locked room terms cannot be amended.

`settle` rejects unknown rooms, early calls, repeats and either wrong expected amount. The shared reentrancy guard spans both opening and settlement. State is changed before transfers, but a token revert or false result reverts the entire transaction, including the settled flag, totalLocked accounting and an earlier payee transfer. Tests cover both payee failure and bounty failure. No path that spends a second room's principal or releases less than its programmed amounts was reproduced for the pinned canonical USDC contract.

The tests use a local token double. They do not prove every issuer restriction or arbitrary token's behavior. The mainnet constructor is immutable canonical USDC; this audit does not generalize its successful transfer semantics to other tokens. User-selected recipient contracts other than Porter/token are permitted; Porter cannot guarantee that such a recipient can later withdraw its received tokens. Direct token donations are not room funding and have no sweep path. These boundaries do not alter room #1's proved payout.

## Fresh Arc proof comparison

Independent JSON-RPC requests to `https://rpc.mainnet.arc.io` checked `eth_chainId`, `eth_getCode`, `eth_getTransactionByHash`, `eth_getTransactionReceipt`, `eth_getBlockByNumber`, and `eth_call` for `usdc`, token `decimals` and room #1. The comparisons used the freshly compiled `out/Porter.sol/Porter.json`, not only the committed proof or artifact. See [audit-rpc.json](../evidence/audit-rpc.json) for timestamped results.

- Chain: **5042**. Contract: **0x3E92CbEe456dBcBdafaC5b2054347c36367d60d6**.
- [Deployment](https://explorer.arc.io/tx/0xa0c578a5831a51f7ab7327b34ceadd940df28a0e0863d64d04d7d335a8a99580): successful creation, block 24211715, matching creation input, constructor token `0x3600000000000000000000000000000000000000`, zero native value.
- Runtime equals fresh Solidity 0.8.30 / optimizer 200 / Cancun output after inserting the immutable token address. Keccak-256: `0x62f03541e64a796e2bf4f4e056843f547297f2139e0436984e5db5ea8cf0314d`, matching pin and app expectation. Committed creation/runtime artifact also matches the fresh compilation. No runtime mismatch; no redeployment.
- [Open](https://explorer.arc.io/tx/0x18ab61c5dd1c812a7bdd1096ad096e6d9bfd48b1db9bc86329db331cc2353835): successful, block 24211733, room 1, payout **100000** and bounty **10000** six-decimal ERC-20 units. Funding event transfers exactly **110000** units to Porter. Calldata and RoomOpened terms match.
- [Settle](https://explorer.arc.io/tx/0x1e90ded621847c72c7ae6a45f87f6b5c73cbc4928609fde654df27071e5fb2a1): successful, block 24211859. Expected amounts and RoomSettled match room 1. Exactly two canonical-token transfer logs send **100000** and **10000** units from Porter to the recorded payee/caller.
- Sender, payee and caller are all **0xEE3eA6f858aE84dD6959f241DfC257a2f8fA3f53**. Due time 1791112738; settlement block timestamp 1791112745. Current room terms match and `settled` is true.
- Settlement gas **85972** × effective price **20000000000** native base units = **1719440000000000** base units, or **0.00171944 USDC** at 18 decimals. Opening and deployment receipt gas are separately recorded in the audit snapshot; they are not the settlement figure.

`evidence/deployment.json`, `evidence/mainnet-proof.json`, saved open/settle receipt gas, README and live receipt agree. README's `0.1` and the UI's `0.10` are the same six-decimal payout. Builder control and absence of independent use are preserved operator declarations, not inferred third-party participation from chain events. No frozen proof record was edited to pass a comparison.

## Wallet and browser audit

Reviewed transaction functions in `src/main.tsx`. `send` records a submitted hash as submitted, waits for a receipt, and throws on reverted status before the action's success notice. A pending hash alone never establishes payment. Recovery keeps an unavailable receipt pending with signatures disabled; a reverted receipt gets reverted history and no payment notice. Added simulated recovery checks verify both cases with an unpaid queue room. The persistent receipt panel continues to describe the existing real room, separately from those simulated actions.

Approval arguments are exactly `amount(payout) + amount(bounty)`; defaults produce 110000 units (**0.11 USDC**). Opening rechecks exact allowance and derives due time from the latest Arc block. Runtime/token/network are checked before funding. Settlement refreshes fee estimates, checks on-chain due time and caller gas balance, and signs locked expected amounts. Sender-settled text compares actual sender and caller accounts; the static proof correctly discloses that sender, payee and caller were the same builder wallet. No new transaction was signed in these checks.

Fresh [public app](https://porter-gilt.vercel.app) loads passed at 1440, 390 and 320px in both light and dark preferences, without wallet injection or RPC fixtures. Exact pinned address and open/settle links were visible; 0.11/0.10/0.01 and measured gas remained unchanged. No page errors, horizontal overflow, broken keyboard focus or invented metrics were observed. Displayed form amounts are labeled defaults; connected balances and fee estimates come from RPC. Public JavaScript/CSS bytes equal the local production build of baseline main, so there was no live/main disagreement requiring a second live replacement. Local production fixture checks also passed. See [audit-browser.json](../evidence/audit-browser.json).

## Secrets and claims

`git check-ignore .env` passes; `.env` is neither tracked nor listed by status. `git log --all -- .env` is empty. Pattern scans covered the tracked/nonignored source tree, all 79 reachable history blobs and eight baseline commit messages. English BIP39-valid mnemonic scanning found no phrase. Key-sized candidates were classified against public Arc transaction/receipt data and recomputed frozen-file digests; no unclassified candidates remained. No private-key, seed or copied-credential pattern was detected in that scope. Only paths were permitted in candidate output; no candidate secret value was printed. Ignored `.env` contents were excluded; pattern scans cannot prove arbitrary secrets are absent. See [audit-security.json](../evidence/audit-security.json).

Read README, `docs/HACKATHON_BLURB.md` and the live copy together. None claims a distinct caller for this proof, keeper profit, automatic execution or independent use. “Anyone can settle” describes permission to call once due; it does not promise an automated transaction. The four blurb sentences remain byte-for-byte unchanged.

## Verification and change boundary

- `npm run test:contract`: **17 passed**, including 256 conservation fuzz cases and the new repeated payee-failure/retry check; original 16 also passed before changes.
- `npm test`: **4 passed**.
- `npm run build`: **passed**. Existing timestamp lint and bundle-size advisories are non-failing; neither reproduced a defect.
- `npm run test:browser`: **8 passed** on the production build, including two added reverted/unmined recovery checks; original six also passed before changes. Wallet/RPC fixtures were labeled, signatures rejected locally and no transaction broadcast.
- Live light/dark desktop/mobile checks: **six fresh pages passed**, HTTPS 200, exact proof links and amounts, visible focus and no overflow.
- Build/test/browser commands ran with the actual `.env` masked by `/dev/null`, preventing automatic Foundry/Vite reads. Mock screenshots were redirected outside the repository so prior evidence images were preserved.
- `git diff --exit-code d78a1e5 -- contracts/ evidence/deployment.json evidence/mainnet-proof.json evidence/receipts.json docs/HACKATHON_BLURB.md docs/OPERATOR.md src/ src/styles.css`: **passed**. Frozen proof, artifact, wallet behavior and design remain unchanged.

Changes are limited to this report and audit snapshots, corrected verification documentation, focused tests and the living project state. Only Porter main is authorized for the push. No manual app redeployment is needed because app code did not change.
