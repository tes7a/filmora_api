## Working agreements

### Workflow & quality gates (TypeScript / NestJS)

- After modifying any **TypeScript source** (`src/**/*.ts`) or **tests** (`test/**/*.ts`), always run:
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm run test`
- After modifying **e2e tests** or e2e configs, also run:
  - `pnpm run test:e2e`
- Before pushing changes that affect build output (SWC config, build pipeline, tsconfig, prisma), run:
  - `pnpm run build`

### Dependency & tooling conventions

- Prefer **pnpm** for installing dependencies.
- Ask for confirmation before adding **new production dependencies** (anything under `dependencies`).
- Prefer adding dev-only tooling under `devDependencies` when possible.
- Keep formatting consistent:
  - Use `pnpm run format` for auto-formatting.
  - Use `pnpm run format:check` in CI or before PR if needed.

### Architecture principles (DDD-first)

- Default approach is **DDD-oriented structure**:
  - Keep domain logic isolated from infrastructure/framework concerns.
  - Controllers should be thin (HTTP concerns only), delegating to application services/use-cases.
  - Keep dependency flow inward: `domain -> application -> infrastructure`.
  - Avoid leaking ORM/Prisma models outside the infrastructure layer; use domain entities/value objects or DTOs where appropriate.
- Prefer clear boundaries and explicit interfaces (ports) between layers.

### Code review / analysis expectations (for agents)

When preparing a change review, always:

- Run `git diff` and include committed changes from the current branch (e.g. `git log --oneline --decorate -n 30` + `git show` as needed).
- Analyze modified code in context of the surrounding codebase.
- Report findings grouped by severity: **Critical / High / Medium / Low**.
- Evaluate:
  - **Architecture Alignment** (structure, separation of concerns, dependency boundaries)
  - **Code Quality** (readability, SOLID, clean code, patterns)
  - **Anti-patterns & Risks** (bugs, security, performance)
- Provide concrete, pragmatic improvements with pointers to the relevant files/areas.

### Handoff notes (for continuing work seamlessly)

At the end of a work session, produce a Markdown handoff summary including:

- **Decisions Made** (architectural/implementation choices)
- **Changes Completed** (files modified, features added)
- **Blockers/Issues** (unresolved problems)
- **Pending Work** (remaining tasks, next steps)

The summary should be copy-pastable into a new conversation to continue seamlessly.
