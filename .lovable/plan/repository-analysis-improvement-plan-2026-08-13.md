# Repository Analysis Improvement Plan

Enhance the repository analysis engine to produce a structured, normalized object that serves as the single source of truth for AI generation and UI display.

## User Review Required

> [!IMPORTANT]
> - The analysis will now explicitly track confidence levels (**verified**, **likely**, **unknown**).
> - UI will be updated to show these distinctions clearly.
> - AI generation in the editor will use this structured data instead of raw analysis.

## Proposed Changes

### Backend (Server Functions)

#### `src/lib/github-analyzer.functions.ts`
- Implement a `RepositoryAnalysis` interface for normalized structured data.
- Update `analyzeRepository` to populate this structured object.
- Add confidence level detection:
    - **verified**: Explicitly found in config files (e.g., `package.json` dependencies).
    - **likely**: Inferred from file presence (e.g., `.env.example` presence implies env vars).
    - **unknown**: No evidence found.
- Detect package managers (`npm`, `yarn`, `pnpm`, `bun`).
- Extract commands (dev, build, test, start).
- Store this structured object in `repository_analyses.analysis_data`.

### Frontend

#### `src/routes/analyzer/index.tsx`
- No immediate change to the "Scanning" UI (which already shows progress), but prepare to receive the structured result.

#### `src/routes/editor/index.tsx`
- Update the "AI Context" sidebar to show **Verified**, **Likely**, and **Missing** information.
- Update the `handleGenerate` function to use the structured `analysis_data`.

### Database
- The existing `analysis_data` JSONB column in `repository_analyses` is sufficient to store the structured object.

## Technical Details

### Structured Analysis Object Schema
```typescript
interface AnalysisEntry<T> {
  value: T;
  confidence: 'verified' | 'likely' | 'unknown';
  source?: string;
}

interface StructuredAnalysis {
  language: AnalysisEntry<string | null>;
  frameworks: AnalysisEntry<string[]>;
  packageManager: AnalysisEntry<string | null>;
  commands: {
    development: AnalysisEntry<string | null>;
    build: AnalysisEntry<string | null>;
    test: AnalysisEntry<string | null>;
    start: AnalysisEntry<string | null>;
  };
  envVars: AnalysisEntry<string[]>;
  license: AnalysisEntry<string | null>;
  documentationStatus: {
    readme: boolean;
    contributing: boolean;
    license: boolean;
  };
}
```

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure type safety with the new interface.

### Manual Verification
1. Analyze a known repository (e.g., a React project).
2. Verify that the analysis data in the database contains the structured object.
3. Check the Editor sidebar to ensure "Verified" vs "Likely" information is displayed correctly.
4. Test AI README generation to ensure it correctly maps the structured data to Markdown sections.
