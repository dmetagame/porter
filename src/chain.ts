import { defineChain, createPublicClient, http } from "viem";
export const arc = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.arc.io"] } },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.io" },
  },
});
export const publicClient = createPublicClient({
  chain: arc,
  transport: http(arc.rpcUrls.default.http[0], {
    timeout: 15000,
    retryCount: 1,
  }),
  batch: { multicall: false },
});
