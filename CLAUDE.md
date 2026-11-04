# Dygo website

Before changing anything under `src/`, read `DESIGN.md` and follow it. `PLAN.md` holds the rebuild plan. Work on branch `rebuild`.

- Run `npm run check`, `npm run lint` and `npm run build` before you finish.
- Run `npm run test:visual` for UI changes.
- Never update visual baselines to make a test pass unless the design change was approved.
- Reuse the components listed in `DESIGN.md`. If a design needs a new pattern, stop and ask Dylan to approve it on the design canvas first.
- Never push to `main` unless Dylan approves that push.
