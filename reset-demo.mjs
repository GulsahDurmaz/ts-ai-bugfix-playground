import { execFileSync } from "node:child_process";
import "dotenv/config";

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
      summary: "Cart total ignores quantities above 1",
      text: "When an item is added to the cart more than once, only one unit is counted in the total.\n\nExample: 2 notebooks at 10 EUR each and 1 pen at 5 EUR should total 25 EUR, but the total shows 15 EUR.\n\nAcceptance: Adding multiple quantities of an item calculates the correct total.",
    },
    {
      summary: "Cart total rounds down instead of to the nearest cent",
      text: "The cart total always rounds down to the cent instead of rounding to the nearest cent.\n\nExample: One item at 10 EUR with a 33% discount should total 6.70 EUR, but the total shows 6.69 EUR.\n\nAcceptance: Discounted totals are rounded to the nearest cent.",
    },
  ],
  "buggy-start2": [
    {
      summary: "Cart total ignores quantities above 1",
      text: "When an item is added to the cart more than once, only one unit is counted in the total.\n\nExample: 2 notebooks at 10 EUR each and 1 pen at 5 EUR should total 25 EUR, but the total shows 15 EUR.\n\nAcceptance: Adding multiple quantities of an item calculates the correct total.",
    },
    {
      summary: "Orders of exactly 50 EUR do not ship for free",
      text: "Orders of 50 EUR or more should ship for free, but an order of exactly 50 EUR is still charged for shipping.\n\nExample: A customer with a 50 EUR order expects free shipping but sees a shipping fee.\n\nAcceptance: Orders of exactly 50 EUR qualify for free shipping.",
    },
    {
      summary: "Average of an empty list shows an error",
      text: "When calculating statistics for an empty dataset, the average displays as 'NaN' instead of a valid number.\n\nExample: A report with no sales data shows 'NaN' for average sale value.\n\nAcceptance: The average of an empty list returns 0.",
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
