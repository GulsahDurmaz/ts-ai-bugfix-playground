# ts-ai-bugfix-playground

Small TypeScript project used to test an automated Jira-ticket-to-fix workflow with Claude.

> **Note:** This repository may contain deliberate bugs. Please do not report them as real issues.

## Purpose

This repo is a safe sandbox for testing whether an AI assistant can take a Jira ticket, find the cause of a bug, fix it, and get the fix merged. It is part of a desk-research experiment and is not meant for production use.

## The project

`src/cart.ts` contains a small shopping cart helper:

- `calculateTotal(items, discountPercent?)` returns the total price of a cart, with an optional percentage discount.

## Getting started

```bash
npm install
npm test
```

Requires Node.js 20 or newer.

## Automated workflow

1. A product owner moves a Jira ticket (label `ai-fix`) to **Ready for AI**.
2. A Jira Automation rule calls the GitHub `workflow_dispatch` API with the ticket key and summary.
3. The **AI Fix** workflow (`.github/workflows/ai-fix.yml`) runs Claude Code Action. Claude finds the cause, fixes it, adds a regression test, runs the type check and tests, and opens a pull request from `fix/<TICKET-KEY>`. It then enables auto-merge.
4. The **CI** workflow (`.github/workflows/ci.yml`) runs on the pull request. The branch ruleset requires the `test` check to pass before merging.
5. After the merge, the **Notify Jira on merge** workflow (`.github/workflows/jira-done.yml`) sends the ticket key and pull request link to a Jira incoming webhook. A second Jira rule adds a comment and moves the ticket to **Done**.

### Required repository secrets

| Secret | Used by |
| --- | --- |
| `ANTHROPIC_API_KEY` | AI Fix workflow |
| `JIRA_WEBHOOK_URL` | Notify Jira on merge |
| `JIRA_WEBHOOK_SECRET` | Notify Jira on merge |

## Project structure

```
src/
  cart.ts        # cart helper
  cart.test.ts   # tests
.github/workflows/
  ci.yml         # type check and tests on pull requests
  ai-fix.yml     # Claude fixes a Jira ticket and opens a pull request
  jira-done.yml  # updates the Jira ticket after the merge
package.json
tsconfig.json
```
