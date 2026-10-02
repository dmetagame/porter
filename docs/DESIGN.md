# Porter design

Porter is a settlement desk for senders and callers. Its single job is to make a funded payment's timing, recipient and caller economics inspectable.

- Palette: Dispatch blue `#2456cf`, ink `#1e2d43`, paper blue `#f4f7fc`, white `#ffffff`, slate `#586a83`, confirmed mint `#17715e`.
- Type: Barlow Condensed for restrained large departure language and amounts; DM Sans for controls and prose; JetBrains Mono for addresses and base units.
- Layout: a payment manifest beside the introduction; exact funding composer beside the queue; evidence and operator instructions below.
- Signature: the manifest splits one locked amount into its payee payout and caller bounty. Its status explicitly says whether proof exists.
- Review: rejected generic finance gradients and live-looking invented metrics. Every number in the introductory manifest is a labeled default, not a reported balance or receipt.
- Mobile: one column, 48px controls, readable addresses with wrapping, accessible labels and visible focus. No required motion.
