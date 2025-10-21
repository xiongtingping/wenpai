# Repository Guidelines

## Project Structure & Modules
- `src/components/` contains presentation layers grouped by domain (`ui`, `auth`, `creative`, `landing`). Place reusable primitives in `components/ui`.
- Business logic sits in `src/features/*` (e.g., `content-adapter`, `title-generation`). Shared hooks live in `src/hooks/`; strongly type exported helpers in `src/types/`.
- Service and API clients are stored in `src/services/` and `src/api/`. All outbound requests should funnel through `src/api/request.ts`.
- Persistent state and compatibility layers live in `src/stores/`, with `unified-state-store.ts` as the single source of truth. Avoid reintroducing deprecated stores.
- Styling assets and design tokens are under `src/styles/`, `tokens/`, and governed by CSS layer conventions. Documentation and playbooks live in `docs/`; Supabase assets in `supabase/`.

## Development & Build Commands
```bash
npm run dev              # Start Vite dev server (http://localhost:5173)
npm run build            # Build tokens then production bundle
npm run build:check      # Lint, sanity-check, type-check, and build
npm run lint[:fix]       # ESLint validation / autofix
npm run type-check       # TypeScript diagnostics
npm run dialog:test      # Vitest suites (extend for new tests)
npm run css:governance:check|fix   # CSS governance enforcement
npm run tokens:build     # Regenerate design tokens
npm run deploy:netlify   # Netlify production deploy
npm run smoke:cloud-sync # Supabase smoke test (requires SUPABASE_URL / SERVICE_ROLE)
```
Prefer npm scripts over direct node calls—the scripts layer handles environment prep and cleanup.

## Tech Stack & Architecture Notes
- React 18 + TypeScript, Vite 7 for builds, Tailwind + CSS variables for styling, Radix UI/shadcn for primitives, Zustand + React Context for state, i18next for internationalisation.
- Authentication integrates Authing Guard with Supabase Auth; guards (`AuthGuard`, `ProGuard`, `PremiumGuard`) wrap protected routes. API proxying uses Netlify Functions for key shielding and CORS.
- Data persistence flows through Supabase with per-user isolation. Use `unified-state-store` APIs instead of localStorage access.

## Coding Standards
- Strict TypeScript: declare types for all values, avoid `any`, `@ts-ignore`, or unchecked assertions. Structure code by responsibility; colocate types and utilities in dedicated folders.
- Prefer explicit interfaces for component props:
  ```tsx
  interface TitleProps { title: string }
  const Title: React.FC<TitleProps> = ({ title }) => <h1>{title}</h1>;
  ```
- Components use PascalCase, hooks use `useCamelCase`. File names follow component names (`ContentAdapter.tsx`), utility files stay kebab-case.
- Maintain 2-space indentation, trailing commas, and ESLint/Stylelint compliance (`npm run lint`, `npm run style:lint`). For complex variants, use `class-variance-authority` helpers; avoid inline style literals.

## CSS & Token Governance
- Adhere to CSS layer hierarchy and design tokens; never hardcode colour/spacing. Run `npm run css:governance:check` and `npm run tokens:build` before merging styling changes.
- Keep custom styles scoped; avoid global overrides outside `styles/` layers.

## Testing & Quality
- Unit/integration tests rely on Vitest (`*.test.ts[x]`). Place fixtures in `src/tests/__fixtures__`. Snapshot output must be deterministic.
- Coverage targets are scenario-driven; when touching shared services or auth flows, run `npm run dialog:test -- --coverage` plus Supabase smoke tests if data paths change.
- Manual sanity checks (`scripts/system-sanity-check.mjs`) accompany critical deployments.

## Commit & PR Workflow
- Follow Conventional Commits (`feat:`, `fix:`, `refactor:`). Mirror the repository’s detailed style (summary + optional checklists) as seen in `COMMIT_MESSAGE.txt`.
- PRs should include a problem statement, solution summary, test evidence (`npm run lint`, `npm run build:check`), and environment callouts. Provide screenshots/logs for UI-visible changes.
- Call out auth/Supabase modifications and update related docs under `docs/`.

## Environment & Security
- Inject secrets via `.env.local`, direnv, or CI secrets; never commit credentials. Required Supabase variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `SUPABASE_ANON_KEY`.
- Before deploying, run `npm run predeploy` to execute deploy checks, lint, and build.
