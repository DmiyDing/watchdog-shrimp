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

function extractSnippet(markdown) {
  const match = markdown.match(/```md\n([\s\S]*?)\n```/);
  if (!match) {
    throw new Error("could not find fenced markdown snippet in agents-snippet.md");
  }
  return normalize(match[1]);
}

function printStatus(status, message) {
  console.log(`activation-check: ${status}`);
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

let snippet;
try {
  snippet = extractSnippet(fs.readFileSync(snippetPath, "utf8"));
} catch (error) {
  console.error(`activation-check: FAIL - ${error.message}`);
  process.exit(1);
}

if (!fs.existsSync(targetPath)) {
  finish("NOT ACTIVE", 3, "target AGENTS file does not exist");
}

const agentsContent = normalize(fs.readFileSync(targetPath, "utf8"));
const snippetHeader = "## Execution Governance (watchdog-shrimp)";
const hasWatchdogBlock =
  agentsContent.includes(snippetHeader) || agentsContent.toLowerCase().includes("watchdog-shrimp");

if (agentsContent.includes(snippet)) {
  finish("ACTIVE", 0, "target contains the exact activation snippet");
}

if (hasWatchdogBlock) {
  finish("DRIFT", 2, "watchdog-shrimp activation content exists but does not exactly match the snippet");
}

finish("NOT ACTIVE", 3, "no watchdog-shrimp activation block found in target");
