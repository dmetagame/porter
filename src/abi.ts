import { parseAbi } from "viem";
export const porterAbi = parseAbi([
  "function usdc() view returns (address)",
  "function roomCount() view returns (uint256)",
  "function totalLocked() view returns (uint256)",
  "function rooms(uint256) view returns (address sender, address payee, uint256 payout, uint256 bounty, uint64 dueAt, bool settled)",
  "function openRoom(address payee, uint256 payout, uint256 bounty, uint64 dueAt) returns (uint256)",
  "function settle(uint256 roomId, uint256 expectedPayout, uint256 expectedBounty)",
  "event RoomOpened(uint256 indexed roomId, address indexed sender, address indexed payee, uint256 payout, uint256 bounty, uint64 dueAt)",
  "event RoomSettled(uint256 indexed roomId, address indexed caller, address indexed payee, uint256 payout, uint256 bounty)",
  "error InvalidToken()",
  "error InvalidRoom()",
  "error UnknownRoom()",
  "error TooEarly(uint64 dueAt)",
  "error AlreadySettled()",
  "error AmountMismatch()",
  "error FundingMismatch()",
  "error TokenTransferFailed()",
  "error ReentrantCall()",
]);
export const tokenAbi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address, address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
