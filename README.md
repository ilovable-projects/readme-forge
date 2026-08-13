# README Forge

Build a modern SaaS web application called "READMEForge".

READMEForge is an AI-powered GitHub README generator and analyzer.

Core concept:

A user enters a public GitHub repository URL.

The application analyzes the repository and generates a professional, accurate README.md based on the actual repository contents.

Create a polished developer-focused SaaS interface.

Design direction:

- Modern developer tool aesthetic

- Clean and minimal

- Dark-first interface

- Excellent typography

- Subtle gradients

- Professional, not flashy

- Responsive on desktop, tablet and mobile

- Smooth but subtle animations

- Use cards, tabs, badges, progress indicators and code blocks

- Avoid excessive glassmorphism

Create these pages:

1. Landing page

2. Dashboard

3. Repository Analyzer

4. README Editor

5. README Health Score

6. Templates page

7. Settings page

Landing page:

- Hero headline: "Turn Any GitHub Repository Into a Professional README"

- Supporting text explaining that READMEForge analyzes the actual repository instead of blindly generating generic AI text

- GitHub repository URL input

- "Analyze Repository" primary CTA

- Feature cards

- How it works section

- README quality score section

- Footer

Dashboard:

- Recent repositories

- README scores

- Recently generated READMEs

- "Analyze New Repository" button

Repository Analyzer:

- GitHub URL input

- Repository information card

- Analysis progress UI

- Detected languages

- Frameworks

- Dependencies

- Available scripts

- Environment variables

- License

- Project structure

- Existing README status

README Editor:

- Two-column desktop layout

- Left side: Markdown editor

- Right side: GitHub-style rendered preview

- Mobile should switch to tabs

- Toolbar with:

  Generate

  Improve

  Simplify

  Professionalize

  Check Accuracy

  Copy Markdown

  Download README.md

README Health:

- Overall score from 0-100

- Category scores

- Missing sections

- Warnings

- Accuracy issues

- Improvement suggestions

- "Fix with AI" buttons

Templates:

- Open Source

- Portfolio

- SaaS

- AI Project

- Python Project

- JavaScript/TypeScript Project

- CLI Tool

- Student Project

Use reusable components and keep the application architecture clean and scalable.

For now, create the complete frontend experience with realistic mock data.

Do not implement GitHub API or AI integration yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a3f3bf04-90e6-451c-b278-3a3d695239b3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
