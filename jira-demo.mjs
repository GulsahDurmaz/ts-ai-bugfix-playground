import readline from "node:readline/promises";

const BASE = process.env.JIRA_BASE_URL ?? "https://zahidegulsahdurmaz.atlassian.net";
const EMAIL = process.env.JIRA_EMAIL;
const TOKEN = process.env.JIRA_API_TOKEN;
const PROJECT = process.env.JIRA_PROJECT ?? "KAN";
const ISSUE_TYPE = process.env.JIRA_ISSUE_TYPE ?? "Task";
const PARK = process.env.JIRA_PARK_STATUS ?? "In Progress";
const START = process.env.JIRA_START_STATUS ?? "To Do";

const scenario = process.argv[2];
const extraLabels = process.argv.slice(3).filter((a) => a.startsWith("--label=")).map((a) => a.slice(8));

if (!EMAIL || !TOKEN) {
  console.error("Set JIRA_EMAIL and JIRA_API_TOKEN first.");
  process.exit(1);
}

const SCENARIOS = {
  "1": [
    {
      summary: "Fix calculateTotal quantity handling",
      text: "In src/cart.ts, calculateTotal counts every quantity above 1 as 1.\nReproduction: 2 notebooks (10 EUR each) and 1 pen (5 EUR). Expected total: 25 EUR. Actual total: 15 EUR.\nFix the loop to use the actual item.quantity, add a test, and make npm test pass. Only change the quantity handling.",
    },
    {
      summary: "Fix calculateTotal rounding to the nearest cent",
      text: "In src/cart.ts, round2 rounds down instead of to the nearest cent.\nReproduction: one item at 10 EUR with a 33% discount. Expected total: 6.7 EUR. Actual total: 6.69 EUR.\nFix round2, add a test, and make npm test pass. Only change the rounding.",
    },
  ],
  "2": [
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

const cards = SCENARIOS[scenario];
if (!cards) {
  console.error("Usage: node jira-demo.mjs <1|2> [--label=cascade-auto]");
  process.exit(1);
}

const auth = "Basic " + Buffer.from(`${EMAIL}:${TOKEN}`).toString("base64");
async function jira(path, method = "GET", body) {
  const res = await fetch(`${BASE}/rest/api/3${path}`, {
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

const keys = [];
for (const c of cards) {
  const created = await jira("/issue", "POST", {
    fields: {
      project: { key: PROJECT },
      summary: c.summary,
      issuetype: { name: ISSUE_TYPE },
      description: adf(c.text),
      labels: extraLabels,
    },
  });
  keys.push(created.key);
  console.log("Created", created.key, "-", c.summary);
}

// onCreate is false for the trigger, so park the cards in another status first.
for (const key of keys) await moveTo(key, PARK);
console.log(`Cards are parked in "${PARK}": ${keys.join(", ")}`);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await rl.question(`Make sure main is reset. Press Enter to move all cards to "${START}" at the same time... `);
rl.close();

const t0 = Date.now();
await Promise.all(keys.map((key) => moveTo(key, START)));
console.log(`Moved ${keys.length} cards to "${START}" within ${Date.now() - t0} ms.`);
