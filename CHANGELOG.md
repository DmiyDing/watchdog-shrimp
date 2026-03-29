# Changelog

## Unreleased

- fixed the symlink-install loading issue so OpenClaw can discover the canonical skill copy more reliably
- tightened governance rules so composite shared delete + router / broadcast / cross-instance requests escalate to `CRITICAL`
- hardened `HIGH` so missing details stay inside a blocked confirmation instead of degrading to ordinary clarification
- added stable blocked-output skeletons and machine-readable governance fields for `HIGH` / `CRITICAL`
- expanded live harness coverage around the four critical regression cases and isolated auth-token probing into a dry-run lane
- documented the current real defects explicitly: `HIGH` can still degrade structurally in some live runs, `CRITICAL` downgrade risk remains the main regression to watch, and external broadcast still needs strict per-destination approval structure

## 0.1.1

- polished ClawHub discoverability with clearer approval / confirmation / risk-governance wording
- updated `SKILL.md` and package metadata to better match OpenClaw search intent
- sharpened the README opening so operators can immediately understand the value proposition

## 0.1.0

- renamed the published skill identity to `clawgate`
- risk-level changes:
  - added `CRITICAL`
  - added bounded approval-window handling
  - added incomplete-high-risk stop-first behavior
- activation changes:
  - added semantic activation mode alongside strict exact-match mode
- eval coverage changes:
  - added incomplete-high-risk regression coverage
  - added live harness output artifacts and richer live cases
- added `CRITICAL` governance lane for itemized approval with no merged authorization
- added authorization-window and recoverability rules
- added single-instance OpenClaw profile guidance
- refined config / restart / delete / external-send / paid-API classification
- expanded recovery defaults and post-execution verification templates
- expanded eval seeds and acceptance prompts for realistic OpenClaw operational scenarios
