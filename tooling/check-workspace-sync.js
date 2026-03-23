#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const args = process.argv.slice(2);
const warnOnly = args.includes("--warn-only");

function readOption(name, defaultValue) {
  const index = args.indexOf(name);
  if (index === -1) {
    return defaultValue;
  }
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    console.error(`workspace-sync: FAIL - missing value for ${name}`);
    process.exit(1);
  }
  return path.resolve(value);
}

const root = path.resolve(__dirname, "..");
const repoSkillPath = readOption("--repo-skill-path", path.join(root, "watchdog-shrimp"));
const workspaceSkillPath = readOption(
  "--workspace-skill-path",
  path.join(os.homedir(), ".openclaw", "workspace", "skills", "watchdog-shrimp")
);

const relativeFiles = [
  "SKILL.md",
  path.join("references", "agents-snippet.md"),
  path.join("references", "checklist.md"),
  path.join("references", "examples.md"),
  path.join("references", "risk-matrix.md"),
  path.join("evals", "evals.json"),
];

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function readNormalized(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function finish(status, code, detail, diffs = []) {
  console.log(`workspace-sync: ${status}`);
  console.log(`repo: ${repoSkillPath}`);
  console.log(`workspace: ${workspaceSkillPath}`);
  console.log(`detail: ${detail}`);
  if (diffs.length > 0) {
    console.log("diffs:");
    diffs.forEach((diff) => console.log(`- ${diff}`));
  }
  if (warnOnly) {
    process.exit(0);
  }
  process.exit(code);
}

if (!fs.existsSync(repoSkillPath)) {
  finish("DRIFT", 2, "repo skill path does not exist");
}

if (!fs.existsSync(workspaceSkillPath)) {
  finish("DRIFT", 2, "workspace skill path does not exist");
}

const diffs = [];

for (const relativeFile of relativeFiles) {
  const repoFile = path.join(repoSkillPath, relativeFile);
  const workspaceFile = path.join(workspaceSkillPath, relativeFile);

  if (!fs.existsSync(repoFile)) {
    diffs.push(`missing in repo: ${relativeFile}`);
    continue;
  }

  if (!fs.existsSync(workspaceFile)) {
    diffs.push(`missing in workspace: ${relativeFile}`);
    continue;
  }

  const repoHash = sha256(readNormalized(repoFile));
  const workspaceHash = sha256(readNormalized(workspaceFile));

  if (repoHash !== workspaceHash) {
    diffs.push(`content differs: ${relativeFile}`);
  }
}

if (diffs.length === 0) {
  finish("SYNCED", 0, "workspace skill copy matches the repository skill tree");
}

finish("DRIFT", 2, "workspace skill copy differs from the repository skill tree", diffs);
