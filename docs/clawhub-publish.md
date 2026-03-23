# ClawHub Publish Notes

This repository is intended to be publishable to ClawHub.

## Verified Requirements

Based on the current public ClawHub docs:

- a skill is a folder with `SKILL.md`
- supporting files may be included if they are text-based
- skill metadata is extracted from `SKILL.md` frontmatter
- publish requires a semver version
- `clawhub publish <path> --version x.y.z` is the standard CLI flow

## Current Repository State

- `watchdog-shrimp/SKILL.md` exists
- supporting files are text-based
- frontmatter now includes `name`, `description`, `version`, and `metadata.openclaw.homepage`
- local validation exists for eval shape and activation drift

## Publish Checklist

1. Run `npm run validate`
2. Re-read `watchdog-shrimp/SKILL.md` frontmatter for accuracy
3. Confirm README and eval prompts match the current governance policy
4. Choose the publish version
5. Prepare a short changelog summary for the upload
6. Publish the skill folder, not the repo root

## Suggested Publish Command

```bash
clawhub publish watchdog-shrimp --version 0.1.0
```

If the CLI is not installed globally, use the workflow documented by ClawHub before publishing.

## Important Boundary

ClawHub publishes skills from the skill folder.
That means `watchdog-shrimp/SKILL.md` and its supporting files are the publish surface, not the entire repo root.

Review the current ClawHub policy before the actual upload in case the registry rules changed.
