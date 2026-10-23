import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const REPO = ".";
const win = process.platform === "win32";
const q = (s) => (win ? `"${s}"` : s);
const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: REPO, encoding: "utf8", shell: win }).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const branch = `reset-demo-${Date.now()}`;

run("git", ["fetch", "origin"]);
run("git", ["checkout", "main"]);
run("git", ["reset", "--hard", "origin/main"]);
run("git", ["checkout", "-b", branch]);
// Remove everything in src first, so files added by agents are deleted too,
// then restore src exactly as it is on buggy-start.
run("git", ["rm", "-r", "-q", "src"]);
run("git", ["checkout", "origin/buggy-start", "--", "src"]);

if (run("git", ["status", "--porcelain"]).length === 0) {
  run("git", ["checkout", "main"]);
  run("git", ["branch", "-D", branch]);
  console.log("main is already in the buggy state. Nothing to do.");
  process.exit(0);
}

run("git", ["commit", "-m", q("Reset demo bugs")]);
run("git", ["push", "-u", "origin", branch]);
const url = run("gh", ["pr", "create", "--base", "main", "--head", branch,
  "--title", q("Reset demo bugs"), "--body", q("Restore the quantity and rounding bugs for the next test run.")]);
console.log("PR:", url);
run("gh", ["pr", "merge", branch, "--auto", "--merge"]);

console.log("Waiting for CI and merge (max 3 min)...");
for (let i = 0; i < 36; i++) {
  const state = run("gh", ["pr", "view", branch, "--json", "state", "-q", ".state"]);
  if (state === "MERGED") break;
  await sleep(5000);
}

run("git", ["checkout", "main"]);
run("git", ["pull"]);
const cart = readFileSync(`${REPO}/src/cart.ts`, "utf8");
const buggy =
  cart.includes("Math.min(item.quantity, 1)") && cart.includes("Math.floor(value * 100)");
console.log(buggy ? "Done: both bugs restored on main." : "Not merged yet or bugs missing. Check the PR.");