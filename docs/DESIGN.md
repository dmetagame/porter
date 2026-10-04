# Porter design

Porter is a precise payment instrument for a sender and any due-time caller. The first screen explains the lock, the split and the shared USDC currency with a real receipt, rather than a product illustration or a dashboard of metrics.

## Composition

The opening pairs a short explanation with the confirmed room receipt. A large **0.11 USDC** locked amount branches into **0.10 USDC payee payout** and **0.01 USDC caller bounty**. The connector expresses the two destinations; its geometry does not represent percentages, volume or performance. The receipt includes the actual **0.00171944 USDC** settle gas, real open/settle explorer links and the explicit disclosure that sender, payee and caller were the same builder wallet. All values come from frozen mainnet-proof.json; a proof-less render labels its suggested amounts as defaults.

Below the receipt, the exact pinned address and runtime/token check sit above the working instrument: the sender's form on the left and caller's room queue on the right. Current loading, missing-wallet, wrong-network, validation, fee, pending and confirmation states remain visible. Transaction activity is separate from the permanent proved receipt. Operator deployment remains secondary in a disclosure and retains its original unpinned-only visibility and wallet guards. A fresh pinned app does not invite another deployment.

Mobile uses one page column. The two destinations stay together inside one compact receipt; forms and rooms stack. The settled room remains an actual Arc read, not a reconstruction. No invented balances, users, yield, second caller or profitability claim appear.

## Color system

The former dispatch-blue palette (#2456cf, #1e2d43, #f4f7fc and blue washes) is retired. The new system uses mineral paper, green ink and quiet green surfaces. These colors are all CSS tokens; no gradient, glass, image or decorative motion is needed.

| Token | Default | Dark preference | Role |
| --- | --- | --- | --- |
| canvas | #f1f4f0 | #141e19 | Page |
| paper | #ffffff | #1c2a22 | Working surfaces |
| ink | #20332b | #eef4ed | Primary text and amounts |
| muted | #526359 | #b1c4b6 | Quiet labels and supporting text |
| line | #c9d4cc | #415a48 | Structural borders |
| accent | #275942 | #bed8ac | Actions, links and split junctions |
| wash | #e4ede4 | #293b2c | Payee field and confirmed state |
| focus | #945216 | #e8b977 | Visible keyboard outline |
| danger | #923c32 | #ffc4b6 | Error text/border |
| danger-wash | #fff1ec | #3d2522 | Error surface |

Dark preference follows prefers-color-scheme, with independently chosen contrast pairs instead of an inverted screenshot. Input borders use the muted token to stay identifiable. Disabled controls retain legible text. Color never carries confirmation or error meaning alone.

## Typography and detail

DM Sans is the single display, amount and interface voice, using restrained 500/600/700 weights and tabular amounts. Short receipt values are padded to two decimal places without rounding longer values. The large locked amount and smaller destination amounts create the hierarchy; labels remain quiet. The former Barlow display styling is retired. JetBrains Mono is reserved for addresses, transaction hashes and base-unit quantities. Both font families are self-hosted.

The small Porter mark repeats the lock-to-two-destinations topology. Receipt corners, split junctions and amount alignment provide identity without introducing a metaphorical product shot. Form labels, defaults, immutable funding caveat and real explorer links are part of the instrument, not promotional copy.

## Access and preservation

Buttons, inputs, selects and primary links have at least 44px targets. Addresses wrap, grid tracks can shrink, visible focus uses a 3px outline, and reduced motion disables transitions/animation. The page does not require motion to explain or operate anything. Empty form/queue and pending recovery are checked separately from the proved state.

All wallet handlers are preserved byte-for-byte. Browser interaction tests inject a clearly labeled mock wallet and intercept RPC reads; every signing request is rejected locally, so they never sign, broadcast or deploy a contract. Production checks use real read-only Arc data with no wallet injection. contracts/, the deployment pin, mainnet-proof.json, the proof hashes and the four blurb sentences remain frozen.
