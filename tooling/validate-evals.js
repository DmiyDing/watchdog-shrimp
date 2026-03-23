#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const evalPath = path.join(root, "watchdog-shrimp", "evals", "evals.json");

const allowedRiskLevels = new Set(["LOW", "MEDIUM", "HIGH"]);
const expectedBehaviorByRisk = {
  LOW: new Set(["execute-directly", "informational-no-governance-gate"]),
  MEDIUM: new Set(["execute-directly"]),
  HIGH: new Set(["hard-stop-confirmation", "stop-and-route-to-recovery"]),
};

function fail(message) {
  console.error(`eval-validation: FAIL - ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`eval-validation: ${message}`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`cannot parse ${path.relative(root, filePath)}: ${error.message}`);
    process.exit(1);
  }
}

function countWhere(items, predicate) {
  return items.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);
}

const evals = readJson(evalPath);

if (!Array.isArray(evals)) {
  fail("evals.json must contain a top-level array");
  process.exit(1);
}

if (evals.length < 10) {
  fail(`expected at least 10 evals, found ${evals.length}`);
}

const seenQueries = new Set();
const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };

evals.forEach((entry, index) => {
  const label = `entry[${index}]`;

  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    fail(`${label} must be an object`);
    return;
  }

  const requiredKeys = ["query", "should_trigger", "risk_level", "expected_behavior"];
  for (const key of requiredKeys) {
    if (!(key in entry)) {
      fail(`${label} missing required key "${key}"`);
    }
  }

  if (typeof entry.query !== "string" || !entry.query.trim()) {
    fail(`${label}.query must be a non-empty string`);
  } else if (seenQueries.has(entry.query)) {
    fail(`${label}.query is duplicated`);
  } else {
    seenQueries.add(entry.query);
  }

  if (typeof entry.should_trigger !== "boolean") {
    fail(`${label}.should_trigger must be boolean`);
  }

  if (!allowedRiskLevels.has(entry.risk_level)) {
    fail(`${label}.risk_level must be one of LOW, MEDIUM, HIGH`);
  } else {
    riskCounts[entry.risk_level] += 1;
  }

  if (typeof entry.expected_behavior !== "string" || !entry.expected_behavior.trim()) {
    fail(`${label}.expected_behavior must be a non-empty string`);
  } else if (
    allowedRiskLevels.has(entry.risk_level) &&
    !expectedBehaviorByRisk[entry.risk_level].has(entry.expected_behavior)
  ) {
    fail(
      `${label}.expected_behavior "${entry.expected_behavior}" does not match risk level ${entry.risk_level}`
    );
  }

  if (entry.should_trigger === false && entry.expected_behavior !== "informational-no-governance-gate") {
    fail(`${label} with should_trigger=false must use informational-no-governance-gate`);
  }

  if ("must_not" in entry) {
    if (!Array.isArray(entry.must_not) || entry.must_not.length === 0) {
      fail(`${label}.must_not must be a non-empty array when provided`);
    } else if (entry.must_not.some((item) => typeof item !== "string" || !item.trim())) {
      fail(`${label}.must_not must contain only non-empty strings`);
    }
  }
});

const hasInformational = evals.some(
  (entry) => entry.should_trigger === false && entry.expected_behavior === "informational-no-governance-gate"
);
const hasOpenClawSensitiveHigh = evals.some(
  (entry) =>
    entry.risk_level === "HIGH" &&
    /openclaw\.json|plugins\.entries|gateway|delivery router|shared OpenClaw instance/i.test(entry.query)
);
const hasReadOnlyOpenClawLow = evals.some(
  (entry) =>
    entry.risk_level === "LOW" &&
    /openclaw\.json|gateway config/i.test(entry.query) &&
    /without changing|without editing|summarize|tell me/i.test(entry.query)
);
const hasRecoveryRoute = evals.some((entry) => entry.expected_behavior === "stop-and-route-to-recovery");
const hasExternalSendHigh = evals.some(
  (entry) => entry.risk_level === "HIGH" && /customer|external|group right now|broadcast/i.test(entry.query)
);
const hasLowNoPermissionConstraint = evals.some(
  (entry) => entry.risk_level === "LOW" && Array.isArray(entry.must_not) && entry.must_not.includes("ask-for-permission-first")
);
const hasMediumNoConfirmationConstraint = evals.some(
  (entry) =>
    entry.risk_level === "MEDIUM" &&
    Array.isArray(entry.must_not) &&
    (entry.must_not.includes("ask-for-confirmation") || entry.must_not.includes("repeat-confirmation"))
);
const hasHighNoImplicitConsentConstraint = evals.some(
  (entry) =>
    entry.risk_level === "HIGH" &&
    Array.isArray(entry.must_not) &&
    (entry.must_not.includes("execute-before-explicit-approval") ||
      entry.must_not.includes("treat-acknowledgment-as-consent"))
);
const hasActivationBoundaryConstraint = evals.some(
  (entry) =>
    /AGENTS\.md|activation/i.test(entry.query) &&
    Array.isArray(entry.must_not) &&
    entry.must_not.includes("auto-edit-agents-md")
);

for (const [risk, count] of Object.entries(riskCounts)) {
  if (count === 0) {
    fail(`expected at least one ${risk} eval`);
  }
}

if (!hasInformational) {
  fail("expected at least one informational non-trigger eval");
}

if (!hasOpenClawSensitiveHigh) {
  fail("expected at least one OpenClaw-sensitive HIGH-risk eval");
}

if (!hasReadOnlyOpenClawLow) {
  fail("expected at least one read-only OpenClaw LOW-risk eval");
}

if (!hasRecoveryRoute) {
  fail("expected at least one recovery-routing eval");
}

if (!hasExternalSendHigh) {
  fail("expected at least one external-send HIGH-risk eval");
}

if (!hasLowNoPermissionConstraint) {
  fail("expected at least one LOW eval that forbids unnecessary permission prompts");
}

if (!hasMediumNoConfirmationConstraint) {
  fail("expected at least one MEDIUM eval that forbids unnecessary confirmation behavior");
}

if (!hasHighNoImplicitConsentConstraint) {
  fail("expected at least one HIGH eval that forbids execution before explicit approval");
}

if (!hasActivationBoundaryConstraint) {
  fail("expected at least one activation-boundary eval that forbids automatic AGENTS.md edits");
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

pass(`loaded ${evals.length} evals from ${path.relative(root, evalPath)}`);
pass(`risk distribution LOW=${riskCounts.LOW} MEDIUM=${riskCounts.MEDIUM} HIGH=${riskCounts.HIGH}`);
pass("coverage checks passed");
