#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");

const args = process.argv.slice(2);
const warnOnly = args.includes("--warn-only");
const targetArg = args.find((arg) => !arg.startsWith("--"));

const root = path.resolve(__dirname, "..");
const snippetPath = path.join(root, "watchdog-shrimp", "references", "agents-snippet.md");
const defaultAgentsPath = path.join(os.homedir(), ".openclaw", "workspace", "AGENTS.md");
const targetPath = targetArg ? path.resolve(targetArg) : defaultAgentsPath;

function normalize(text) {
  return text.replace(/\r\n/g, "\n").trim();
}

function extractSnippets(markdown) {
  // Extract ALL fenced markdown blocks from agents-snippet.md
  // This supports bilingual activation: both English and Chinese snippets are valid
  const snippets = [];
  const regex = /```(?:md|markdown)?[ \t]*\n([\s\S]*?)\n```/gi;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    snippets.push(normalize(match[1]));
  }
  if (snippets.length === 0) {
    throw new Error("could not find fenced markdown snippet in agents-snippet.md");
  }
  return snippets;
}

function printStatus(status, message) {
  console.log(`activation-check: ${status}`);
  console.log("source-of-truth: watchdog-shrimp/references/agents-snippet.md (exact match required)");
  console.log(`snippet: ${snippetPath}`);
  console.log(`target: ${targetPath}`);
  console.log(`detail: ${message}`);
}

function finish(status, code, message) {
  printStatus(status, message);
  if (warnOnly) {
    process.exit(0);
  }
  process.exit(code);
}

let snippets;
try {
  snippets = extractSnippets(fs.readFileSync(snippetPath, "utf8"));
} catch (error) {
  console.error(`activation-check: FAIL - ${error.message}`);
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  finish("NOT ACTIVE", 3, "target AGENTS file does not exist");
}

const agentsContent = normalize(fs.readFileSync(targetPath, "utf8"));
const snippetHeader = "## Execution Governance (watchdog-shrimp)";
const snippetHeaderZh = "## 执行治理 (watchdog-shrimp)";
const hasWatchdogBlock =
  agentsContent.includes(snippetHeader) ||
  agentsContent.includes(snippetHeaderZh) ||
  agentsContent.toLowerCase().includes("watchdog-shrimp");

// Check if target matches ANY of the valid snippets (English or Chinese)
const matchesAnySnippet = snippets.some((s) => agentsContent.includes(s));

if (matchesAnySnippet) {
  finish("ACTIVE", 0, "target contains a valid activation snippet (English or Chinese)");
}

// DRIFT: watchdog-shrimp content exists but doesn't match any known snippet.
// This can happen when:
// - User manually copied the snippet but modified it
// - File contains watchdog-shrimp references/headers but no activation block
// - Partial activation attempt (e.g., copied from README but not from agents-snippet.md)
// Resolution: Compare against agents-snippet.md and paste the exact snippet.
if (hasWatchdogBlock) {
  finish("DRIFT", 2, "watchdog-shrimp activation content exists but does not exactly match the snippet");
}

finish("NOT ACTIVE", 3, "no watchdog-shrimp activation block found in target");
