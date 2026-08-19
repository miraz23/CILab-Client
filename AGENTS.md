<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CILab Client (Computational Intelligence Lab)

Next.js 16.2.4 (App Router) + React 19.2.4 + Tailwind v4 + shadcn-style UI on `@base-ui/react` primitives. Single-page marketing site with auth. No tests, no CI.

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — production build; also runs TS typechecking
- `npm run start` — serve production build
- `npm run lint` — bare `eslint`. **Very slow** (~2 min even for one file); it is the only way lint runs, so when linting always pass a long timeout (>= 180s). Prefer scoping to files you touched: `npx eslint <file>`
- Typecheck: `npx tsc --noEmit` (tsconfig has `noEmit: true`). There is no npm script for it.

## Architecture

- `app/` — App Router pages. `app/layout.tsx` loads Montserrat via `next/font/google` and renders `Navbar` globally.
- `components/shared/` — layout chrome (e.g. `Navbar`); `components/ui/` — shadcn-style primitives; `components/ui/home/` — page sections (e.g. `Banner`).
- `lib/api/` — typed `fetch` wrappers (e.g. `auth/login.ts`, `auth/register.ts`) that POST to an **external backend**, not Next.js routes. `lib/types/` — matching request/response/form types (e.g. `auth/*`).
- Auth routes live at `/auth/login` and `/auth/register` as `"use client"` form pages that call `submitLoginApplication` / `submitRegisterApplication` and surface errors via `LoginApiError` / `RegisterApiError`.

## Environment

- Backend base URL comes from `NEXT_PUBLIC_SERVER_URL` in `.env.local` (gitignored, not committed). Auth calls hit `${NEXT_PUBLIC_SERVER_URL}/api/register` and `/api/login`. Without this var, auth pages fail at runtime. Don't commit real values.
- Local `app/api/**` route handlers were deliberately removed — all requests go to the external server. Don't reintroduce server routes for auth.

## Conventions

- Path alias `@/*` → project root (`tsconfig.json`); use `@/components`, `@/lib`, `@/lib/utils` (`cn` helper).
- Tailwind v4 CSS-first config: no `tailwind.config`, tokens live in `app/globals.css` (`@theme inline`, `@custom-variant dark`); imports `tw-animate-css` and `shadcn/tailwind.css`. VSCode is configured to ignore unknown-at-rule warnings for this.
- UI components in `components/ui/` are generated shadcn primitives built on `@base-ui/react` (not Radix) — they use `data-slot` attributes and `render` props. Prefer regenerating/extending these over hand-rolling new primitives.
- Brand palette used everywhere: olive `#716f49` and dark green `#1F321C`; accents via arbitrary Tailwind values like `text-[#716f49]`, `bg-linear-to-br`.
- Components that use hooks/state are marked `"use client"`. New client components should be too.
- 4-space indentation in app/components code (shadcn-generated UI files use 2).