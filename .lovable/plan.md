# README Freshness Checking Implementation Plan

This plan implements a "README Freshness" system that compares the current repository analysis with the saved README to detect when the documentation has become outdated due to code changes.

## User Review Required

> [!IMPORTANT]
> The freshness check runs heuristics (comparing analysis facts against README text). While highly accurate for detecting missing dependencies or changed commands, it may have false positives if information is described using unconventional phrasing in the README.

## Proposed Changes

### Backend & Logic

#### [NEW] `src/lib/readme-freshness.functions.ts`
- Implement `checkReadmeFreshness` server function.
- Compare structured analysis (dependencies, frameworks, scripts, env vars, license) against README content.
- Map differences to a `FreshnessDifference` interface (type, label, readmeValue, repoValue, severity).
- Return a status object: `isUpToDate`, `differences`, `lastCheckedAt`.

#### [NEW] `src/lib/readme-update.functions.ts`
- Implement `updateReadmeWithAi` server function.
- Uses AI to selectively update README sections based on freshness differences.
- **Constraints:** Preserve useful content, update only affected sections, zero hallucination.

### Frontend Components

#### `src/routes/_authenticated/editor.tsx`
- **Freshness Indicator:** Add a "README Status" badge in the sidebar/header (Up to date / Potentially outdated).
- **Freshness Modal:**
  - Display "X changes may require README updates."
  - Side-by-side comparison of README current state vs. Repository detected facts.
  - "Update README with AI" button.
- **Diff View:** Show a preview of AI-suggested changes before saving.
- **Version History:** Ensure Supabase `readme_documents` table stores versions (handled via existing `updated_at` and `upsert` logic, but will ensure clean state management).

## Technical Details

### Freshness Heuristics
- **Dependencies:** Detect if key packages (Tailwind, Vite, etc.) in `package.json` are absent from README.
- **Frameworks:** Detect framework mismatches.
- **Scripts:** Compare `npm dev/build/test` commands.
- **Env Vars:** Check if `.env.example` keys are documented.

### Database
- Use existing `readme_documents` and `repository_analyses`.
- No schema changes required as logic is derived from current state.

### Accuracy vs Freshness
- Accuracy (already implemented) checks for *wrong* information.
- Freshness checks for *missing* or *outdated* information relative to the latest repo scan.
