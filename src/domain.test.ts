import { describe, it, expect } from "vitest";
import { amount, gasDollars, recipient, USDC, units } from "./domain";
describe("Porter wallet transaction values", () => {
  it("funds the default with exactly 110000 ERC-20 base units", () => {
    expect(amount("0.10") + amount("0.01")).toBe(110000n);
    expect(units(110000n)).toBe("0.11");
  });
  it("rejects precision loss, negative/zero amounts and exponent syntax", () => {
    for (const value of ["0.0000001", "1e2", "-1", "0", "", "NaN"])
      expect(() => amount(value)).toThrow();
  });
  it("accounts for gas at 18 decimals separately from the 6-decimal interface", () => {
    expect(gasDollars(1000000000000000n)).toBe("0.001");
  });
  it("refuses unsafe recipient addresses", () => {
    for (const value of [
      "bad",
      "0x0000000000000000000000000000000000000000",
      USDC,
    ])
      expect(() => recipient(value)).toThrow();
  });
});
