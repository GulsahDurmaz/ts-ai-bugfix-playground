import { execFileSync } from "node:child_process";

const REPO = ".";
const SOURCE = process.argv[2] ?? "buggy-start";
if (!/^[A-Za-z0-9._-]+$/.test(SOURCE)) {
  console.error("Invalid branch name:", SOURCE);
  process.exit(1);
}

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
// Delete src first so files added by agents are removed too,
// then restore src exactly as it is on the source branch.
run("git", ["rm", "-r", "-q", "src"]);
run("git", ["checkout", `origin/${SOURCE}`, "--", "src"]);

if (run("git", ["status", "--porcelain"]).length === 0) {
  run("git", ["checkout", "main"]);
  run("git", ["branch", "-D", branch]);
  console.log(`main already matches ${SOURCE}. Nothing to do.`);
  process.exit(0);
}

run("git", ["commit", "-m", q(`Reset demo to ${SOURCE}`)]);
run("git", ["push", "-u", "origin", branch]);
const url = run("gh", ["pr", "create", "--base", "main", "--head", branch,
  "--title", q(`Reset demo to ${SOURCE}`),
  "--body", q(`Restore src to the state of ${SOURCE} for the next test run.`)]);
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
const diff = run("git", ["diff", "--stat", "HEAD", `origin/${SOURCE}`, "--", "src"]);
console.log(diff.length === 0
  ? `Done: main src matches ${SOURCE}.`
  : "Not merged yet or src differs from " + SOURCE + ". Check the PR.");
