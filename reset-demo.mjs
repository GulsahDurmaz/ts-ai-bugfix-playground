import { execFileSync } from "node:child_process";

const REPO = ".";
const SOURCE = process.argv[2] ?? "buggy-start";
if (!/^[A-Za-z0-9._-]+$/.test(SOURCE)) {
  console.error("Invalid branch name:", SOURCE);
  process.exit(1);
}

// ---- Jira settings (credentials come from environment variables) ----
const JIRA_BASE = process.env.JIRA_BASE_URL ?? "https://zahidegulsahdurmaz.atlassian.net";
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT = process.env.JIRA_PROJECT ?? "KAN";
const JIRA_ISSUE_TYPE = process.env.JIRA_ISSUE_TYPE ?? "Task";
const PARK_STATUS = process.env.JIRA_PARK_STATUS ?? "In Progress";
const LABELS = ["cascade-auto"];

// ---- Cards per source branch ----
const CARDS = {
  "buggy-start": [
    {
      summary: "Fix calculateTotal quantity handling",
      text: "In src/cart.ts, calculateTotal counts every quantity above 1 as 1.\nReproduction: 2 notebooks (10 EUR each) and 1 pen (5 EUR). Expected total: 25 EUR. Actual total: 15 EUR.\nFix the loop to use the actual item.quantity, add a test, and make npm test pass. Only change the quantity handling.",
    },
    {
      summary: "Fix calculateTotal rounding to the nearest cent",
      text: "In src/cart.ts, round2 rounds down instead of to the nearest cent.\nReproduction: one item at 10 EUR with a 33% discount. Expected total: 6.7 EUR. Actual total: 6.69 EUR.\nFix round2, add a test, and make npm test pass. Only change the rounding.",
    },
  ],
  "buggy-start2": [
    {
      summary: "Fix calculateTotal quantity handling",
      text: "In src/cart.ts, calculateTotal counts every quantity above 1 as 1.\nReproduction: 2 notebooks (10 EUR each) and 1 pen (5 EUR). Expected total: 25 EUR. Actual total: 15 EUR.\nFix the loop to use the actual item.quantity, add a test, and make npm test pass. Only change src/cart.ts and its test.",
    },
    {
      summary: "Fix free shipping threshold",
      text: "In src/shipping.ts, isFreeShipping(50) returns false but orders of 50 or more ship for free.\nExpected: isFreeShipping(50) is true.\nFix the comparison, add a test, and make npm test pass. Only change src/shipping.ts and its test.",
    },
    {
      summary: "Fix average of an empty list",
      text: "In src/stats.ts, average([]) returns NaN. It should return 0 for an empty list.\nFix it, add a test, and make npm test pass. Only change src/stats.ts and its test.",
    },
  ],
};
const cards = CARDS[SOURCE] ?? [];

// Fail fast, before touching git, if Jira credentials are missing.
if (cards.length > 0 && (!JIRA_EMAIL || !JIRA_TOKEN)) {
  console.error("Set JIRA_EMAIL and JIRA_API_TOKEN first (PowerShell: $env:JIRA_EMAIL = \"...\").");
  process.exit(1);
}

const win = process.platform === "win32";
const q = (s) => (win ? `"${s}"` : s);
const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: REPO, encoding: "utf8", shell: win }).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Jira helpers ----
const auth = "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64");
async function jira(path, method = "GET", body) {
  const res = await fetch(`${JIRA_BASE}/rest/api/3${path}`, {
    method,
    headers: { Authorization: auth, Accept: "application/json", "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}
const adf = (text) => ({
  type: "doc",
  version: 1,
  content: text.split("\n").map((line) => ({
    type: "paragraph",
    content: [{ type: "text", text: line }],
  })),
});
async function moveTo(key, statusName) {
  const { transitions } = await jira(`/issue/${key}/transitions`);
  const t = transitions.find((x) => x.to.name.toLowerCase() === statusName.toLowerCase());
  if (!t) {
    const names = transitions.map((x) => x.to.name).join(", ");
    throw new Error(`${key}: no transition to "${statusName}". Available: ${names}`);
  }
  await jira(`/issue/${key}/transitions`, "POST", { transition: { id: t.id } });
}
async function createParkedCards() {
  const keys = [];
  for (const c of cards) {
    const created = await jira("/issue", "POST", {
      fields: {
        project: { key: JIRA_PROJECT },
        summary: c.summary,
        issuetype: { name: JIRA_ISSUE_TYPE },
        description: adf(c.text),
        labels: LABELS,
      },
    });
    keys.push(created.key);
    console.log("Created", created.key, "-", c.summary);
  }
  // The trigger only fires on a move to To Do, so park the cards elsewhere first.
  for (const key of keys) await moveTo(key, PARK_STATUS);
  return keys;
}

// ---- Reset main ----
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
  console.log(`main already matches ${SOURCE}.`);
} else {
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
  if (diff.length !== 0) {
    console.log("Not merged yet or src differs from " + SOURCE + ". Check the PR. No Jira cards were created.");
    process.exit(1);
  }
  console.log(`Done: main src matches ${SOURCE}.`);
}

// ---- Jira cards (only after main is confirmed ready) ----
if (cards.length === 0) {
  console.log(`No Jira cards defined for ${SOURCE}. Skipping Jira.`);
} else {
  const keys = await createParkedCards();
  console.log(`Cards are parked in "${PARK_STATUS}": ${keys.join(", ")}`);
  console.log('Move them to "To Do" yourself when you are ready to start the test.');
}
