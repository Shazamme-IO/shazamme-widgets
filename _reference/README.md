# Reference intake — drop the 3 production widgets here

Put each existing widget's **three source parts** into its own folder. Rename
`widget-1/2/3` to the real widget name if you know it (e.g. `job-results`).

```
_reference/
  <widget-name>/
    widget.js       <- the JS from Duda's "JS" box (the full controller)
    styles.css      <- the CSS from Duda's "CSS" box (base + any device variants)
    template.html   <- the HTML/Handlebars from Duda's "HTML" box
    settings.json   <- OPTIONAL: export of the settings-panel fields, if handy
```

Notes:
- Paste the **raw Duda box contents** — unwrapped, exactly as they run in Duda.
  Don't pre-clean anything; the blocking/legacy code is what I need to see.
- If a widget has multiple CSS device variants (desktop/tablet/mobile), drop them
  as `styles.css`, `styles.tablet.css`, `styles.mobile.css`.
- Once the 3 are in, tell me and I'll reverse-engineer them: map the shared
  fetch/cache/pub-sub layer, flag every blocking/slow pattern, and rebuild ONE
  clean widget on the shared `core/`.

This folder is reference only — it never ships. It stays as the rollback baseline.
