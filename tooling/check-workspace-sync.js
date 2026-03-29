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
const repoSkillPath = readOption("--repo-skill-path", path.join(root, "clawgate"));
const workspaceSkillPath = readOption(
  "--workspace-skill-path",
  path.join(os.homedir(), ".openclaw", "workspace", "skills", "clawgate")
);
const extraSkillPath = readOption(
  "--extra-skill-path",
  path.join(os.homedir(), ".openclaw", "skills", "clawgate")
);

const relativeFiles = [
  "SKILL.md",
  path.join("references", "agents-snippet.md"),
  path.join("references", "checklist.md"),
  path.join("references", "confirmation-templates.md"),
  path.join("references", "examples.md"),
  path.join("references", "risk-matrix.md"),
  path.join("evals", "README.md"),
  path.join("evals", "evals.json"),
  path.join("evals", "openclaw-prompts.md"),
];

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function readNormalized(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function finish(status, code, detail, diffs = []) {
  const repoRealPath = fs.existsSync(repoSkillPath) ? fs.realpathSync(repoSkillPath) : repoSkillPath;
  const workspaceRealPath = fs.existsSync(workspaceSkillPath) ? fs.realpathSync(workspaceSkillPath) : workspaceSkillPath;
  const extraRealPath = fs.existsSync(extraSkillPath) ? fs.realpathSync(extraSkillPath) : extraSkillPath;
  console.log(`workspace-sync: ${status}`);
  console.log("canonical-name: clawgate (watchdog-shrimp is no longer accepted as the canonical skill name)");
  console.log(`repo: ${repoSkillPath}`);
  console.log(`repo-real: ${repoRealPath}`);
  console.log(`workspace: ${workspaceSkillPath}`);
  console.log(`workspace-real: ${workspaceRealPath}`);
  console.log(`extra: ${extraSkillPath}`);
  console.log(`extra-real: ${extraRealPath}`);
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

if (fs.existsSync(extraSkillPath)) {
  for (const relativeFile of relativeFiles) {
    const repoFile = path.join(repoSkillPath, relativeFile);
    const extraFile = path.join(extraSkillPath, relativeFile);

    if (!fs.existsSync(extraFile)) {
      diffs.push(`duplicate copy incomplete: ${relativeFile}`);
      continue;
    }

    const repoHash = sha256(readNormalized(repoFile));
    const extraHash = sha256(readNormalized(extraFile));

    if (repoHash !== extraHash) {
      diffs.push(`duplicate copy differs: ${relativeFile}`);
    }
  }
}

if (diffs.length === 0) {
  finish("SYNCED", 0, "workspace skill copy matches the repository skill tree and no duplicate drift was found");
}

finish("DRIFT", 2, "workspace skill copy or duplicate install copy differs from the repository skill tree", diffs);
