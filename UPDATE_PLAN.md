# Website update plan: modern style and new modules

**Goal:** keep www.dygoframework.com current with Dygo, starting with the new AI module, and make new modules easy to add later.

**Status:** plan for Dylan's review. The site launched from `PLAN.md` Phases 1–6. This plan adds to it. `DESIGN.md`, `CLAUDE.md` and the guardrails still apply.

## 1. What changed in Dygo

I checked `main` of `dygoframework/dygo` on 2026-11-10.

| Change | Status in Dygo | Source |
|---|---|---|
| **AI module:** ask a model, stream answers, typed output, OpenAI, Anthropic, Ollama and other compatible servers, and a fake model for tests | Beta: `ai/v0.1.0-beta.1` | `docs/guide-ai.md`, `examples/chat`, `CHANGELOG.md` |
| `dygo ai init` | Unreleased in the changelog | `CHANGELOG.md`, `docs/guide-cli.md` |
| `dygo run <command>` | Unreleased in the changelog | `CHANGELOG.md` |
| `openapi.JSONSchema(t)` | Unreleased in the changelog | `CHANGELOG.md` |
| Getting started uses `dygo start -watch` | Unreleased in the changelog | `docs/getting-started.md` |
| The simple project layout is removed | Unreleased in the changelog | `CHANGELOG.md` |
| Security setup changes, such as `BearerAuth` and a random `AUTH_SECRET` | Unreleased in the changelog | `CHANGELOG.md` |

The site syncs docs from `main`, so unreleased features can appear before a release. Label them clearly.

## 2. Rules

- Every claim must come from the Dygo repo. Never describe an unreleased or beta feature as stable.
- Don't name Spring, NestJS or other frameworks in marketing copy, and don't compare Dygo with them. Describe Dygo's own strengths.
- Naming AI vendors that Dygo supports is fine, because it's a factual integration.
- New visual patterns start on the design canvas and need Dylan's approval before coding.
- Keep yellow as an accent only.

## 3. Phases

Work on a new branch for each phase, open a pull request and stop for review.

### U1. AI docs

- Add an **AI** menu group after Application. Split `docs/guide-ai.md` into:
  - Overview and setup
  - Ask and wait
  - Stream to the browser
  - Typed output
  - Errors
  - Retries, timeouts and logs
  - Testing
- Show a **Beta** badge on the group, and a short note at the top of each AI page with the module version.
- Link to `examples/chat`.
- Add `dygo ai init` and `dygo run` to the CLI pages.
- Remove any mention of the old simple project layout.
- Update `design/docs-menu-map.md` with the AI group.

**Needs design approval:** a Beta badge variant. Today the site only has the Soon badge.

**Done when:** every AI page builds from the synced docs, code examples match the repo, the Beta label appears on desktop and mobile, and all checks pass.

### U2. AI on the Home page

- Add an AI feature card, linking to the AI docs.
- Add a short "Add AI to your app" section with real code from `docs/guide-ai.md` or `examples/chat`. Show `dygo ai init`, a typed answer and streaming.
- Say it's in beta.
- Optionally add a small announcement bar: "New: AI module (beta)". It must be dismissible and accessible.

**Needs design approval:** the AI section and the announcement bar, designed on the canvas first.

**Done when:** desktop and mobile match the approved design, and every claim traces to the AI guide.

### U3. Modern style

These depend on `MODERN_STYLE_PLAN.md` in the framework repo. Ship each one only after the matching framework release.

| Website change | Needs framework item |
|---|---|
| Code examples use route comments, such as `//dygo:get`, with a "Without code generation" tab | A1 |
| A "Familiar by design" Home section: modules, constructor injection, route comments, guards and security rules | A1 |
| Short directives in the docs, such as `//dygo:public` and `//dygo:roles` | A2 |
| "Start a project" page that builds a `dygo new` command from options, with nothing sent to a server | A5 |
| Menu items for Profiles, Problem details and Operations endpoints | A4, A6, A7 |

Until then, show those menu items as Soon only if Dylan confirms they're planned.

**Needs design approval:** the "Familiar by design" section and the "Start a project" page.

### U4. Keep the site current automatically

- **Menu coverage check:** in CI, compare the synced Dygo docs with `docs-menu-map.md`. Fail when Dygo adds a guide or heading the menu doesn't cover, so new modules aren't missed.
- **Version labels:** read module versions from Dygo tags, such as `ai/v0.1.0-beta.1`, and show Beta or New labels from data, not hand-written text.
- **Release notes:** add a "What's new" page built from `CHANGELOG.md`, with released and unreleased changes clearly separated.
- **New module checklist:** add these steps to `DESIGN.md`:
  1. Add the docs.
  2. Update the menu map.
  3. Add a Home card if the module is a main feature.
  4. Add version labels.
  5. Get design approval for any new section.

**Done when:** a test guide added to a copy of the Dygo docs makes CI fail until it's in the menu.

## 3a. Approved designs

Dylan approved these designs on 2026-11-10. They are in `design/` and replace the older versions.

| Design file | What changed |
|---|---|
| `Main.dc.html`, `HomeMobile.dc.html` | New hero with a "New: AI module" pill and install terminal, real benchmark strip, "Familiar by design" cards, rounded Security and Performance cards, AI section with tabs, eight feature cards, route-comment code tabs with a "Without codegen" tab, and a "Start a project" call to action |
| `StartProject.dc.html` | New page that builds `dygo new` and `dygo ai init` commands in the browser. There's no mobile design, so build it as a fluid page that works at 390px. |
| `Docs.dc.html`, `DocsMobile.dc.html`, `MobileMenu.dc.html` | AI menu group with a Beta badge, "Start a project" link, no theme icon, and real First steps content |
| `Enterprise.dc.html`, `EnterpriseMobile.dc.html` | GitHub links point to the Dygo repo |

This approval covers the Beta badge, the announcement pill, the AI section and the "Familiar by design" and "Start a project" designs, so U1, U2 and those parts of U3 can start.

**Rules for these designs**

- Copy the existing live-site wording where it matches. The Home content in `src/data/home.ts` stays the source for Security, Performance and benchmark wording.
- Take code from tested sources. The route-comment example must compile and pass `dygo gen -check` in `tests/examples/home`. Take AI examples from `docs/guide-ai.md` or `examples/chat`.
- **Before building "Start a project", test every combination it can produce**, such as `dygo new shop -security -oidc -db postgres` followed by `dygo ai init -provider ollama`. Remove or change any option that fails, and tell Dylan.
- The theme icon is gone, because the site stays dark only.

## 4. Order of work

1. Done: designs approved, see Section 3a.
2. U1 AI docs.
3. U2 AI on the Home page.
4. U4 automation.
5. U3, one item at a time, after each framework release.

## 5. Questions for Dylan

| Question | Default |
|---|---|
| Show unreleased features from `main`, or only the latest release? | Show `main`, with clear Beta or Unreleased labels |
| Add the announcement bar? | Yes, dismissible |
| Add a "What's new" page? | Yes |
| Which planned framework features may appear as Soon? | None until confirmed |
