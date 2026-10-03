# Porter

Porter is an early payment prototype on Arc: a sender locks a scheduled USDC payout plus a caller bounty in one room. Once due, any wallet may settle once. The payee receives the payout and the caller receives the bounty in the same transaction.

Operator app: **[https://porter-gilt.vercel.app](https://porter-gilt.vercel.app)**. **Mainnet proof does not exist yet.** This unsigned page is published only so the operator can follow [docs/OPERATOR.md](docs/OPERATOR.md) from a browser. Hosting does not deploy the contract or establish payment evidence.

Arc makes payout, bounty and gas all USDC. A caller can compare the bounty with a USDC fee estimate without acquiring a second gas token. The bounty is received after execution; callers still need real USDC for gas up front. There is no mainnet faucet.

Porter is not a keeper network, a promise that bounty exceeds gas, or evidence of anyone besides the builder using it. No automatic execution is promised. Rooms are one-shot; there is no cancel/refund/admin/sweep path. Use small amounts and confirm the payee carefully.

<!-- PIN START -->

Pinned address: **none yet**. No Porter mainnet deployment has been signed in this session. The app ships an unsigned operator wallet path and refuses approval until a matching Porter runtime and canonical USDC are verified.
<!-- PIN END -->

<!-- PROOF START -->

**Mainnet proof does not exist yet.** `evidence/mainnet-proof.json` has empty claims and null opening/settlement hashes. The four-sentence hackathon blurb is deliberately absent until both real Arc transactions are verified. Local tests do not qualify as mainnet proof.
<!-- PROOF END -->

## Run and verify

Requires Node 22.12+ and Foundry (`forge`, `anvil`) on PATH.

```sh
npm ci
npm run test:contract
npm test
npm run build
npm run dev
```

`npm run build` compiles this project's `contracts/Porter.sol`, generates its own ABI/bytecode artifact, typechecks the app and builds production assets in `dist/`. `npm run preview` serves that production output. No other project artifacts are used. `npm run test:browser` checks desktop/mobile states and an explicitly isolated local-EVM wallet workflow; see [verification](docs/VERIFICATION.md).

The separate Vercel project is `dmetagames-projects/porter`. Its [hosting configuration](vercel.json) typechecks and builds the app using the committed Porter artifact, without requiring Foundry on the hosting machine. Re-run `npm run build` locally when changing the contract, then commit the generated artifact. The initial publication used a local production build and `vercel deploy --prebuilt --prod`; public browser checks are recorded in [evidence/hosting.json](evidence/hosting.json), separate from mainnet payment evidence.

## Wallet path

1. Connect an Ethereum-compatible browser wallet and switch to Arc mainnet (5042).
2. Every fresh visitor uses the one pinned Porter contract, once the operator has completed [deployment and pinning](docs/OPERATOR.md). Its runtime and immutable USDC address are checked before approval.
3. Set a payee wallet. Default builder-controlled proof room: 0.10 USDC payout, 0.01 USDC bounty and a 60-second delay. These are suggested inputs, not a receipt.
4. Sign **Approve exactly 0.11 USDC**, then **Fund and open room**. The due time is derived from the latest chain timestamp. Room funding transfers exactly payout plus bounty.
5. When due, connect the caller wallet, refresh the queue, and select **Estimate settle fee**. The app reads real RPC gas units and max-fee data, displays the fee in USDC with 18-decimal accounting, then refreshes the estimate before signing.
6. Sign **Settle**. The app requires a successful receipt and shows actual gas charged. If the sender settles, the UI says so. Explorer links preserve pending/reverted states; no success is inferred from a submitted hash.

Approval and app amounts use the ERC-20 interface's **6 decimals**. Gas uses native USDC's **18 decimals**. These are the same underlying balance, not two assets. See [Arc's native model](https://docs.arc.io/arc/concepts/stablecoin-native-model) and [network reference](https://docs.arc.io/arc/references/connect-to-arc).

| Setting             | Value                                        |
| ------------------- | -------------------------------------------- |
| Mainnet chain       | 5042                                         |
| RPC                 | https://rpc.mainnet.arc.io                   |
| Explorer            | https://explorer.arc.io                      |
| Constructor USDC    | `0x3600000000000000000000000000000000000000` |
| ERC-20 decimals     | 6                                            |
| Native gas decimals | 18                                           |

## Contract boundaries

`openRoom(payee,payout,bounty,dueAt)` locks immutable room terms and rejects zero/unsafe recipients, nonpositive amounts and a due time that has already passed. A received-balance check rejects short funding. `settle(roomId,expectedPayout,expectedBounty)` rejects early, repeated, unknown-room and wrong-amount calls; pays the locked recipient and current caller atomically. A failed token transfer rolls back both payout and state. The constructor token is immutable and there is no chain-ID hardcode.

Accounting tests use a local token double. Arc-specific token restrictions and shared native/USDC behavior still need real-network validation; no third-party audit is claimed. Settlers can race: only the first successful call earns the bounty. A losing transaction may consume gas. Issuer restrictions can make transfers revert.

## Evidence and submission

The read-only `pin` and `evidence` tools use the fixed Arc mainnet RPC. They validate creation input/runtime, success status, contract addresses, room terms, due time, funding and the exact 6-decimal USDC transfer events. They never sign or take a key. Claims are populated only after both receipts pass.

Arc Microgrants deadline: **14 October 2026, 23:59 ET**. This unsigned state does not meet mainnet eligibility. No DoraHacks submission was made. Public builder: [dmetagame](https://github.com/dmetagame).

License: [MIT](LICENSE).
