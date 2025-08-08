# Copilot Coding Agent Onboarding Instructions

## Repository Summary

This repository is a Next.js-based blog for publishing and managing promotional offers, including Amazon deals. It features admin tools, scraping, image optimization, and integration with Google Gemini for AI-generated marketing text. The project is primarily in JavaScript/JSX, with some configuration in JSON and shell scripts.

## High-Level Information

- **Type:** Web application (Next.js)
- **Languages:** JavaScript, JSX, some shell scripts (fish), JSON
- **Frameworks:** Next.js, React, TailwindCSS
- **Linting/Formatting:** ESLint, Prettier
- **AI Integration:** Google Gemini API
- **Size:** Medium (multiple feature folders, API routes, admin tools)
- **Hosting:** Vercel (vercel.com)
- **CI/CD:** Vercel automatic deployments (listen for github commits) (no explicit CI pipeline defined)
- **Storage:** Local JSON files for data, no database

## Build, Run, and Validation Instructions

- **Always run `npm install` before any build, run, or lint step.**
- **Development:**
  - Start with: `npm run dev` (uses `fish ./start-dev.fish`)
  - Or: `npm run next-dev` (direct Next.js dev server)
- **Build:**
  - Run: `npm run build`
- **Start (Production):**
  - Run: `npm run start`
- **Lint:**
  - Check: `npm run lint` (checks all JS/TS/JSX/TSX files)
  - Fix: `npm run lint:fix` (auto-fixes and formats)
- **Pre-commit:**
  - Uses Husky and lint-staged to auto-fix only staged files.
  - Hook: `.husky/pre-commit` runs `npx lint-staged`.
- **Environment:**
  - Node.js 18+ recommended.
  - Requires `.env.local` with `GEMINI_API_KEY` for Gemini API features.
- **Validation:**
  - No test suite detected; validate by running dev server and checking for errors.
  - Lint and Prettier must pass before commit.

## Project Layout & Key Files

- **Root files:**
  - `package.json` (scripts, dependencies)
  - `README.md` (project overview)
  - `.eslintrc.json`, `.prettierrc`, `.lintstagedrc.json` (lint/format config)
  - `next.config.mjs`, `tailwind.config.js`, `postcss.config.js` (framework/config)
  - `.husky/` (git hooks)
- **Source folders:**
  - `pages/` (Next.js routes, including API endpoints)
  - `components/` (React UI components)
  - `models/` (data models)
  - `services/` (API client logic)
  - `lib/` (helpers, shared logic)
  - `data/` (JSON data files)
  - `public/` (static assets/images)
  - `styles/` (global CSS)
- **Admin tools:**
  - `components/AdminForm.js`, `services/adminApi.js`, `pages/admin/`
- **AI Integration:**
  - `pages/api/generate-text.js` (Gemini API)
  - `services/adminApi.js` (client calls)
- **Image Optimization:**
  - `pages/api/optimize-image.js`, `pages/api/optimize-base64-image.js`

## Coding Standards

- **JavaScript/JSX:** Follow Airbnb style guide.
- **Linting:** Use ESLint with rules defined in `.eslintrc.json`.
- **Formatting:** Use Prettier with rules in `.prettierrc`.
- **Commit Messages:** Use conventional commits (e.g., `feat:`, `fix:`, `chore:`).
- **File Naming:** Use kebab-case for files and folders (e.g., `my-component.js`).
- **Component Structure:** Use functional components with hooks, avoid unecessary class components.
- **CSS:** Use TailwindCSS for styling, avoid inline styles.
- **State Management:** Use React's built-in state and context API, no external state libraries.
- **Avoid Duplicate Code:** Use shared components and utility functions to avoid repetition.

## Checks Before Commit

- **Lint and Prettier:** All staged files are auto-fixed and formatted via pre-commit hook.
- **No CI pipeline detected.** Manual validation required.
- **Always validate changes by running the dev server and checking for runtime errors.**

## Additional Notes

- **Scripts:** All main scripts are in `package.json`. Use `npm run <script>`.
- **Configuration:** Lint, Prettier, and lint-staged configs are in the root. Adjust as needed for new file types.
- **Environment:** Ensure required environment variables are set before running features that depend on them.
- **Trust these instructions. Only search the repo if information here is incomplete or incorrect.**

---

**End of Copilot Coding Agent Onboarding Instructions**
