# README Health Score System Implementation Plan

Implement a real-time, data-driven README health scoring system that compares document content against repository analysis.

## User-facing changes
- **Health Dashboard**: Updated UI showing Overall Score (0-100), Category Scores, and categorized issues (Critical, Warning, Suggestion).
- **Categories**: Overview, Features, Installation, Usage, Tech Stack, Configuration, Project Structure, Testing, Deployment, Contributing, License, Accuracy.
- **Fix with AI**: "Fix" buttons next to issues that trigger targeted AI improvements in the editor.
- **Live Recalculation**: Scores update automatically as the README is edited.

## Technical details
- **Scoring Engine**: Create `calculateReadmeScore` server function in `src/lib/readme-health.functions.ts`.
- **Validation Logic**: 
    - Heuristics/regex to check presence and quality of sections.
    - Cross-reference with `StructuredAnalysis` (e.g., if `package.json` has tests but README doesn't mention them -> Warning).
    - Factual verification (e.g., if README installation command is `npm install` but project uses `bun` -> Critical).
- **Database Persistence**: Store results in `readme_scores` table linked to `readme_documents`.
- **Integration**:
    - Trigger calculation after `editReadmeSection` and in the main editor autosave loop.
    - Update `src/routes/health/index.tsx` to fetch and display the real data.
    - Export `Issue` and `CategoryScore` types for shared use.

## Verification plan
- **Automated Check**: Run `npm run build` to ensure type safety.
- **Manual Verification**: 
    1. Open a repository in the Editor.
    2. Intentionality introduce an error (e.g., wrong command).
    3. Navigate to Health page and verify the "Critical" issue appears.
    4. Click "Fix with AI" and verify the section is updated and score improves.
