/**
 * OneScore Everywhere — universal embed (v1)
 * Drop into ANY page (OneSite, OneApp, OneVoice pages, GHL funnels, external sites):
 *
 *   <div class="onescore-widget" data-handle="leefrazier" data-style="card" data-theme="light"></div>
 *   <script src="https://frazier56.github.io/onescore-preview/onescore-embed.js" async></script>
 *
 * Options (data attributes):
 *   data-handle  required — the user's OneScore handle
 *   data-style   "card" (default) | "badge" (compact pill) | "inline" (text-size)
 *   data-theme   "light" (default) | "dark"
 *   data-score / data-tier / data-name — TEMPORARY override until the public
 *     score API ships; when the API is live the widget fetches by handle and
 *     these are ignored. Score data is served by us — it cannot be faked
 *     without faking the whole embed (and the click-through exposes that).
 *
 * The widget always links to the user's public score page — every embed
 * is a door back into OneScore.
 */
(function () {
  var API_BASE = "https://onescore.onesocial.ai"; // future public score API + pages
  var TEAL = "#14b8a6", TEAL_D = "#0d9488";

  function tierOf(score) {
    return score >= 80 ? "ELITE" : score >= 60 ? "PRO" : score >= 40 ? "RISING" : "STARTER";
  }

  function donutSVG(score, size) {
    var r = 42, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(100, score)) / 100;
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" style="transform:rotate(-90deg)">' +
      '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="rgba(128,128,128,.18)" stroke-width="9"/>' +
      '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + TEAL + '" stroke-width="9" stroke-linecap="round" ' +
      'stroke-dasharray="' + (c * pct) + ' ' + (c * (1 - pct)) + '"/>' +
      "</svg>"
    );
  }

  function render(el, data) {
    var style = el.getAttribute("data-style") || "card";
    var theme = el.getAttribute("data-theme") || "light";
    var ink = theme === "dark" ? "#F9FAFB" : "#111827";
    var sub = theme === "dark" ? "#9CA3AF" : "#6B7280";
    var bg = theme === "dark" ? "#111827" : "#FFFFFF";
    var border = theme === "dark" ? "#374151" : "#E5E7EB";
    var link = API_BASE + "/" + encodeURIComponent(data.handle);
    var font = "font-family:Inter,system-ui,-apple-system,sans-serif;";

    var html;
    if (style === "badge") {
      html =
        '<a href="' + link + '" target="_blank" rel="noopener" style="' + font +
        'display:inline-flex;align-items:center;gap:8px;background:' + bg + ";border:1px solid " + border +
        ';border-radius:999px;padding:6px 14px 6px 8px;text-decoration:none;box-shadow:0 1px 3px rgba(0,0,0,.08)">' +
        '<span style="position:relative;display:inline-flex;width:34px;height:34px">' + donutSVG(data.score, 34) +
        '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:' + ink + '">' + data.score + "</span></span>" +
        '<span style="font-size:13px;font-weight:700;color:' + ink + '">OneScore</span>' +
        '<span style="font-size:11px;font-weight:700;color:' + TEAL_D + '">' + tierOf(data.score) + "</span></a>";
    } else if (style === "inline") {
      html =
        '<a href="' + link + '" target="_blank" rel="noopener" style="' + font +
        'font-size:inherit;font-weight:700;color:' + TEAL_D + ';text-decoration:none">OneScore ' + data.score + " ★</a>";
    } else {
      html =
        '<a href="' + link + '" target="_blank" rel="noopener" style="' + font +
        "display:inline-flex;align-items:center;gap:16px;background:" + bg + ";border:1px solid " + border +
        ';border-radius:16px;padding:16px 20px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.08);max-width:320px">' +
        '<span style="position:relative;display:inline-flex;width:72px;height:72px;flex-shrink:0">' + donutSVG(data.score, 72) +
        '<span style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
        '<span style="font-size:22px;font-weight:800;color:' + ink + ';line-height:1">' + data.score + "</span></span></span>" +
        '<span style="min-width:0"><span style="display:block;font-size:15px;font-weight:800;color:' + ink + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        (data.name || "@" + data.handle) + "</span>" +
        '<span style="display:block;font-size:11px;font-weight:700;color:' + TEAL_D + ';letter-spacing:.06em">' + tierOf(data.score) + " · VERIFIED ONESCORE</span>" +
        '<span style="display:block;font-size:11px;color:' + sub + ';margin-top:2px">One<b style="color:' + TEAL + '">Score</b> · professional & social credibility</span>' +
        "</span></a>";
    }
    el.innerHTML = html;
  }

  function hydrate(el) {
    var handle = el.getAttribute("data-handle") || "me";
    var fallback = {
      handle: handle,
      score: parseInt(el.getAttribute("data-score") || "0", 10),
      name: el.getAttribute("data-name") || "",
    };
    // Public score API (future): GET /api/score/:handle → { score, tier, name }
    fetch(API_BASE + "/api/score/" + encodeURIComponent(handle))
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { render(el, { handle: handle, score: d.score, name: d.name }); })
      .catch(function () { if (fallback.score > 0) render(el, fallback); });
  }

  function init() {
    var els = document.querySelectorAll(".onescore-widget:not([data-osw-done])");
    for (var i = 0; i < els.length; i++) { els[i].setAttribute("data-osw-done", "1"); hydrate(els[i]); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
