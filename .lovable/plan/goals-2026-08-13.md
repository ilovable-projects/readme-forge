---
name: GitHub Repository Analyzer
description: Implementation of a secure server-side GitHub repository analyzer using TanStack Start server functions and Octokit.
type: feature
---

## Goals
- Securely analyze public GitHub repositories server-side.
- Extract metadata, technologies, and project structure.
- Persist results to the `repositories` and `repository_analyses` tables.
- Prevent exposure of GitHub API tokens to the client.

## Technical Details
- Use `createServerFn` from `@tanstack/react-start`.
- Use `octokit` for GitHub API interactions.
- Validate GitHub URLs using a regular expression.
- Map GitHub metadata to the database schema.
- Implement progress reporting via server-sent events or frequent status updates (simulated in frontend while the server function runs).
- Handle rate limits and large repository constraints.

## Security
- GitHub token stored as a secret on the backend.
- Never return sensitive files like `.env`.
- Extract only safe environment variable names from config files.
