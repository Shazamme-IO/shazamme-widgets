# Flip Cards — Duda setup

Karen's widget for Merrifield Consultants (Shazamme-OS issue #125), the general flip-card widget that replaces Flippy Box for new work. Its JS is the bundle built from `index.ts` (with `settings.ts`, `render.ts` and `interactions.ts`); Duda keeps only the template, the CSS and a loader stub.

## Paste into Widget Builder

| Duda box | File |
|---|---|
| HTML | `content.hbs` |
| JavaScript | `duda-paste-jsdelivr.js` (switch to `duda-paste.js` once the CloudFront deploy is done) |
| CSS | `duda-css.reference.css` |
| Desktop CSS | `duda-css.desktop.reference.css` |
| Mobile CSS | `duda-css.mobile.reference.css` |
| Duda AI, Content Editor part 1 | `duda-ai-prompt-1-content.md` |
| Duda AI, Content Editor part 2 | `duda-ai-prompt-2-layout.md` |
| Duda AI, Design Editor | `duda-ai-prompt-3-design.md` |

The CSS stays in Duda, not in the bundle: it sizes the cards before the script runs, and the Design Editor writes to the same selectors. The widget needs no Shazamme SDK: `index.ts` never imports `core/sdk`, the stub does not load or wait for it, and the empty `.no-sdk` file tells the stub test not to expect an SDK pin. `settings.json` lists every key; `settings.test.ts` keeps it, `settings.ts` and the Duda AI prompts in step.

Per-breakpoint settings are written by the script as CSS variables on `.shm-flip-cards`; the shared CSS picks them with media queries (desktop 1024px and up, tablet 768 to 1023, mobile 767 and under).

## Shipping a change

1. Edit the TypeScript, then `npm run check` and commit `dist/flip-cards`.
2. Set `TAG` in `duda-paste-jsdelivr.js` to the next free `v0.1.x`. After the merge, tag the merge commit with it and check the jsDelivr URL returns 200 with the new code.
3. Repaste the stub only when `TAG` changed. Sites don't need republishing.
