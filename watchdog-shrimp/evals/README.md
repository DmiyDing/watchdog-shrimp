# Eval Guide

This directory contains seed evaluation cases for `watchdog-shrimp`.

## What These Evals Cover

- read-only OpenClaw inspection that should stay `LOW`
- ordinary multi-file work that should stay `MEDIUM`
- OpenClaw plugin + config + restart combinations that must become `HIGH`
- backup / validate / rollback-aware config changes
- failure cases that should route to recovery
- internal send vs external or broadcast send
- paid API and cross-instance actions
- real OpenClaw acceptance prompts in `openclaw-prompts.md`

## What The Local Validator Does

Run:

```bash
npm run validate:evals
```

The validator checks:

- JSON structure and required keys
- allowed risk levels and behavior labels
- optional `must_not` anti-pattern lists
- duplicate query prevention
- minimum risk-category coverage
- presence of OpenClaw-sensitive `HIGH` cases
- presence of read-only OpenClaw `LOW` cases
- presence of recovery-routing coverage
- presence of anti-noise and anti-implicit-consent constraints
- presence of activation-boundary coverage for AGENTS injection

## What It Does Not Do

This is not a model-grading harness.
It does not score live LLM responses.
It validates that the repository's eval seeds remain structurally sound and keep the intended coverage shape.
