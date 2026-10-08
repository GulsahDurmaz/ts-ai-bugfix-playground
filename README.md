# ts-ai-bugfix-playground

Small TypeScript project with an **intentional bug**, used to test an automated Jira-ticket-to-fix workflow with Claude.

> **Note:** The bug in this repository is deliberate. Please do not report it as a real issue.

## Purpose

This repo is a safe sandbox for testing whether an AI assistant can take a Jira ticket, find the cause of a bug, fix it, and open a pull request. It is part of a desk-research experiment and is not meant for production use.

## The project

`src/cart.ts` contains a small shopping cart helper:

- `calculateTotal(items, discountPercent?)` returns the total price of a cart, with an optional percentage discount.

## The intentional bug

`calculateTotal` does not take the item `quantity` into account. A cart with 2 × Notebook (10.00) and 1 × Pen (5.00) should total `25.00`, but the function returns `15.00`.

Two of the three tests in `src/cart.test.ts` fail until the bug is fixed.

## Getting started

```bash
npm install
npm test
```

Requires Node.js 20 or newer.

## Experiment workflow

1. A Jira ticket describes the wrong totals (symptom only, not the cause).
2. Claude Code reads the ticket through the Atlassian MCP server.
3. Claude finds the cause, fixes it, runs `npm test`, and opens a pull request.
4. A human reviews and merges the pull request.

## Project structure

```
src/
  cart.ts        # the code with the intentional bug
  cart.test.ts   # tests that expose the bug
package.json
tsconfig.json
```
