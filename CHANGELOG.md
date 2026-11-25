# Changelog — TV Unlimit 0x

## 1.2.0
- Added **multi-chart layout unlock** (client-side): override the pane cap so you can open 2+ charts.
  Works in-session (each chart's data loads normally); the extension re-applies it every load.
  (The 2-chart layout itself is re-opened per session — the cap is re-raised automatically.)
- Drawings unlock unchanged (feature-toggle off via localStorage).
- Confirmed NOT liftable (server-side, verified): indicators-per-chart (server returns
  `study_error` beyond the plan limit), 1-second/custom intervals, deeper history, data feeds,
  volume footprint/tick data, server-side alerts, invite-only scripts, deep backtesting.


## 1.1.0
- Reworked mechanism: disable the `drawings_per_chart_limit` feature flag via
  `localStorage["forcefeaturetoggle.drawings_per_chart_limit"] = "false"` at `document_start`.
  This lifts BOTH the aggregate and per-chart limits and is read at draw time (timing-safe).
- Removed the experimental fetch/`/sizes` interception (the app captured native `fetch` before
  the patch, so it had no effect on the app's own requests).
- Added icons (16/32/48/128), pinned `key` for a stable extension id, minimal (empty) permissions.

## 1.0.x (experimental, superseded)
- Initial proofs: reverse-engineered the limit gate (`drawingsPerChartLimit`,
  `ensureDrawingsLimitAllowed`) and the server storage protocol
  (`charts-storage ... PUT/GET/DELETE /sources`, `/sizes`, `/chart-token`).
- Attempted `/sizes` response rewrite — worked for manual `fetch` calls but not for the app's
  internal (pre-captured) `fetch`.
