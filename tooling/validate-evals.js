#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const evalPath = path.join(root, "watchdog-shrimp", "evals", "evals.json");

const requiredScenarioTags = [
  "openclaw-readonly",
  "medium-direct",
  "openclaw-plugin-change",
  "recovery-route",
  "activation-boundary",
  "external-send",
  "no-tail-filler",
  "critical-confirmation",
  "single-instance-profile",
  "authorization-window",
];

const allowedRiskLevels = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const expectedBehaviorByRisk = {
  LOW: new Set(["execute-directly", "informational-no-governance-gate"]),
  MEDIUM: new Set(["execute-directly"]),
  HIGH: new Set(["hard-stop-confirmation", "stop-and-route-to-recovery"]),
  CRITICAL: new Set(["critical-itemized-confirmation"]),
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

const evals = readJson(evalPath);

if (!Array.isArray(evals)) {
  fail("evals.json must contain a top-level array");
  process.exit(1);
}

if (evals.length < 12) {
  fail(`expected at least 12 evals, found ${evals.length}`);
}

const seenQueries = new Set();
const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

evals.forEach((entry, index) => {
  const label = `entry[${index}]`;

  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    fail(`${label} must be an object`);
    return;
  }

  for (const key of ["query", "should_trigger", "risk_level", "expected_behavior"]) {
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
    fail(`${label}.risk_level must be one of LOW, MEDIUM, HIGH, CRITICAL`);
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

  if (entry.should_trigger === true && entry.expected_behavior === "informational-no-governance-gate") {
    fail(`${label} with should_trigger=true must not use informational-no-governance-gate`);
  }

  if (entry.should_trigger === false && entry.risk_level !== "LOW") {
    fail(`${label} with should_trigger=false must use risk_level LOW`);
  }

  if ("must_not" in entry) {
    if (!Array.isArray(entry.must_not) || entry.must_not.length === 0) {
      fail(`${label}.must_not must be a non-empty array when provided`);
    } else if (entry.must_not.some((item) => typeof item !== "string" || !item.trim())) {
      fail(`${label}.must_not must contain only non-empty strings`);
    }
  }

  if (!Array.isArray(entry.scenario_tags) || entry.scenario_tags.length === 0) {
    fail(`${label}.scenario_tags must be a non-empty array`);
  } else if (entry.scenario_tags.some((item) => typeof item !== "string" || !item.trim())) {
    fail(`${label}.scenario_tags must contain only non-empty strings`);
  }
});

const hasTag = (tag) =>
  evals.some((entry) => Array.isArray(entry.scenario_tags) && entry.scenario_tags.includes(tag));

const hasInformational = hasTag("informational");
const hasOpenClawSensitiveHigh = hasTag("openclaw-plugin-change") || hasTag("openclaw-config-mutation");
const hasReadOnlyOpenClawLow = hasTag("openclaw-readonly");
const hasRecoveryRoute = hasTag("recovery-route");
const hasGatewayRecoveryRoute = hasTag("failed-plugin-install") || hasTag("gateway-failure");
const hasExternalSend = hasTag("external-send");
const hasCriticalConfirmation = hasTag("critical-confirmation");
const hasSingleInstanceProfile = hasTag("single-instance-profile");
const hasAuthorizationWindow = hasTag("authorization-window");

const hasLowNoPermissionConstraint = evals.some(
  (entry) =>
    entry.risk_level === "LOW" &&
    Array.isArray(entry.must_not) &&
    (entry.must_not.includes("ask-for-permission-first") || entry.must_not.includes("ask-for-confirmation"))
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

const hasCriticalNoMergedApprovalConstraint = evals.some(
  (entry) =>
    entry.risk_level === "CRITICAL" &&
    Array.isArray(entry.must_not) &&
    (entry.must_not.includes("merge-approvals") ||
      entry.must_not.includes("execute-before-itemized-approval") ||
      entry.must_not.includes("assume-approval-window-covers-critical"))
);

const hasActivationBoundaryConstraint = evals.some(
  (entry) =>
    Array.isArray(entry.scenario_tags) &&
    entry.scenario_tags.includes("activation-boundary") &&
    Array.isArray(entry.must_not) &&
    entry.must_not.includes("auto-edit-agents-md")
);

const tailFillerMustNotTokens = [
  "Next Step",
  "If you need",
  "I can help",
  "Let me know",
  "下一步",
  "如果需要我可以",
];

function hasNoTailFillerConstraintForRiskLevel(riskLevel) {
  return evals.some(
    (entry) =>
      entry.risk_level === riskLevel &&
      Array.isArray(entry.scenario_tags) &&
      entry.scenario_tags.includes("no-tail-filler") &&
      Array.isArray(entry.must_not) &&
      entry.must_not.filter((token) => tailFillerMustNotTokens.includes(token)).length >= 2
  );
}

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

if (!hasGatewayRecoveryRoute) {
  fail("expected at least one failed-plugin or failed-gateway recovery-routing eval");
}

if (!hasExternalSend) {
  fail("expected at least one external-send eval");
}

if (!hasCriticalConfirmation) {
  fail("expected at least one CRITICAL eval");
}

if (!hasSingleInstanceProfile) {
  fail("expected at least one single-instance-profile eval");
}

if (!hasAuthorizationWindow) {
  fail("expected at least one authorization-window eval");
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

if (!hasCriticalNoMergedApprovalConstraint) {
  fail("expected at least one CRITICAL eval that forbids merged or implicit critical approval");
}

if (!hasActivationBoundaryConstraint) {
  fail("expected at least one activation-boundary eval that forbids automatic AGENTS.md edits");
}

if (!hasNoTailFillerConstraintForRiskLevel("LOW")) {
  fail("expected at least one LOW eval tagged no-tail-filler with multiple anti-tail-filler must_not constraints");
}

if (!hasNoTailFillerConstraintForRiskLevel("MEDIUM")) {
  fail("expected at least one MEDIUM eval tagged no-tail-filler with multiple anti-tail-filler must_not constraints");
}

for (const tag of requiredScenarioTags) {
  if (!hasTag(tag)) {
    fail(`expected at least one eval tagged with "${tag}"`);
  }
}

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

pass(`loaded ${evals.length} evals from ${path.relative(root, evalPath)}`);
pass(
  `risk distribution LOW=${riskCounts.LOW} MEDIUM=${riskCounts.MEDIUM} HIGH=${riskCounts.HIGH} CRITICAL=${riskCounts.CRITICAL}`
);
pass("coverage checks passed");
