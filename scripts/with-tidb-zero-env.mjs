import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error("Usage: node scripts/with-tidb-zero-env.mjs <command> [...args]");
  process.exit(2);
}

const codexConfigPath = path.join(os.homedir(), ".codex", "config.toml");
const config = fs.existsSync(codexConfigPath) ? fs.readFileSync(codexConfigPath, "utf8") : "";

function readTomlString(name) {
  const match = config.match(new RegExp(`^${name}\\s*=\\s*"([^"]*)"`, "m"));
  return match?.[1];
}

const mappedEnv = {
  DEMO_REPOSITORY: "tidb",
  TIDB_DEMO_HOST: process.env.TIDB_DEMO_HOST || readTomlString("TIDB_ZERO_HOST"),
  TIDB_DEMO_PORT: process.env.TIDB_DEMO_PORT || readTomlString("TIDB_ZERO_PORT") || "4000",
  TIDB_DEMO_USER: process.env.TIDB_DEMO_USER || readTomlString("TIDB_ZERO_USERNAME"),
  TIDB_DEMO_PASSWORD: process.env.TIDB_DEMO_PASSWORD || readTomlString("TIDB_ZERO_PASSWORD"),
  TIDB_DEMO_DATABASE: process.env.TIDB_DEMO_DATABASE || "riskops_ai_demo",
  TIDB_DEMO_SSL_CA: process.env.TIDB_DEMO_SSL_CA || readTomlString("TIDB_ZERO_SSL_CA")
};

const missing = Object.entries(mappedEnv)
  .filter(([key, value]) => key !== "TIDB_DEMO_SSL_CA" && !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.error(`Missing TiDB connection settings: ${missing.join(", ")}`);
  console.error("Set TIDB_DEMO_* variables or configure the existing TiDB Zero settings.");
  process.exit(2);
}

const child = spawn(command, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    ...mappedEnv
  }
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
