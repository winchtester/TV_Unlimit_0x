# TV Unlimit 0x — TradingView Drawing Unlock

> **Prepared by the team — https://t.me/Obsession_0x**

A local Chrome (Manifest V3) extension that **disables TradingView's client-side drawings limit**
(both the aggregate limit across symbols and the per-chart limit), seamlessly. You keep drawing
with the native tools; drawings still save to the server as usual. Nothing is fabricated on the
server and nothing is stored locally by the extension.

- Extension ID (pinned via manifest `key`): `kedobdpihecafnboadhefhdigkhmhfcm`
- Version: `1.1.0`
- Permissions: **none** (a single content script; no host permissions, no storage API).

## How it works

TradingView gates drawing creation with:

```
drawingsPerChartLimit() -> isFeatureEnabled("drawings_per_chart_limit")
                           ? getConfig(DRAWINGS_ON_CHART).limit   // 30 on free
                           : null
ensureDrawingsLimitAllowed(): if drawingsPerChartLimit() === null -> allowed (always)
```

`isFeatureEnabled(name)` honours a forced override in `localStorage`:

```
localStorage["forcefeaturetoggle." + name] === "false"  =>  feature OFF
```

(exactly the value the app's own `FeatureToggle.disableFeature(name)` writes).

The content script sets one key at `document_start`:

```
localStorage["forcefeaturetoggle.drawings_per_chart_limit"] = "false"
```

→ `isFeatureEnabled(...) === false` → `drawingsPerChartLimit() === null` → the gate passes for
every symbol and every count. `localStorage` is per-origin (shared with the page) and read at draw
time, so it works regardless of how/when the app captured `fetch`. The server still stores every
drawing — its only limit is 80 MB of bytes.

## Install

### Unpacked (development / personal use)
1. `chrome://extensions` → enable **Developer mode**.
2. **Load unpacked** → select this repository folder (where `manifest.json` lives).
3. Hard-refresh the chart (Ctrl+Shift+R).

### Packaged ZIP / Web Store upload
```bash
./build.sh      # -> dist/TV_Unlimit_0x-<version>.zip  (manifest.json at ZIP root)
```

## Verify
Console on the chart (F12):
```js
window.TradingView.isFeatureEnabled('drawings_per_chart_limit')   // -> false
```
The content script logs: `[TV Drawing Unlock] active — drawings limit disabled`.

## Disable / restore the limit
From the page console:
```js
localStorage.removeItem('forcefeaturetoggle.drawings_per_chart_limit'); location.reload();
```

## Notes / boundaries
- Lifts the limit entirely (aggregate + per-chart). Server-side storage is unaffected.
- Bypassing a product limit is on the user and may violate TradingView's ToS. Not a security
  vulnerability (no bug-bounty relevance).
- Branded Google Chrome 158+ no longer honours `--load-extension` from the CLI; install via
  Load unpacked, or use Chrome for Testing / Chromium (which do honour it).

## Credits
Prepared by the team — **https://t.me/Obsession_0x**

## License
MIT — see `LICENSE`.
