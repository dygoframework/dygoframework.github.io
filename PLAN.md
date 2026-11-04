# Dygo Framework website: rebuild plan

Rebuild **dygoframework.com** from scratch. The site has a marketing Home page, the Dygo documentation and an Enterprise page. It is static and hosted on GitHub Pages.

This plan replaces all earlier plans. The GitHub repo is `dygoframework/dygoframework.github.io`. Work on branch `rebuild`, one phase at a time. Push that branch and open a pull request after each phase. Don't push to `main`, change DNS or change GitHub settings without asking Dylan.

The old implementation was removed on purpose. It remains in local Git branches `phase/1-foundation` to `phase/6-deploy`. Don't restore or copy from it unless Dylan asks.

## 1. Sources of truth

Use this order when sources disagree:

1. This plan
2. `DESIGN.md`
3. `design/docs-menu-map.md`
4. `design/*.dc.html` for layout and style
5. The Dygo repo for all product facts

| Topic | Source |
|---|---|
| Layout and visual design | `design/Main`, `Docs`, `Enterprise`, `HomeMobile`, `DocsMobile`, `EnterpriseMobile` and `MobileMenu` `.dc.html` files |
| Logo and icons | `design/brand/` |
| Docs menu | `design/docs-menu-map.md` |
| Rules for contributors | `DESIGN.md` and `CLAUDE.md` |
| Product facts and docs | `https://github.com/dygoframework/dygo`. A local checkout is at `../dygo-framework`. |

**Rules**

- The `.dc.html` files are references. Match their layout, spacing and colors, but don't ship their runtime.
- They need a canvas runtime that isn't in this repo, so read their source for exact values. If `design/screenshots/` exists, compare your pages against those images.
- Never invent an API, number, customer or feature. Check every claim against the Dygo repo.
- Any `dygoacademy` path is outdated. Use `github.com/dygoframework/dygo`.
- Before you use docs, confirm that `main` of the Dygo repo has the latest docs. If it doesn't, use the branch `docs/site-dygoframework-com` and tell Dylan.

## 2. Tech stack

| Area | Choice |
|---|---|
| Site | Astro with Starlight |
| Search | Pagefind, included with Starlight |
| Code blocks | Expressive Code, included with Starlight |
| Home and Enterprise | Custom Astro pages |
| Docs shell | Starlight component overrides |
| Fonts | Manrope and Fira Mono, self-hosted with Fontsource |
| Tests | Playwright, `@axe-core/playwright`, Stylelint |
| Hosting | GitHub Pages through GitHub Actions |
| Package manager | npm with a committed lockfile |

Use current stable versions and pin them in the lockfile.

## 3. Project structure

```text
.github/
  workflows/            ci.yml, deploy.yml, sync-docs.yml
  CODEOWNERS
  pull_request_template.md
design/                 Design references, never shipped
public/                 CNAME, favicons, brand files
scripts/                Docs sync and link checks
src/
  components/
    docs/               Starlight overrides
    navigation/         TopBar, Sidebar, MobileMenu, OnThisPage
    sections/           Large page sections
    ui/                 Button, Input, Badge, Card, CodeBlock, Hint
  content/docs/         Generated docs, not committed
  data/                 navigation.ts, home.ts, enterprise.ts
  layouts/              BaseLayout, DocsLayout, MarketingLayout
  pages/                index.astro, enterprise.astro, 404.astro, styleguide.astro
  styles/tokens.css     All design values
tests/                  Visual, accessibility and unit tests
```

Follow `DESIGN.md` from the first commit.

## 4. Design

### Tokens

| Token | Value |
|---|---|
| Background | `#0B0B0C` |
| Raised surface | `#121211` |
| Code surface | `#161615` |
| Border | `#2A2A28` |
| Strong border | `#3A3A37` |
| Text | `#F4F4EF` |
| Muted text | `#BDBDB4` |
| Accent | `#FFD400` |
| Text on accent | `#0B0B0C` |
| Active menu tint | `rgba(255, 212, 0, 0.1)` |
| Code keyword | `#9CC4DC` |
| Code string | `#F0D58C` |
| Code function | `#F7E7B0` |

Take any other value from the design source and add it to `tokens.css`.

**Theme:** dark only for launch. Leave out the sun icon shown in the design.

**Yellow:** an accent only, as described in `DESIGN.md`. Never use it as a section background.

### Navigation

- **Top bar:** a floating rounded bar on all pages, with Docs, Enterprise and GitHub links.
- **Docs, desktop:** a hamburger segment shows or hides the sidebar. The bar also has search with a `⌘K` hint and the version.
- **Docs sidebar:** a floating rounded card with collapsible groups. Only the group with the current page starts open.
- **Docs page:** a "Copy markdown" button beside the title, and "On this page" on the right with a rail that follows the scroll position.
- **Mobile:** hamburger, centered logo, then a full-screen menu with search and collapsible groups. "On this page" collapses above the article.
- **Breakpoint:** use the mobile layout below 1024px.
- **Soon items:** show the "Soon" badge from `design/docs-menu-map.md`. These items aren't links and have no page.

## 5. Page content

The design contains some draft copy. This section overrides it.

### Home

- **Hero:** "Secure by default. Fast by design."
- **Install:** copy the current commands from the Dygo README, including the security option for `dygo new`. Show the port from that README.
- **Code tabs:** use real Dygo code from a tested example. Don't use `dygo.New()`, `app.GET`, `app.Use`, `dygo.RateLimit(100)`, `c.JSON` or `dygo.Map`. They aren't Dygo's API.
- **Security:** use only claims from the README and `docs/owasp.md`, such as deny by default, secure headers and CORS in new projects, strict JSON and body limits, and OWASP checks in CI. Link to what still stays with the app.
- **Performance:** use only claims from `benchmarks/README.md`, such as typed JSON handlers within 1% of hand-written `net/http`.
- **Benchmarks:** replace the placeholders with current numbers from `benchmarks/README.md`. Say they are in-process framework costs, and link to the method.
- **Honest comparison:** never claim Dygo is the fastest overall. The same benchmarks show it is slower on static routes.
- **Remove:** "Built-in profiling" and "Graceful handling under load".
- **Feature cards:** use real areas such as Modules and DI, Typed handlers, Pipeline, Security, CLI and Transports.

### Docs

Build the menu and pages from `design/docs-menu-map.md`.

- **Ready:** use the existing page.
- **Split:** turn the named heading into its own page, keeping the original wording where possible.
- **New:** write a short page from the code and test the examples. List these pages in the pull request for Dylan's review.
- **Soon:** menu item only.

### Enterprise

Build from `design/Enterprise.dc.html` and `EnterpriseMobile.dc.html`.

- Treat the six services, team support, workshops and the "people who build Dygo" wording as drafts. Put them in `src/data/enterprise.ts`, and don't launch them until Dylan confirms them.
- Don't add client logos, testimonials, courses or prices unless Dylan supplies real ones.
- The contact form has a work email input and a "Get in touch" button.
- GitHub Pages can't receive forms. Read the endpoint from `PUBLIC_CONTACT_FORM_URL`. If it's missing, the build must fail in production.
- The form needs a loading state, success and error messages, a privacy note and basic spam protection. Never show success unless the request succeeded.

## 6. Docs pipeline

Keep Markdown in the Dygo repo so docs change with the code. Add `scripts/sync-docs.mjs` to do the following:

1. Check out `dygoframework/dygo` at `DOCS_REF`, defaulting to `main`.
2. Copy the sources listed in `design/docs-menu-map.md`.
3. Copy `CHANGELOG.md`, `SECURITY.md` and `benchmarks/README.md` to their pages.
4. Split the named sections and add Starlight frontmatter.
5. Rewrite internal links, and convert MkDocs admonitions to the Hint component.
6. Keep the "New" pages in this repo, under `src/content/docs-pages/`, and merge them in.

Exclude `phase-*.md`, `decisions.md` and `nestjs-to-dygo.md`. Fail the build on broken internal links. Running the sync twice must give identical output.

## 7. Phases

### Phase 1: Foundation and guardrails

- Scaffold the project and structure from Section 3, tokens, fonts and layouts.
- Add `/styleguide`. It must show every shared component and its states, such as hover, focus, disabled, loading and error. Keep it out of production, the sitemap and search.
- Add Stylelint and `npm run lint`. Block raw colors outside `tokens.css` and unapproved fonts.
- Add `npm run test:visual` and accessibility tests. Cover pages at 390, 768, 1024 and 1440px. Use a fixed docs test page, because synced docs change.
- Add `ci.yml`. Create visual baselines in the Linux environment CI uses, not on macOS.
- Add `CODEOWNERS` with `[GITHUB-USERNAME]`.
- Add `.github/pull_request_template.md` from the checklist in `DESIGN.md`. It must ask for before and after screenshots, each component reused, changed or added, and proof that new patterns were approved.

**Done when:** all checks pass in CI, and a raw color in a page, a changed button color and an input with no label each fail a check.

### Phase 2: Components

- Build the UI, navigation and docs components, and show every state on `/styleguide`.

**Done when:** components match the design at all four widths, keyboard use works and every state appears on `/styleguide`.

### Phase 3: Docs

- Build the sync script, full menu, Starlight overrides, search, code blocks and Copy markdown.
- Split the docs and write the "New" pages.

**Done when:** every menu item works or shows "Soon", there are no broken links, and search returns results.

### Phase 4: Home and Enterprise

- Build both pages with the Section 5 content and the contact form.

**Done when:** both pages match the design, every claim traces to the Dygo repo, and the form's success and error states are tested.

### Phase 5: SEO and quality

- Add titles, descriptions, canonical URLs, Open Graph tags, sitemap, robots file and a 404 page.
- Use `design/brand/dygo-github-social-preview.png` as the base share image.

**Done when:** Lighthouse scores at least 95 for accessibility and SEO on Home, Enterprise and a docs page.

### Phase 6: Deployment

- Add `deploy.yml` with official Pages actions pinned to commits, and `public/CNAME` set to `dygoframework.com`.
- Add `sync-docs.yml` for `repository_dispatch`, a nightly schedule and manual runs.
- Then stop for Dylan's manual steps.

**Done when:** the site loads over HTTPS, and a docs change in the Dygo repo reaches the site.

## 8. Manual steps for Dylan

1. Done: the repo is `dygoframework/dygoframework.github.io`, set as `origin`.
2. Choose a contact form option and set `PUBLIC_CONTACT_FORM_URL`.
3. Confirm the Enterprise services and wording.
4. Replace `[GITHUB-USERNAME]` in `.github/CODEOWNERS`.
5. Protect `main`: require a pull request, code owner review and all checks.
6. Turn off any old MkDocs deployment to dygoframework.com before launch.
7. Set Pages to GitHub Actions, add the custom domain and update DNS, following GitHub's current guide.
8. Turn on "Enforce HTTPS".
9. Add a workflow or token in the Dygo repo that sends `repository_dispatch` after docs changes.
10. Finish the name and logo trademark checks.

## 9. Open questions

Use the default unless Dylan says otherwise.

| Question | Default |
|---|---|
| Contact form | Formspree or a similar form service |
| Theme | Dark only |
| Version in the top bar | Latest Git tag, or hide it if there is no tag |
| Community links | GitHub only |
| Soon items | Keep all ten until Dylan removes any |

## 10. Launch checklist

- [ ] No `[YOUR-ORG]`, `[VERSION]`, `[REQ/SEC]` or similar placeholders remain
- [ ] No `dygoacademy` paths remain in generated pages
- [ ] Code samples compile or come from tested code
- [ ] All claims trace to the Dygo repo
- [ ] Enterprise wording and services are confirmed
- [ ] Contact form sends to the right place
- [ ] Links, search, Soon items and Copy markdown work
- [ ] Desktop and mobile checked in Chrome and Safari
- [ ] All required checks pass
- [ ] Old deployment is off
- [ ] HTTPS is enforced
