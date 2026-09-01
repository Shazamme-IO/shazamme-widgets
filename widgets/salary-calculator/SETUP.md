# Salary Calculator — externalize JS + US locale + editable Hours/Day

This ports the salary-calculator's **JS** to the CDN (like the other widgets) and adds
two features Nicole J requested. **HTML and CSS stay in the Duda tabs** (updated in
place) — only the JS moves external.

## What changed (and why it can't break existing AUS/UK calculators)

1. **US locale** — the `locdropdown` parameter gains a `us` option.
   - Currency: US shows `$`. Implemented by flipping each currency block from
     "is it AUS?" to "is it UK?" — so **UK still shows £, AUS still shows $ (unchanged),
     and US now shows $**. (`content.hbs`, 52 blocks.)
   - Calculation: US reuses the **UK code path** (`else if(locations=="uk" || locations=="us")`)
     with a US-specific super/retirement default. The AUS branch is **byte-identical** to today.
   - Super → Retirement/401(k): handled by the per-site super **labels** (see step 4).

2. **Editable "Hours per Day"** — a new field next to the hourly rate (both layouts,
   desktop + mobile), default = the site's configured daily hours (usually 8). Changing it
   rescales daily/fortnightly/monthly/yearly **proportionally**, keeping the configured
   working-day counts. At the default value the numbers are **identical to today**, so the
   feature is a no-op until a user edits the field. (`legacy.js`, one additive block.)

The `legacy.js` diff vs the original Duda JS is **only** these additive edits — verified by diff.

## Deploy order (MUST deploy before pasting the JS stub, or the stub 404s)

1. **Deploy the bundle to the CDN** (Rick, or already done — see PR notes):
   ```
   cd ~/Code/shazamme-widgets
   node scripts/deploy.mjs salary-calculator --run
   ```
   Additive/zero-risk: nothing references the new URL until you paste the stub.

2. **Duda Widget Builder — add the new parameters** (Content settings):
   - `locdropdown`: add option **value `us`** (label e.g. "US").
   - Add text/number params:
     - `hoursperdaytxt` — label for the new field. Default: `Hours per Day`
     - `supervalus` — US layout1 retirement default %. Default: `0` (or your 401(k) match, e.g. `6`)
     - `modernsupervalus` — US modern-layout retirement default %. Default: same as above.

3. **Paste the updated HTML** (`content.hbs`) into the **Content HTML** tab.

4. **Paste the updated JS** (`duda-paste.js`) into the **JavaScript** tab, replacing the old JS.

5. **Add the CSS** for the new field to the **CSS** tab (append):
   ```css
   .clshoursperday{ display:flex; align-items:center; gap:10px; margin:8px 0; }
   .clshoursperdaylabel{ flex:0 0 auto; font-weight:500; }
   .clshoursperdayinput{ flex:1 1 auto; }
   .clshoursperdayinput input{ width:100%; }
   ```

6. **For US sites — relabel super as Retirement/401(k):** set the site's existing super
   labels (`supertxt`, `superannpercentage`, and the "Super" column text) to
   `Retirement (%)` / `401(k)`. These are per-site config, so AUS/UK sites are unaffected.

7. **Publish the widget** from the sandbox (not a full site republish).

## Test checklist (Nicole)

- [ ] **AUS site unchanged**: same numbers as before at default hours.
- [ ] **UK site unchanged**: £ symbol, same numbers.
- [ ] **US site**: `$` everywhere; retirement label shows; numbers compute.
- [ ] **Hours/Day = 8**: identical to old results.
- [ ] **Hours/Day changed (e.g. 7.5)**: daily/fortnightly/monthly/yearly all rescale.
- [ ] Both layouts (classic tabbed + modern) and both desktop + mobile.

## Known follow-up (flagged, not done — would need config work)

The **classic (layout1) period row labels** ("Fortnightly", "Hourly", etc.) and the
"Base Salary / Super / Total Salary" headers are **hard-coded** in the template, so they
don't switch wording per locale (e.g. US "Bi-weekly"). The **modern layout** already uses
config labels. If Nicole needs US-specific wording in the classic layout, making those
labels config-driven is a small follow-up — flagged to avoid a risky broad template edit now.
