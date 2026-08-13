# READMEForge Implementation Plan

Build READMEForge, an AI-powered GitHub README generator and analyzer.

## User Interface & Design
- **Theme**: Dark-first, minimal developer-focused SaaS.
- **Components**: GitHub URL input, analyzer dashboard, README editor/preview, template gallery.

## Features
- **URL Analysis**: Enter public repo URL to trigger "analysis" (mocked).
- **Dashboard**: Show repository stats, SEO/readability scores, and improvement suggestions.
- **Generator**: Multi-template support (Open Source, Portfolio, SaaS, etc.).
- **Editor**: Side-by-side Markdown editor and real-time preview.

## Technical Details
- **Framework**: TanStack Start (React 19).
- **Styling**: Tailwind CSS v4.
- **State Management**: TanStack Query for data fetching.
- **Mock Data**: Realistic data for initial frontend implementation.

## Security & SEO
- **SEO**: Meta tags for each route (Analyzer, Gallery, Editor).
- **Security**: Public repo analysis only (no auth required for basic features).
