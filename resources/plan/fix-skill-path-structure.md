## Plan: Fix Skill File Path Structure (skill-name/SKILL.md)

### Objective
Change the generated ZIP skill file path from `.claude/skills/{skill-name}.md` to `.claude/skills/{skill-name}/SKILL.md` to match the OpenCode convention used by the project itself (e.g., `.claude/skills/mark-intelligence/SKILL.md`).

### Current State
- `lib/buildZip.ts` creates skill files at flat path `.claude/skills/{skill}.md`
- The project skill is stored at `.claude/skills/mark-intelligence/SKILL.md` — nested structure with `SKILL.md` inside a named directory

### Target State
- Generated ZIP contains: `.claude/skills/{skill-name}/SKILL.md` (nested)
- SETUP_GUIDE.md references the correct folder structure

### Step-by-Step Implementation

**Step 1: Write this plan file** ✅

**Step 2: Update `lib/buildZip.ts` line 39**
- Change: `files[\`.claude/skills/${skill}.md\`]` → `files[\`.claude/skills/${skill}/SKILL.md\`]`

**Step 3: Update SETUP_GUIDE.md text in `lib/buildZip.ts` line 10**
- Change: `2. Add the skill files to .claude/skills/` → `2. Add the skill files to .claude/skills/ (each skill in its own folder with SKILL.md)`

**Step 4: Verify**
- Run `npm run lint` to catch any linting errors
- Run `npm run build` to ensure the project compiles without errors

### Detailed Changes

**Step 2 — `lib/buildZip.ts:39`:**
```typescript
// Before:
files[`.claude/skills/${skill}.md`] = strToU8(content)

// After:
files[`.claude/skills/${skill}/SKILL.md`] = strToU8(content)
```

**Step 3 — `lib/buildZip.ts:10`:**
```typescript
// Before:
2. Add the skill files to .claude/skills/

// After:
2. Add the skill files to .claude/skills/ (each skill in its own folder with SKILL.md)
```
