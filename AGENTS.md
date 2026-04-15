# Project-wide Agent Guide

## Communication

- Respond to the user in polite Korean.
- Every proposal, code change, and tradeoff must include a concrete reason.
- If the target file or requirement is ambiguous, inspect the repository first and state the assumption before editing.

## Next.js First

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes; APIs, conventions, and file structure may differ from older Next.js knowledge.
Read the relevant guide in `node_modules/next/dist/docs/` before writing code.

- Use `01-app/` for App Router behavior.
- Use `03-architecture/` for rendering, caching, and runtime behavior.
- Heed deprecation notices before adopting an older pattern.
<!-- END:nextjs-agent-rules -->

## Project Snapshot

- Framework: Next.js `16.2.3`, React `19.2.4`, TypeScript `5`
- Styling/UI: Tailwind CSS `4`, shadcn/ui, Radix UI
- Auth: NextAuth v4 with Drizzle adapter
- Data: Drizzle ORM, SQL migrations in `drizzle/`
- State/runtime: Zustand, Web Worker, BroadcastChannel, Document Picture-in-Picture

## Codebase Map

- `app/`: App Router entries, root layout, and route handlers
- `app/page.tsx`: thin server entry for the home route
- `components/`: reusable UI and route-level client wrappers
- `components/home/home-page-client.tsx`: client/provider bridge for the home route
- `src/screens/`: screen-level composition
- `src/screens/home/HomeScreen.tsx`: main home screen assembly
- `src/features/`: feature-local logic such as `timer` and `progress`
- `src/store/`: shared Zustand state and snapshot builders
- `src/db/`: database schema and DB entrypoint
- `drizzle/`: generated SQL migrations and migration metadata
- `public/`: static assets
- `auth.ts`: NextAuth configuration and shared server auth entrypoint

## Editing Rules

- Keep App Router entry files thin. Put UI composition in `src/screens/` and feature behavior in `src/features/`.
- Prefer extending an existing feature module over creating a parallel abstraction.
- Keep shared presentation primitives in `components/ui/`. Do not move feature-specific business logic there.
- Keep server and data access concerns in `app/api/`, `auth.ts`, and `src/db/`. Do not introduce direct DB access from client components.
- When editing `src/db/schema.ts`, update the migration flow in `drizzle/` as part of the same task.
- Follow the existing timer split:
  - state in `src/store/`
  - worker timing in `src/workers/` and timer hooks
  - PiP integration in `src/features/timer/pip/`
- Preserve the existing import alias style (`@/...`) and TypeScript-first approach.

## Verification

- Documentation-only changes do not require runtime commands.
- For application code changes, run `pnpm lint`.
- Also run `pnpm build` when touching routing, build config, auth, DB schema, or shared types.
- For schema changes, run `pnpm db:generate` and inspect the generated SQL before finishing.
- In the final response, summarize what changed, why it changed, and what was verified.

## Change Hygiene

- Never overwrite or revert user changes you did not make.
- Prefer small, scoped edits with file-specific reasons.
- Before adding a dependency or a new architectural layer, explain why the current structure is insufficient.
