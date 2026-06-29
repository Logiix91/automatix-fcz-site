(function () {
  // Get this from Cloudflare dashboard -> Analytics & Logs -> Web Analytics ->
  // Manage site -> JavaScript snippet (manual setup). Leave the placeholder in
  // until then; no beacon loads without a real token.
  const CF_BEACON_TOKEN = "42fe14da73b64ad49593191361515c29";
  const CONSENT_KEY = "automatixfcz-consent";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loadAnalytics() {
    if (!CF_BEACON_TOKEN || CF_BEACON_TOKEN.indexOf("REPLACE_") === 0) return;
    if (document.querySelector("script[data-cf-beacon]")) return;
    const s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_BEACON_TOKEN }));
    document.head.appendChild(s);
  }

  function syncI18n() {
    const lang = document.documentElement.getAttribute("lang") || "nl";
    if (typeof applyLanguage === "function") applyLanguage(lang);
  }

  function removeBanner() {
    const el = document.getElementById("cookieConsentBanner");
    if (el) el.remove();
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    removeBanner();
    if (value === "accepted") loadAnalytics();
  }

  function showBanner() {
    if (document.getElementById("cookieConsentBanner")) return;
    const banner = document.createElement("div");
    banner.id = "cookieConsentBanner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.className = "fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-navy-950/95 backdrop-blur-md px-6 py-5 lg:px-8";
    banner.style.transform = "translateY(100%)";
    banner.style.opacity = "0";
    banner.style.transition = reduceMotion ? "none" : "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease";
    banner.innerHTML =
      '<div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">' +
        '<p data-i18n="consent.message" class="text-sm text-slate-300 flex-1"></p>' +
        '<div class="flex items-center gap-3 shrink-0">' +
          '<a href="privacy.html#gdpr" data-i18n="consent.privacyLink" class="text-sm text-slate-400 hover:text-white underline whitespace-nowrap"></a>' +
          '<button type="button" data-consent="reject" data-i18n="consent.reject" class="rounded-full border border-white/20 text-white text-sm font-semibold px-4 py-2 hover:bg-white/5 transition whitespace-nowrap"></button>' +
          '<button type="button" data-consent="accept" data-i18n="consent.accept" class="rounded-full bg-ember-500 hover:bg-ember-600 text-navy-950 text-sm font-semibold px-4 py-2 transition whitespace-nowrap"></button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(banner);
    syncI18n();
    banner.querySelector('[data-consent="accept"]').addEventListener("click", () => setConsent("accepted"));
    banner.querySelector('[data-consent="reject"]').addEventListener("click", () => setConsent("rejected"));
    requestAnimationFrame(() => {
      banner.style.transform = "translateY(0)";
      banner.style.opacity = "1";
    });
  }

  window.Automatix = window.Automatix || {};
  window.Automatix.openConsentSettings = showBanner;

  document.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted") loadAnalytics();
    else if (stored !== "rejected") showBanner();
  });
})();
