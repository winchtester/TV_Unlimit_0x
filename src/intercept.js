/*
 * TV Drawing Unlock — disables the client-side drawings limit.
 *
 * How it works (reverse-engineered from the production bundles):
 *   TradingView gates drawing creation with:
 *       drawingsPerChartLimit()  ->  isFeatureEnabled("drawings_per_chart_limit")
 *                                     ? getConfig(DRAWINGS_ON_CHART).limit  (30 on free)
 *                                     : null
 *   and ensureDrawingsLimitAllowed() blocks creation when the counter would exceed it.
 *
 *   isFeatureEnabled(name) reads a *forced* override from localStorage first:
 *       localStorage["forcefeaturetoggle." + name] === "false"  =>  feature OFF
 *   (exactly what the app's own FeatureToggle.disableFeature(name) writes).
 *
 *   So by writing one localStorage key we make isFeatureEnabled("drawings_per_chart_limit")
 *   return false -> drawingsPerChartLimit() returns null -> the gate always passes.
 *   This removes BOTH the aggregate limit and the per-chart limit, and it is read at
 *   draw time, so it works no matter how/when the app captured fetch. The server still
 *   stores every drawing (it has no count limit — only an 80 MB byte limit).
 *
 * localStorage is shared per-origin, so this works from a normal (isolated) content script.
 *
 * Disable this extension's effect at runtime (from the page console):
 *   localStorage.removeItem('forcefeaturetoggle.drawings_per_chart_limit'); location.reload();
 */
(() => {
  "use strict";
  const FLAG = "forcefeaturetoggle.drawings_per_chart_limit";
  const DISABLED = "tvUnlockDisabled";

  function apply() {
    try {
      if (localStorage.getItem(DISABLED) === "1") {
        // user turned it off: restore default (feature becomes enabled/protected again)
        if (localStorage.getItem(FLAG) === "false") localStorage.removeItem(FLAG);
        return;
      }
      if (localStorage.getItem(FLAG) !== "false") localStorage.setItem(FLAG, "false");
    } catch (_) {}
  }

  // document_start: set it immediately, before the app reads feature flags.
  apply();

  // Re-assert briefly in case the app rewrites defaults during init (cheap, then stop).
  let n = 0;
  const timer = setInterval(() => {
    apply();
    if (++n >= 40) clearInterval(timer); // ~20s
  }, 500);

  try { window.addEventListener("DOMContentLoaded", apply); } catch (_) {}

  try { console.log("[TV Drawing Unlock] active — drawings limit disabled"); } catch (_) {}
})();
