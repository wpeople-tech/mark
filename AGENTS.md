<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:mark-project-rules -->
# MARK Intelligence — Project Rules

## Source of Truth
- **README.md** is the full Product Requirements Document — always reference it for features, design tokens, structure, and constraints.
- **AGENTS.md** contains project rules and conventions.

## Development Workflow
1. **Plan first** — every step needs a plan file in `resources/plan/` before implementation
2. **Implement** — code the plan, one file/section at a time
3. **Verify** — run `npm run lint` and `npm run build` after each step
4. **Design tokens** — always use the exact colors, spacing, typography from the PRD

## Project Skill
A project-specific skill is registered at `.opencode/skills/mark-intelligence/SKILL.md`. It contains the full design system, file structure, API specs, and constraints from the README. Load it with `skill` tool when working on MARK.
<!-- END:mark-project-rules -->
