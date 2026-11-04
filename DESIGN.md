# Dygo website design rules

Read this before changing anything under `src/`. It keeps the website consistent as more people contribute.

## Principles

- **Reuse first.** Use an existing token, component and layout before you create a new one.
- **Black first.** The site is dark. Yellow is an accent, not a background.
- **Real content only.** Never publish invented features, numbers, customers or code.
- **Mobile counts.** Every change must work at 390, 768, 1024 and 1440px.
- **Accessible by default.** Use real buttons, links and labels, with visible focus and AA contrast.

## Where things live

| Path | Purpose |
|---|---|
| `src/styles/tokens.css` | The only place that defines design values |
| `src/layouts/` | Page templates |
| `src/components/ui/` | Small reusable parts, such as Button and Badge |
| `src/components/navigation/` | Top bar, menus and "On this page" |
| `src/components/sections/` | Large marketing page sections |
| `src/components/docs/` | Starlight overrides |
| `src/data/` | Menus and structured page content |
| `src/pages/` | Routes only |
| `src/generated/` | Generated files. Don't edit them by hand. |
| `design/` | Design references. Never ship these files. |

## Rules

### Tokens

- Don't use raw colors outside `tokens.css`.
- Use a token for font families, font sizes, spacing and radius.
- Add a token only with design approval.

### Yellow

Use `--dy-accent` only for the logo, the second hero line, primary buttons, the Security and Performance headings, the active menu item, Hint labels and borders, and small code details.

Never use it as a section background.

### Type

- Use Manrope for text and Fira Mono for code.
- Don't add another font.

### Components

- Change a component through its props, such as `variant`.
- Don't override a shared component's styles from a page.
- If two places need the same thing, make one component.
- A new shared component must appear on `/styleguide`.

### Pages and content

- Every page uses an approved layout.
- Pages put sections together. They don't contain their own CSS.
- Menu items live in `src/data/`, or come from the docs sync.
- Features that don't exist yet can appear in the menu with a "Soon" badge, but must not link to a page.

## Shared components

Use these before you build anything new. Keep this table up to date.

| Component | Use it for |
|---|---|
| Button | Page actions, with primary and secondary variants |
| Input | Labeled form fields |
| Badge | Short status labels, such as "Soon" |
| Card | Grouped content on a raised surface |
| CodeBlock | Code with a file name and copy button |
| Hint | Notes and warnings in docs |
| TopBar | The floating bar on every page |
| Sidebar | Docs navigation on desktop |
| MobileMenu | Full-screen navigation on mobile |
| OnThisPage | Links to headings on a docs page |
| Icon | Line icons from the design, in the text color |
| Logo | The Dygo mark and word, linking home |
| SearchField | The search control in the top bar and MobileMenu |

## Changing the design

New patterns start on the design canvas. Don't add one to the code until Dylan approves it.

1. Agree the change on the design canvas first.
2. Add the approved design to `design/`.
3. Update the token or component, not a single page.
4. Update `/styleguide`.
5. Review the screenshot differences in your pull request.
6. Update the screenshot baselines only for intended changes.

Don't change a baseline just to make a check pass.

## Before you open a pull request

- [ ] I reused existing tokens and components
- [ ] I listed each component I reused, changed or added
- [ ] I added before and after screenshots for visual changes
- [ ] Any new pattern was approved on the design canvas
- [ ] I didn't add raw colors or one-off styles
- [ ] I checked mobile and desktop
- [ ] Keyboard use and focus still work
- [ ] All claims come from the Dygo repo
- [ ] All required checks pass
