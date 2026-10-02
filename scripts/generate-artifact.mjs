import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
execFileSync(process.env.FORGE_BIN || "forge", ["build", "--build-info"], {
  stdio: "inherit",
});
const artifact = JSON.parse(readFileSync("out/Porter.sol/Porter.json", "utf8"));
writeFileSync(
  "src/porter-artifact.json",
  JSON.stringify(
    {
      abi: artifact.abi,
      bytecode: artifact.bytecode.object,
      runtime: artifact.deployedBytecode.object,
      immutableReferences: artifact.deployedBytecode.immutableReferences,
      compiler: "0.8.30",
    },
    null,
    2,
  ) + "\n",
);
console.log("Generated Porter artifact from contracts/Porter.sol only.");
