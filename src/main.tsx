import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createWalletClient,
  custom,
  decodeEventLog,
  getAddress,
  keccak256,
  type Address,
  type EIP1193Provider,
  type Hash,
  type Hex,
} from "viem";
import { arc, publicClient } from "./chain";
import { porterAbi, tokenAbi } from "./abi";
import {
  amount,
  recipient,
  units,
  gasDollars,
  short,
  txLink,
  errorText,
  USDC,
  EXPLORER,
  EXPECTED_RUNTIME_HASH,
} from "./domain";
import artifact from "./porter-artifact.json";
import deployment from "../evidence/deployment.json";
import mainnetProof from "../evidence/mainnet-proof.json";
import "./styles.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/jetbrains-mono/400.css";

type Provider = EIP1193Provider & {
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    callback: (...args: unknown[]) => void,
  ) => void;
};
declare global {
  interface Window {
    ethereum?: Provider;
  }
}
type Room = {
  id: bigint;
  sender: Address;
  payee: Address;
  payout: bigint;
  bounty: bigint;
  dueAt: bigint;
  settled: boolean;
};
type Fee = {
  room: string;
  caller: Address;
  gas: bigint;
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  maximum: bigint;
  block: bigint;
};
type Transaction = {
  hash: Hash;
  action: string;
  status: "submitted" | "success" | "reverted";
};
const pinned = deployment.address as Address | null;
const proofReady =
  mainnetProof.status === "confirmed" &&
  Boolean(mainnetProof.openTransaction && mainnetProof.settleTransaction);
// Preserve every decimal; pad short amounts for the receipt's typographic alignment.
function displayAmount(value: string) {
  const [whole, fraction = ""] = value.split(".");
  return `${whole}.${fraction.padEnd(2, "0")}`;
}
function download(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          data,
          (_key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          2,
        ),
      ],
      { type: "application/json" },
    ),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [account, setAccount] = useState<Address>();
  const [chain, setChain] = useState<number>();
  const [contract, setContract] = useState<Address>();
  const [balance, setBalance] = useState<bigint>();
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payee, setPayee] = useState("");
  const [payout, setPayout] = useState("0.10");
  const [bounty, setBounty] = useState("0.01");
  const [delay, setDelay] = useState("60");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fee, setFee] = useState<Fee>();
  const [history, setHistory] = useState<Transaction[]>([]);
  const [pending, setPending] = useState<Transaction>();
  const [deploymentReceipt, setDeploymentReceipt] = useState<unknown>();
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const lock = useRef(false);
  const alert = useRef<HTMLDivElement>(null);
  const ready = Boolean(account && chain === arc.id);
  const disabled = Boolean(busy || pending);
  let total: bigint | undefined;
  let formError = "";
  try {
    total = amount(payout) + amount(bounty);
    recipient(payee, contract);
    if (!/^\d+$/.test(delay) || Number(delay) < 15 || Number(delay) > 86400)
      throw new Error("Choose a delay between 15 seconds and 24 hours.");
  } catch (cause) {
    formError = errorText(cause);
  }

  async function verify(address: Address) {
    if ((await publicClient.getChainId()) !== arc.id)
      throw new Error(
        "The RPC is not Arc mainnet. No wallet action is enabled.",
      );
    const code = await publicClient.getCode({ address });
    if (!code || keccak256(code) !== EXPECTED_RUNTIME_HASH)
      throw new Error(
        "Porter runtime verification failed. Do not approve this contract.",
      );
    const token = await publicClient.readContract({
      address,
      abi: porterAbi,
      functionName: "usdc",
    });
    const decimals = await publicClient.readContract({
      address: USDC,
      abi: tokenAbi,
      functionName: "decimals",
    });
    if (getAddress(token) !== getAddress(USDC) || decimals !== 6)
      throw new Error(
        "The contract token is not the 6-decimal Arc USDC interface.",
      );
    setContract(address);
    return address;
  }
  function wallet() {
    if (!window.ethereum || !account)
      throw new Error("Connect a browser wallet first.");
    return createWalletClient({
      account,
      chain: arc,
      transport: custom(window.ethereum),
    });
  }
  async function requireWallet() {
    const client = wallet();
    if ((await client.getChainId()) !== arc.id)
      throw new Error(
        "Switch your wallet to Arc mainnet (5042) before signing.",
      );
    return client;
  }
  async function refresh(address = contract, owner = account) {
    if (owner)
      setBalance(
        await publicClient.readContract({
          address: USDC,
          abi: tokenAbi,
          functionName: "balanceOf",
          args: [owner],
        }),
      );
    if (!address) return;
    const count = await publicClient.readContract({
      address,
      abi: porterAbi,
      functionName: "roomCount",
    });
    const records: Room[] = [];
    for (let id = count; id > 0n && id > count - 20n; id--) {
      const [sender, payee, payout, bounty, dueAt, settled] =
        await publicClient.readContract({
          address,
          abi: porterAbi,
          functionName: "rooms",
          args: [id],
        });
      records.push({ id, sender, payee, payout, bounty, dueAt, settled });
    }
    setRooms(records);
    if (owner)
      setAllowance(
        await publicClient.readContract({
          address: USDC,
          abi: tokenAbi,
          functionName: "allowance",
          args: [owner, address],
        }),
      );
  }
  async function act(label: string, operation: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await operation();
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      lock.current = false;
      setBusy("");
    }
  }
  async function send(action: string, sign: () => Promise<Hash>) {
    const hash = await sign();
    const transaction: Transaction = { hash, action, status: "submitted" };
    setHistory((previous) => [...previous, transaction]);
    setPending(transaction);
    try {
      sessionStorage.setItem("porter.pending", JSON.stringify(transaction));
    } catch {
      /* The known hash remains visible even if storage is unavailable. */
    }
    setBusy(`${action}: waiting for Arc confirmation…`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    setHistory((previous) =>
      previous.map((item) =>
        item.hash === hash
          ? {
              ...item,
              status: receipt.status === "success" ? "success" : "reverted",
            }
          : item,
      ),
    );
    setPending(undefined);
    try {
      sessionStorage.removeItem("porter.pending");
    } catch {
      /* Receipt confirmation does not depend on storage. */
    }
    if (receipt.status !== "success")
      throw new Error(
        `${action} reverted. No successful payment is being reported; inspect the transaction.`,
      );
    return receipt;
  }
  useEffect(() => {
    const timer = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    if (pinned)
      void act("Verifying pinned Porter…", async () => {
        const verified = await verify(pinned);
        await refresh(verified);
      });
    try {
      const saved = sessionStorage.getItem("porter.pending");
      if (saved) {
        const item = JSON.parse(saved) as Transaction;
        if (/^0x[0-9a-fA-F]{64}$/.test(item.hash)) {
          setPending(item);
          setHistory([item]);
        }
      }
    } catch {
      /* no saved payment claim */
    }
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) return;
    const changed = () => {
      setAccount(undefined);
      setChain(undefined);
      setBalance(undefined);
      setAllowance(0n);
      setFee(undefined);
      setNotice(
        "Wallet changed. Connect again to refresh its account and network.",
      );
    };
    provider.on?.("accountsChanged", changed);
    provider.on?.("chainChanged", changed);
    return () => {
      provider.removeListener?.("accountsChanged", changed);
      provider.removeListener?.("chainChanged", changed);
    };
  }, []);
  useEffect(() => {
    if (error) {
      alert.current?.focus();
      alert.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
  }, [error]);

  const connect = () =>
    act("Connecting wallet…", async () => {
      if (!window.ethereum)
        throw new Error(
          "No browser wallet found. Open Porter in a wallet browser or install an Ethereum-compatible wallet, then reload.",
        );
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as Address[];
      if (!accounts[0]) throw new Error("The wallet did not share an account.");
      const selected = getAddress(accounts[0]);
      setAccount(selected);
      setFee(undefined);
      const network = Number(
        await window.ethereum.request({ method: "eth_chainId" }),
      );
      setChain(network);
      if (network === arc.id) await refresh(contract, selected);
    });
  const switchChain = () =>
    act("Switching to Arc…", async () => {
      if (!window.ethereum) throw new Error("Connect a browser wallet first.");
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13b2" }],
        });
      } catch (cause) {
        const code = (cause as { code?: number }).code;
        if (code !== 4902) throw cause;
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13b2",
              chainName: "Arc",
              nativeCurrency: arc.nativeCurrency,
              rpcUrls: arc.rpcUrls.default.http,
              blockExplorerUrls: [EXPLORER],
            },
          ],
        });
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13b2" }],
        });
      }
      setNotice(
        "Arc selected. Connect again to read the wallet account and USDC balance.",
      );
    });
  const approve = () =>
    act("Confirm exact approval in your wallet…", async () => {
      if (!contract || !total || formError)
        throw new Error(formError || "A verified Porter contract is required.");
      const client = await requireWallet();
      await verify(contract);
      await send("Approve USDC", () =>
        client.writeContract({
          address: USDC,
          abi: tokenAbi,
          functionName: "approve",
          args: [contract, total],
        }),
      );
      await refresh();
      setNotice(`Confirmed exact allowance: ${units(total)} USDC.`);
    });
  const open = () =>
    act("Confirm room funding in your wallet…", async () => {
      if (!contract || !total || formError)
        throw new Error(formError || "A verified Porter contract is required.");
      const client = await requireWallet();
      await verify(contract);
      const allowed = await publicClient.readContract({
        address: USDC,
        abi: tokenAbi,
        functionName: "allowance",
        args: [account!, contract],
      });
      if (allowed !== total)
        throw new Error(
          "Approve the exact payout plus bounty for these terms first.",
        );
      const latest = await publicClient.getBlock();
      const due = latest.timestamp + BigInt(delay);
      const receipt = await send("Open room", () =>
        client.writeContract({
          address: contract,
          abi: porterAbi,
          functionName: "openRoom",
          args: [
            recipient(payee, contract),
            amount(payout),
            amount(bounty),
            due,
          ],
        }),
      );
      const event = receipt.logs
        .filter((log) => getAddress(log.address) === getAddress(contract))
        .map((log) => {
          try {
            return decodeEventLog({
              abi: porterAbi,
              topics: log.topics,
              data: log.data,
            });
          } catch {
            return null;
          }
        })
        .find((log) => log?.eventName === "RoomOpened");
      if (!event || event.eventName !== "RoomOpened")
        throw new Error(
          "Receipt confirmed but its room event could not be read. Refresh before opening another room.",
        );
      await refresh();
      setNotice(
        `Room #${event.args.roomId} opened on Arc. Builder-controlled test; waiting until its due time.`,
      );
    });
  async function estimate(room: Room): Promise<Fee> {
    await requireWallet();
    const block = await publicClient.getBlock();
    if (block.timestamp < room.dueAt)
      throw new Error(
        "Arc has not reached this room’s due time yet. Refresh and estimate once due.",
      );
    const gas = await publicClient.estimateContractGas({
      address: contract!,
      abi: porterAbi,
      functionName: "settle",
      args: [room.id, room.payout, room.bounty],
      account,
    });
    const fees = await publicClient.estimateFeesPerGas();
    const result: Fee = {
      room: room.id.toString(),
      caller: account!,
      gas,
      maxFeePerGas: fees.maxFeePerGas,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      gasLimit: (gas * 120n + 99n) / 100n,
      maximum: ((gas * 120n + 99n) / 100n) * fees.maxFeePerGas,
      block: block.number,
    };
    setFee(result);
    return result;
  }
  const settle = (room: Room) =>
    act("Checking settlement and fee…", async () => {
      const client = await requireWallet();
      await verify(contract!);
      const currentFee = await estimate(room);
      const nativeBalance = await publicClient.getBalance({
        address: account!,
      });
      if (nativeBalance < currentFee.maximum)
        throw new Error(
          "This caller needs more real USDC for the gas estimate. The bounty arrives after execution and cannot fund this transaction up front.",
        );
      const receipt = await send("Settle room", () =>
        client.writeContract({
          address: contract!,
          abi: porterAbi,
          functionName: "settle",
          args: [room.id, room.payout, room.bounty],
          gas: currentFee.gasLimit,
          maxFeePerGas: currentFee.maxFeePerGas,
          maxPriorityFeePerGas: currentFee.maxPriorityFeePerGas,
        }),
      );
      await refresh();
      setFee(undefined);
      const same = getAddress(room.sender) === getAddress(account!);
      setNotice(
        `Room #${room.id} settled. Payout ${units(room.payout)} USDC; caller bounty ${units(room.bounty)} USDC; actual gas ${gasDollars(receipt.gasUsed * receipt.effectiveGasPrice)} USDC. ${same ? "The sender also settled." : "A distinct caller wallet settled; this alone does not prove independent use."}`,
      );
    });
  const deploy = () =>
    act("Confirm Porter deployment in your wallet…", async () => {
      const client = await requireWallet();
      const receipt = await send("Deploy Porter", () =>
        client.deployContract({
          abi: artifact.abi,
          bytecode: artifact.bytecode as Hex,
          args: [USDC],
        }),
      );
      if (!receipt.contractAddress)
        throw new Error("Deployment receipt has no contract address.");
      await verify(receipt.contractAddress);
      await refresh(receipt.contractAddress);
      setDeploymentReceipt({
        project: "Porter",
        chainId: arc.id,
        address: receipt.contractAddress,
        transactionHash: receipt.transactionHash,
        runtimeHash: EXPECTED_RUNTIME_HASH,
        block: receipt.blockNumber,
        token: USDC,
      });
      setNotice(
        "Porter deployed and runtime verified for this tab. Download the receipt and follow the operator runbook to pin it for every visitor.",
      );
    });
  const checkPending = () =>
    act("Checking submitted transaction…", async () => {
      if (!pending) return;
      const receipt = await publicClient.getTransactionReceipt({
        hash: pending.hash,
      });
      setHistory((previous) =>
        previous.map((item) =>
          item.hash === pending.hash
            ? {
                ...item,
                status: receipt.status === "success" ? "success" : "reverted",
              }
            : item,
        ),
      );
      if (
        receipt.status === "success" &&
        receipt.contractAddress &&
        pending.action === "Deploy Porter"
      ) {
        await verify(receipt.contractAddress);
        setDeploymentReceipt({
          project: "Porter",
          chainId: arc.id,
          address: receipt.contractAddress,
          transactionHash: receipt.transactionHash,
          runtimeHash: EXPECTED_RUNTIME_HASH,
          block: receipt.blockNumber,
          token: USDC,
        });
        await refresh(receipt.contractAddress);
      } else await refresh();
      setPending(undefined);
      try {
        sessionStorage.removeItem("porter.pending");
      } catch {
        /* Keep confirmed results independent of browser storage. */
      }
      setNotice(
        receipt.status === "success"
          ? "Transaction confirmed. State refreshed; inspect the link before signing another action."
          : "Transaction reverted. No successful payment is being reported.",
      );
    });

  return (
    <>
      <a className="skip" href="#desk">
        Skip to settlement desk
      </a>
      <header className="shell header">
        <a className="brand" href="#" aria-label="Porter home">
          <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden="true">
            <path d="M14 3v9M6 23v-7h16v7M14 12v4" />
            <circle cx="14" cy="3" r="2" /><circle cx="6" cy="23" r="2" /><circle cx="22" cy="23" r="2" />
          </svg>
          Porter
        </a>
        <span className="network"><span className="network-dot" aria-hidden="true" /> Arc mainnet <span className="network-chain">5042</span></span>
        <a className="source" href="https://github.com/dmetagame/porter">Source <span aria-hidden="true">↗</span></a>
      </header>
      <main>
        <section className="shell instrument" aria-labelledby="instrument-heading">
          <div className="instrument-intro">
            <p className="eyebrow">Scheduled USDC payments</p>
            <h1 id="instrument-heading">One lock.<br /><span>Two payments.</span></h1>
            <p className="lede">A sender locks a scheduled payout plus a caller bounty. Once due, anyone can settle the room and release both payments in one transaction.</p>
            <p className="currency-note"><span aria-hidden="true">↳</span> Payout, bounty and gas. All USDC.</p>
            <div className="wallet-actions">
              <button onClick={connect} disabled={disabled}>
                {account ? `Reconnect ${short(account)}` : "Connect wallet"}
                <span aria-hidden="true">↗</span>
              </button>
              {account && chain !== arc.id && (
                <button className="secondary" onClick={switchChain} disabled={disabled}>Switch to Arc · 5042</button>
              )}
            </div>
            <p className="wallet-context">
              {ready
                ? `${balance === undefined ? "Reading USDC balance…" : `${units(balance)} USDC available`} · one balance for payment and gas`
                : "Browser wallet · real USDC · no mainnet faucet"}
            </p>
            <a className="desk-link" href="#desk">Open a scheduled room <span aria-hidden="true">↓</span></a>
          </div>
          <aside className="payment-receipt" aria-label={proofReady ? "Confirmed mainnet payment split" : "Labeled default payment split"}>
            <div className="receipt-heading">
              <span className="eyebrow">{proofReady ? `Arc receipt · Room #${mainnetProof.roomId}` : "Default room · not a receipt"}</span>
              <span className={`chip ${proofReady ? "closed" : ""}`}>{proofReady ? "Settled" : "Unsigned"}</span>
            </div>
            <div className="receipt-locked">
              <span>Sender locked</span>
              <strong>{displayAmount(proofReady ? units(BigInt(mainnetProof.payoutBaseUnits) + BigInt(mainnetProof.bountyBaseUnits)) : "0.11")} <small>USDC</small></strong>
            </div>
            <div className="payment-split">
              <div className="split-branch" aria-hidden="true"><span /><span /></div>
              <div className="split-payment payee-payment">
                <span>Payee payout</span>
                <strong>{displayAmount(proofReady ? mainnetProof.payoutUSDC : "0.10")}<small>USDC</small></strong>
                <span className="split-caption">{proofReady ? "Paid to the payee" : "Labeled default"}</span>
              </div>
              <div className="split-payment bounty-payment">
                <span>Caller bounty</span>
                <strong>{displayAmount(proofReady ? mainnetProof.bountyUSDC : "0.01")}<small>USDC</small></strong>
                <span className="split-caption">{proofReady ? "Paid to the caller" : "Labeled default"}</span>
              </div>
            </div>
            <div className="receipt-gas"><span>{proofReady ? "Actual settle gas" : "Gas currency"}</span><b>{proofReady ? `${mainnetProof.gasCostUSDC} USDC` : "Also USDC"}</b></div>
            <p className="receipt-context">{proofReady ? "Builder-controlled test. The sender also settled; the payee and caller were the same builder wallet." : "These are suggested room terms. Mainnet proof does not exist yet."}</p>
            {proofReady && (
              <div className="receipt-links">
                <a href={txLink(mainnetProof.openTransaction!)}>Open transaction <span aria-hidden="true">↗</span></a>
                <a href={txLink(mainnetProof.settleTransaction!)}>Settle transaction <span aria-hidden="true">↗</span></a>
              </div>
            )}
          </aside>
        </section>
        <section className="shell status-strip" aria-label="Deployment status">
          <div>
            <span className="eyebrow">Porter contract</span>
            {contract ? (
              <a href={`${EXPLORER}/address/${contract}`}>
                <code>{contract}</code> ↗
              </a>
            ) : (
              <strong>{pinned ? "Checking pinned contract…" : "No pinned mainnet address yet"}</strong>
            )}
          </div>
          <span className="chip">
            {contract ? "Runtime + USDC verified" : pinned ? "Verifying runtime" : "Unsigned wallet path"}
          </span>
        </section>
        <div className="shell notices" aria-live="polite">
          {busy && (
            <p className="notice" role="status">
              {busy}
            </p>
          )}
          {notice && <p className="notice">{notice}</p>}
          {error && (
            <div className="error" role="alert" tabIndex={-1} ref={alert}>
              {error}
            </div>
          )}
          {pending && (
            <div className="pending">
              <p>
                Submitted transaction needs a confirmed result. New signatures
                are paused.
              </p>
              <a href={txLink(pending.hash)}>Inspect {pending.action} ↗</a>
              <button
                className="secondary"
                disabled={Boolean(busy)}
                onClick={checkPending}
              >
                Check confirmation
              </button>
            </div>
          )}
        </div>
        <section
          className="shell desk"
          id="desk"
          aria-labelledby="desk-heading"
        >
          <div className="section-title">
            <div>
              <p className="eyebrow">Make the next payment</p>
              <h2 id="desk-heading">Open. Wait. Settle.</h2>
            </div>
            <button
              className="text-button"
              disabled={disabled || !contract}
              onClick={() =>
                act("Refreshing Arc state…", async () => {
                  await refresh();
                  setFee(undefined);
                })
              }
            >
              Refresh chain state ↻
            </button>
          </div>
          <div className="desk-grid">
            <form
              className="composer"
              onSubmit={(event) => {
                event.preventDefault();
                void open();
              }}
            >
              <div className="panel-heading"><h3>Open a room</h3><span className="panel-label">Sender</span></div>
              <p className="muted">
                Choose the payee, the split and the due time. Funding pays once and cannot be cancelled.
              </p>
              <label>
                Payee wallet
                <input
                  value={payee}
                  onChange={(event) => setPayee(event.target.value)}
                  className="address-input"
                  placeholder="0x…"
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
              </label>
              <div className="form-pair">
                <label>
                  Payout · USDC
                  <input
                    value={payout}
                    onChange={(event) => setPayout(event.target.value)}
                    inputMode="decimal"
                    required
                  />
                </label>
                <label>
                  Caller bounty · USDC
                  <input
                    value={bounty}
                    onChange={(event) => setBounty(event.target.value)}
                    inputMode="decimal"
                    required
                  />
                </label>
              </div>
              <p className="field-note">Labeled defaults: 0.10 USDC payout + 0.01 USDC bounty.</p>
              <label>
                Due after
                <select
                  value={delay}
                  onChange={(event) => setDelay(event.target.value)}
                >
                  <option value="60">1 minute</option>
                  <option value="180">3 minutes</option>
                  <option value="600">10 minutes</option>
                  <option value="3600">1 hour</option>
                </select>
              </label>
              <div className="lock-total">
                <span>Exact amount to lock</span>
                <strong>
                  {total === undefined ? "—" : units(total)} <small>USDC</small>
                </strong>
                <span>Plus wallet transaction fees</span>
              </div>
              {payee && formError && (
                <p className="error inline">{formError}</p>
              )}
              <button
                type="button"
                className="secondary full"
                disabled={
                  disabled ||
                  !ready ||
                  !contract ||
                  Boolean(formError) ||
                  !total
                }
                onClick={approve}
              >
                Approve exactly {total === undefined ? "—" : units(total)} USDC
              </button>
              <button
                type="submit"
                className="full"
                disabled={
                  disabled ||
                  !ready ||
                  !contract ||
                  Boolean(formError) ||
                  !total ||
                  allowance !== total
                }
              >
                Fund and open room
              </button>
              <p className="hint">
                {!contract
                  ? pinned ? "Checking the pinned contract before enabling funding." : "An operator must deploy and pin Porter before funding is enabled."
                  : !ready
                    ? "Connect a wallet on Arc to approve and fund."
                    : "Approval and room funding are two separate wallet signatures."}
              </p>
            </form>
            <div className="queue">
              <div className="panel-heading"><h3>Rooms on Arc</h3><span className="panel-label">Caller</span></div>
              <p className="muted">
                Any caller can settle once due. The caller needs USDC for gas
                before the bounty arrives.
              </p>
              {rooms.length === 0 && (
                <div className="empty">
                  <span className="empty-icon" aria-hidden="true">↳</span>
                  <h4>
                    {busy ? "Reading rooms from Arc…" : contract
                      ? "No rooms opened yet"
                      : pinned ? "Verifying pinned contract…" : "Awaiting a mainnet deployment"}
                  </h4>
                  <p>
                    {busy || (pinned && !contract)
                      ? "Room terms will appear after the current Arc read completes."
                      : contract ? "Fund the first room from the form. Its terms will be read directly from Arc."
                      : "No payment, balance, or fee is being simulated here. The operator wallet path is below."}
                  </p>
                </div>
              )}
              {rooms.map((room) => {
                const due = BigInt(now) >= room.dueAt;
                const estimateShown =
                  fee?.room === room.id.toString() && fee.caller === account;
                return (
                  <article className="room" key={room.id.toString()}>
                    <div className="room-heading">
                      <h4>Room #{room.id.toString()}</h4>
                      <span
                        className={`chip ${room.settled ? "closed" : due ? "due" : ""}`}
                      >
                        {room.settled
                          ? "Settled"
                          : due
                            ? "Due · confirm onchain"
                            : `${Math.max(0, Number(room.dueAt) - now)}s until due`}
                      </span>
                    </div>
                    <dl>
                      <div>
                        <dt>Payee</dt>
                        <dd>
                          <a href={`${EXPLORER}/address/${room.payee}`}>
                            <code>{short(room.payee)}</code> ↗
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt>Payout</dt>
                        <dd>{units(room.payout)} USDC</dd>
                      </div>
                      <div>
                        <dt>Caller bounty</dt>
                        <dd>{units(room.bounty)} USDC</dd>
                      </div>
                      <div>
                        <dt>Due time</dt>
                        <dd>
                          {new Date(Number(room.dueAt) * 1000).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                    {!room.settled && (
                      <>
                        <button
                          className="secondary full"
                          disabled={disabled || !ready || !due}
                          onClick={() =>
                            act("Estimating settlement gas…", async () => {
                              await estimate(room);
                            })
                          }
                        >
                          Estimate settle fee
                        </button>
                        {estimateShown && (
                          <div className="fee">
                            <span>
                              RPC estimate · block {fee.block.toString()}
                            </span>
                            <p>
                              Estimated gas units:{" "}
                              <span>{fee.gas.toString()}</span>
                            </p>
                            <p>
                              Gas limit with 20% buffer:{" "}
                              <span>{fee.gasLimit.toString()}</span>
                            </p>
                            <p>
                              Maximum fee: <b>{gasDollars(fee.maximum)} USDC</b>
                            </p>
                            <p>
                              <code>{fee.maximum.toString()}</code> native base
                              units · 18 decimals
                            </p>
                            <small>
                              Estimate, not a receipt. Bounty{" "}
                              {units(room.bounty)} USDC; profit is not
                              guaranteed. The fee is refreshed before signing.
                            </small>
                          </div>
                        )}
                        <button
                          className="full"
                          disabled={
                            disabled || !ready || !due || !estimateShown
                          }
                          onClick={() => settle(room)}
                        >
                          Settle · collect {units(room.bounty)} USDC
                        </button>
                        {account &&
                          getAddress(account) === getAddress(room.sender) && (
                            <p className="hint">
                              This wallet is the sender. If it settles, the
                              receipt will say so.
                            </p>
                          )}
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="shell activity-section" aria-labelledby="activity-heading">
          <div><p className="eyebrow">Your wallet requests</p><h2 id="activity-heading">Transaction activity</h2></div>
          <div>
            {history.length > 0 ? (
              <ul className="transactions">
                {history.map((item) => (
                  <li key={item.hash}><a href={txLink(item.hash)}>{item.action} · <code>{short(item.hash)}</code> ↗</a><span className="chip">{item.status}</span></li>
                ))}
              </ul>
            ) : <p className="muted">No requests from this browser yet. Submitted transactions will appear here with their confirmation status.</p>}
            <p className="hint">Early payment prototype. No keeper network, no bounty-over-gas claim, and no evidence of anyone besides the builder using it.</p>
          </div>
        </section>
        {!pinned && (
          <section className="shell operator">
            <details>
              <summary>Operator setup · deploy with your own wallet</summary>
              <p>
                No signing key is held by Porter. Connect a funded Arc wallet,
                then sign a new deployment of this project’s compiled Porter
                contract with canonical USDC as its constructor token.
              </p>
              <button
                disabled={disabled || !ready || Boolean(contract)}
                onClick={deploy}
              >
                Deploy Porter · wallet signature
              </button>
              {deploymentReceipt !== undefined && (
                <button
                  className="secondary"
                  onClick={() =>
                    download(
                      "porter-deployment-receipt.json",
                      deploymentReceipt,
                    )
                  }
                >
                  Download deployment receipt
                </button>
              )}
              <p>
                After runtime verification, this tab can approve, open, and
                settle. To make the address available to every fresh visitor,
                pin the confirmed deployment using the{" "}
                <a href="https://github.com/dmetagame/porter/blob/main/docs/OPERATOR.md">
                  operator runbook ↗
                </a>
                , then rebuild the app.
              </p>
            </details>
          </section>
        )}
      </main>
      <footer className="shell footer">
        <span>Porter · scheduled USDC payments</span>
        <a href="https://docs.arc.io/arc/concepts/stablecoin-native-model">
          Why gas is USDC ↗
        </a>
        <a href="https://github.com/dmetagame/porter">Public source ↗</a>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
