# dygoframework.com

The website and docs for the [Dygo framework](https://github.com/dygoframework/dygo). Built with Astro and Starlight, hosted on GitHub Pages.

Read `CLAUDE.md`, `DESIGN.md` and `PLAN.md` before you change anything.

## Docs

The docs live in the [Dygo repo](https://github.com/dygoframework/dygo), so they change with the code. `npm run sync-docs` copies them into `src/content/docs/docs/`, which isn't committed, and splits them into the pages of `design/docs-menu-map.md`. `scripts/lib/docs-manifest.mjs` says where each page comes from.

- `DOCS_SOURCE=../dygo-framework npm run sync-docs` uses a local checkout. Without it, the script clones `DOCS_REF` (default `main`).
- "New" pages, written from the code, are in `src/content/docs-pages/`. Their Go examples run in `tests/examples` (`cd tests/examples && go test ./...`).
- `npm run build` syncs first if nothing was synced yet, and fails on broken internal links.

## Commands

| Command | What it does |
|---|---|
| `npm run sync-docs` | Syncs the docs from the Dygo repo |
| `npm run dev` | Local server, with `/styleguide` and the docs test page |
| `npm run build` | Production build. Dev pages are left out |
| `npm run check` | Astro and TypeScript checks |
| `npm run lint` | Stylelint and the design rules in `scripts/check-design.mjs` |
| `npm run test:unit` | Unit tests for the scripts |
| `npm run test:a11y` | axe checks at 390, 768, 1024 and 1440px |
| `npm run test:visual` | Screenshot tests at the same widths |
| `npm run test:baselines` | Rewrites screenshot baselines. Only for approved design changes |

Screenshot tests compare against baselines made in the Linux Playwright image CI uses. On macOS, `test:visual` and `test:baselines` run in that image through Docker, limited to 2 CPUs and 3 GB of memory.
