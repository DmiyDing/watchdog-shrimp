#!/usr/bin/env node

/**
 * Cross-file consistency checker for clawgate
 * Verifies HIGH / CRITICAL confirmation fields match across:
 * - SKILL.md (Core Policy + Execution Strategy)
 * - agents-snippet.md (English activation snippet)
 * - confirmation-templates.md (English template)
 * - risk-matrix.md (HIGH / CRITICAL Behavior section)
 *
 * Note: This checker validates English-language HIGH fields only.
 * Chinese activation snippet consistency is validated separately by
 * manual review during the release checklist.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const files = {
  skill: path.join(root, "clawgate", "SKILL.md"),
  agentsSnippet: path.join(root, "clawgate", "references", "agents-snippet.md"),
  confirmationTemplates: path.join(root, "clawgate", "references", "confirmation-templates.md"),
  riskMatrix: path.join(root, "clawgate", "references", "risk-matrix.md"),
};

// Expected confirmation fields (canonical)
const EXPECTED_HIGH_FIELDS = ["scope", "impact", "consequence", "continue"];
const EXPECTED_HIGH_TEMPLATE_FIELDS = ["action", ...EXPECTED_HIGH_FIELDS];
const EXPECTED_CRITICAL_FIELDS = ["critical", "authorization", "approve", "continue", "blocked"];
const EXPECTED_MEDIUM_FIELDS = ["action", "verify", "result"];

function fail(message) {
  console.error(`consistency-check: FAIL - ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`consistency-check: ${message}`);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    fail(`cannot read ${path.relative(root, filePath)}: ${error.message}`);
    return null;
  }
}

function extractMarkdownSnippets(content) {
  return [...content.matchAll(/```(?:md|markdown)?[ \t]*\n([\s\S]*?)\n```/gi)].map((match) => match[1]);
}

// Check 1: SKILL.md Core Policy line should have all HIGH fields
function checkSkillCorePolicy(content) {
  // Look for the HIGH line in Core Policy section
  const highLineMatch = content.match(/`HIGH`: ([^\n]+)/);
  if (!highLineMatch) {
    fail("SKILL.md: Cannot find HIGH line in Core Policy section");
    return false;
  }

  const fieldsStr = highLineMatch[1].toLowerCase();
  const missing = [];

  for (const field of EXPECTED_HIGH_TEMPLATE_FIELDS) {
    if (!fieldsStr.includes(field)) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    fail(`SKILL.md Core Policy HIGH line missing fields: ${missing.join(", ")}`);
    return false;
  }

  const missingCorePolicyStructure = ["blocked", "risk: high"].filter((token) => !fieldsStr.includes(token));
  if (missingCorePolicyStructure.length > 0) {
    fail(`SKILL.md Core Policy HIGH line missing tokens: ${missingCorePolicyStructure.join(", ")}`);
    return false;
  }

  pass("SKILL.md Core Policy HIGH fields OK");
  return true;
}

// Check 2: SKILL.md HIGH Execution Strategy should have all fields
function checkSkillExecutionStrategy(content) {
  const highSectionMatch = content.match(/### HIGH[\s\S]*?The `HIGH` reply must follow this protocol:\s*([\s\S]*?)(?=\n\nDo not continue)/);
  if (!highSectionMatch) {
    fail("SKILL.md: Cannot find HIGH Execution Strategy section");
    return false;
  }

  const listContent = highSectionMatch[1];
  const foundFields = [];

  // Check for each expected field as a list item
  for (const field of EXPECTED_HIGH_FIELDS) {
    // Match "- field" or "- field name" patterns
    const pattern = new RegExp(`-\\s*.*${field}`, "i");
    if (pattern.test(listContent)) {
      foundFields.push(field);
    }
  }

  const missing = EXPECTED_HIGH_FIELDS.filter((f) => !foundFields.includes(f));

  if (missing.length > 0) {
    fail(`SKILL.md Execution Strategy HIGH section missing fields: ${missing.join(", ")}`);
    return false;
  }

  // Check for "impact scope" (combined) which should be separated
  if (listContent.match(/-\s*impact scope/i)) {
    fail('SKILL.md Execution Strategy uses combined "impact scope" instead of separate "scope" and "impact"');
    return false;
  }

  const missingHighStructure = ["action", "blocked until"].filter((token) => !listContent.toLowerCase().includes(token));
  if (missingHighStructure.length > 0) {
    fail(`SKILL.md Execution Strategy HIGH section missing tokens: ${missingHighStructure.join(", ")}`);
    return false;
  }

  pass("SKILL.md Execution Strategy HIGH fields OK");
  return true;
}

function checkSkillCanonicalBlocks(content) {
  const requiredSections = [
    "## Canonical Reply Blocks",
    "### MEDIUM Result Block",
    "### HIGH Plugin Install Block",
    "### Incomplete HIGH Plugin Install Block",
    "### CRITICAL Shared Delete + Router Block",
    "### CRITICAL External Broadcast Block",
  ];

  const missingSections = requiredSections.filter((section) => !content.includes(section));
  if (missingSections.length > 0) {
    fail(`SKILL.md canonical blocks missing sections: ${missingSections.join(", ")}`);
    return false;
  }

  const missingTokens = [
    "Possible Consequence: a bad install, config mutation, or restart can leave the instance unhealthy",
    "Blocked Until: the exact missing information is provided and the exact action receives explicit continue/cancel confirmation",
    "Authorization Granularity: approve each item separately; do not merge authorization across items",
    "Approve Each Destination: reply destination-by-destination with approve or cancel",
  ].filter((token) => !content.includes(token));

  if (missingTokens.length > 0) {
    fail(`SKILL.md canonical blocks missing tokens: ${missingTokens.join(" | ")}`);
    return false;
  }

  pass("SKILL.md canonical reply blocks OK");
  return true;
}

// Check 3: agents-snippet.md HIGH line
function checkAgentsSnippet(content) {
  const snippets = extractMarkdownSnippets(content);
  if (snippets.length !== 2) {
    fail(`agents-snippet.md should contain exactly 2 fenced snippets (English + Chinese), found ${snippets.length}`);
    return false;
  }

  const highLineMatch = content.match(/`HIGH`:[^\n]*/);
  if (!highLineMatch) {
    fail("agents-snippet.md: Cannot find HIGH line");
    return false;
  }

  const snippetLower = content.toLowerCase();
  const fieldsStr = highLineMatch[0].toLowerCase();
  const missing = [];

  for (const field of EXPECTED_HIGH_TEMPLATE_FIELDS) {
    if (!fieldsStr.includes(field)) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    fail(`agents-snippet.md HIGH line missing fields: ${missing.join(", ")}`);
    return false;
  }

  const missingHighStructure = ["blocked until", "first visible", "default execution plan"].filter(
    (token) => !snippetLower.includes(token)
  );
  if (missingHighStructure.length > 0) {
    fail(`agents-snippet.md HIGH protocol missing tokens: ${missingHighStructure.join(", ")}`);
    return false;
  }

  pass("agents-snippet.md HIGH fields OK");
  return true;
}

// Check 4: confirmation-templates.md HIGH template
function checkConfirmationTemplates(content) {
  // Look for English HIGH template
  const englishTemplateMatch = content.match(/### English[\s\S]*?```markdown([\s\S]*?)```/);
  if (!englishTemplateMatch) {
    fail("confirmation-templates.md: Cannot find English HIGH template");
    return false;
  }

  const templateContent = englishTemplateMatch[1];

  // Check for required fields in template
  const requiredTemplateFields = [
    "risk: high",
    "action",
    "scope",
    "impact",
    "possible consequence",
    "continue or cancel",
  ];
  const missing = [];

  for (const field of requiredTemplateFields) {
    if (!templateContent.toLowerCase().includes(field)) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    fail(`confirmation-templates.md English HIGH template missing fields: ${missing.join(", ")}`);
    return false;
  }

  // Check for "Next Step" which should be "Continue or Cancel"
  if (templateContent.includes("Next Step") && !templateContent.toLowerCase().includes("continue or cancel")) {
    fail('confirmation-templates.md uses "Next Step" instead of "Continue or Cancel"');
    return false;
  }

  pass("confirmation-templates.md HIGH template fields OK");
  return true;
}

function checkMediumCoverage(skillContent, agentsContent, templatesContent, riskMatrixContent) {
  let ok = true;

  const mediumSectionMatch = skillContent.match(/### MEDIUM[\s\S]*?Use the fixed execution report shape:\s*([\s\S]*?)(?=\n\nDo not collapse)/);
  if (!mediumSectionMatch) {
    fail("SKILL.md: Cannot find MEDIUM execution report shape");
    ok = false;
  } else {
    const section = mediumSectionMatch[1].toLowerCase();
    const missing = EXPECTED_MEDIUM_FIELDS.filter((field) => !section.includes(field));
    if (missing.length > 0) {
      fail(`SKILL.md MEDIUM execution report missing fields: ${missing.join(", ")}`);
      ok = false;
    }
  }

  const agentsMediumLine = agentsContent.match(/`MEDIUM`:[^\n]*/);
  if (!agentsMediumLine) {
    fail("agents-snippet.md: Cannot find MEDIUM line");
    ok = false;
  } else {
    const line = agentsMediumLine[0].toLowerCase();
    const missing = EXPECTED_MEDIUM_FIELDS.filter((field) => !line.includes(field));
    if (missing.length > 0) {
      fail(`agents-snippet.md MEDIUM line missing fields: ${missing.join(", ")}`);
      ok = false;
    }
  }

  const mediumTemplateMatch = templatesContent.match(/### Result Template[\s\S]*?```markdown([\s\S]*?)```/);
  if (!mediumTemplateMatch) {
    fail("confirmation-templates.md: Cannot find MEDIUM Result Template");
    ok = false;
  } else {
    const template = mediumTemplateMatch[1].toLowerCase();
    const missing = EXPECTED_MEDIUM_FIELDS.filter((field) => !template.includes(field));
    if (missing.length > 0) {
      fail(`confirmation-templates.md MEDIUM Result Template missing fields: ${missing.join(", ")}`);
      ok = false;
    }
  }

  const mediumBehaviorMatch = riskMatrixContent.match(/## MEDIUM[\s\S]*?Behavior:([\s\S]*?)(?=\n##|$)/i);
  if (!mediumBehaviorMatch) {
    fail("risk-matrix.md: Cannot find MEDIUM Behavior section");
    ok = false;
  } else {
    const behavior = mediumBehaviorMatch[1].toLowerCase();
    const missing = EXPECTED_MEDIUM_FIELDS.filter((field) => !behavior.includes(field));
    if (missing.length > 0) {
      fail(`risk-matrix.md MEDIUM Behavior missing fields: ${missing.join(", ")}`);
      ok = false;
    }
  }

  if (ok) {
    pass("MEDIUM execution report fields OK");
  }

  return ok;
}

// Check 5: risk-matrix.md HIGH Behavior section
function checkRiskMatrix(content) {
  const highBehaviorMatch = content.match(/## HIGH[\s\S]*?Behavior:([\s\S]*?)(?=\n##|$)/i);
  if (!highBehaviorMatch) {
    fail("risk-matrix.md: Cannot find HIGH Behavior section");
    return false;
  }

  const behaviorContent = highBehaviorMatch[1];
  const missing = [];

  for (const field of EXPECTED_HIGH_FIELDS) {
    if (!behaviorContent.toLowerCase().includes(field)) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    fail(`risk-matrix.md HIGH Behavior missing fields: ${missing.join(", ")}`);
    return false;
  }

  pass("risk-matrix.md HIGH fields OK");
  return true;
}

function checkCriticalCoverage(content, agentsContent, templatesContent, riskMatrixContent) {
  let ok = true;

  if (!/`CRITICAL`:/.test(content)) {
    fail("SKILL.md: Cannot find CRITICAL line in Core Policy section");
    ok = false;
  }

  const criticalSectionMatch = content.match(/### CRITICAL[\s\S]*?The `CRITICAL` reply must follow this protocol:\s*([\s\S]*?)(?=\n\nThe critical action items must be concrete authorization targets)/);
  if (!criticalSectionMatch) {
    fail("SKILL.md: Cannot find CRITICAL Execution Strategy section");
    ok = false;
  } else {
    const listContent = criticalSectionMatch[1].toLowerCase();
    const missing = EXPECTED_CRITICAL_FIELDS.filter((field) => !listContent.includes(field));
    if (missing.length > 0) {
      fail(`SKILL.md CRITICAL section missing fields: ${missing.join(", ")}`);
      ok = false;
    }
  }

  const agentsCriticalLine = agentsContent.match(/`CRITICAL`:[^\n]*/);
  if (!agentsCriticalLine) {
    fail("agents-snippet.md: Cannot find CRITICAL line");
    ok = false;
  } else {
    const line = agentsCriticalLine[0].toLowerCase();
    const fullContent = agentsContent.toLowerCase();
    const missing = ["critical", "authorization granularity", "approve each item", "blocked until"].filter(
      (token) => !line.includes(token) && !fullContent.includes(token)
    );
    if (missing.length > 0) {
      fail(`agents-snippet.md CRITICAL line missing tokens: ${missing.join(", ")}`);
      ok = false;
    }
  }

  const criticalTemplateMatch = templatesContent.match(/### Critical Example[\s\S]*?```markdown([\s\S]*?)```/);
  if (!criticalTemplateMatch) {
    fail("confirmation-templates.md: Cannot find Critical Example template");
    ok = false;
  } else {
    const template = criticalTemplateMatch[1];
    const requiredFields = [
      "risk: critical",
      "critical action items",
      "authorization granularity",
      "approve each item",
      "continue or cancel",
      "blocked until",
    ];
    const missing = requiredFields.filter((field) => !template.toLowerCase().includes(field));
    if (missing.length > 0) {
      fail(`confirmation-templates.md Critical Example missing fields: ${missing.join(", ")}`);
      ok = false;
    }
  }

  const criticalBehaviorMatch = riskMatrixContent.match(/## CRITICAL[\s\S]*?Behavior:([\s\S]*?)(?=\n##|$)/i);
  if (!criticalBehaviorMatch) {
    fail("risk-matrix.md: Cannot find CRITICAL Behavior section");
    ok = false;
  } else {
    const behavior = criticalBehaviorMatch[1].toLowerCase();
    const missing = ["item", "authorization", "approve", "continue", "blocked"].filter(
      (token) => !behavior.includes(token)
    );
    if (missing.length > 0) {
      fail(`risk-matrix.md CRITICAL Behavior missing tokens: ${missing.join(", ")}`);
      ok = false;
    }
  }

  if (ok) {
    pass("CRITICAL confirmation fields OK");
  }

  return ok;
}

// Run all checks
let allPassed = true;

const skillContent = readFile(files.skill);
const agentsContent = readFile(files.agentsSnippet);
const templatesContent = readFile(files.confirmationTemplates);
const riskMatrixContent = readFile(files.riskMatrix);

if (skillContent) {
  if (!checkSkillCorePolicy(skillContent)) allPassed = false;
  if (!checkSkillExecutionStrategy(skillContent)) allPassed = false;
  if (!checkSkillCanonicalBlocks(skillContent)) allPassed = false;
}

if (agentsContent) {
  if (!checkAgentsSnippet(agentsContent)) allPassed = false;
}

if (templatesContent) {
  if (!checkConfirmationTemplates(templatesContent)) allPassed = false;
}

if (riskMatrixContent) {
  if (!checkRiskMatrix(riskMatrixContent)) allPassed = false;
}

if (skillContent && agentsContent && templatesContent && riskMatrixContent) {
  if (!checkMediumCoverage(skillContent, agentsContent, templatesContent, riskMatrixContent)) allPassed = false;
  if (!checkCriticalCoverage(skillContent, agentsContent, templatesContent, riskMatrixContent)) allPassed = false;
}

if (allPassed && process.exitCode !== 1) {
  pass("MEDIUM / HIGH / CRITICAL confirmation fields consistent in English-language paths (SKILL.md, agents-snippet.md, confirmation-templates.md, risk-matrix.md)");
  pass("Note: Chinese snippet and README wording verified by RELEASE-CHECKLIST manual review");
  process.exit(0);
} else {
  process.exit(1);
}
