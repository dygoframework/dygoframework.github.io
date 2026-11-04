# dygoframework.com

The website and docs for the [Dygo framework](https://github.com/dygoframework/dygo). Built with Astro and Starlight, hosted on GitHub Pages.

Read `CLAUDE.md`, `DESIGN.md` and `PLAN.md` before you change anything.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local server, with `/styleguide` and the docs test page |
| `npm run build` | Production build. Dev pages are left out |
| `npm run check` | Astro and TypeScript checks |
| `npm run lint` | Stylelint and the design rules in `scripts/check-design.mjs` |
| `npm run test:unit` | Unit tests for the scripts |
| `npm run test:a11y` | axe checks at 390, 768, 1024 and 1440px |
| `npm run test:visual` | Screenshot tests at the same widths |
| `npm run test:baselines` | Rewrites screenshot baselines. Only for approved design changes |

Screenshot tests compare against baselines made in the Linux Playwright image CI uses. On macOS, `test:visual` and `test:baselines` run in that image through Docker, limited to 2 CPUs and 3 GB of memory.
