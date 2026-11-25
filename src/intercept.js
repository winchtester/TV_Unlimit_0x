/*
 * TV Unlimit — MAIN-world script.
 *
 * Lifts the client-side limits that are NOT enforced by the server:
 *   1) Drawings: set localStorage force-override so isFeatureEnabled("drawings_per_chart_limit")
 *      is false -> drawingsPerChartLimit() null -> unlimited drawings (server stores freely).
 *   2) Multi-chart layout (panes): the pane cap (_planChartsLimit) is a pure client gate.
 *      Overriding it lets you switch to 2+ charts (each chart's data loads normally).
 *
 * NOTE: indicators-per-chart is NOT lifted — the server refuses to compute studies over the
 * plan limit (returns study_error), so a client bypass would only produce broken panes.
 * 1-second intervals / deeper history / feeds / footprint / server alerts remain server-side.
 *
 * Re-applied continuously because the chart collection / model can be recreated on
 * navigation/symbol change and after reloads.
 *
 * Disable for this page:  localStorage.setItem('tvUnlockDisabled','1'); location.reload();
 * Re-enable:              localStorage.removeItem('tvUnlockDisabled'); location.reload();
 */
(() => {
  "use strict";
  const G = window;
  if (G.__TV_UNLIMIT__) return;
  G.__TV_UNLIMIT__ = true;

  const OFF = "tvUnlockDisabled";
  const DRAW_FLAG = "forcefeaturetoggle.drawings_per_chart_limit";

  function disabled() {
    try { return localStorage.getItem(OFF) === "1"; } catch { return false; }
  }

  function applyDrawingFlag() {
    try {
      if (disabled()) {
        if (localStorage.getItem(DRAW_FLAG) === "false") localStorage.removeItem(DRAW_FLAG);
        return;
      }
      if (localStorage.getItem(DRAW_FLAG) !== "false") localStorage.setItem(DRAW_FLAG, "false");
    } catch {}
  }

  function patchChartLimits() {
    if (disabled()) return;
    try {
      const A = G.TradingViewApi;
      if (!A) return;
      const C = A._chartWidgetCollection;
      if (C) {
        C._planChartsLimit = () => 50;
        C._isChartsLimitApplied = () => false;
        C._hasChartsAbovePlanLimit = () => false;
      }
    } catch {}
  }

  function tick() {
    applyDrawingFlag();
    patchChartLimits();
  }

  tick();

  // Keep it applied while the app spins up and across chart re-creations.
  let n = 0;
  const timer = setInterval(() => {
    tick();
    if (++n >= 360) clearInterval(timer); // ~3 minutes
  }, 500);

  try { addEventListener("DOMContentLoaded", tick); } catch {}

  try {
    console.log("[TV Unlimit] active — drawings + multi-chart limits lifted (indicators stay server-limited)");
  } catch {}
})();
