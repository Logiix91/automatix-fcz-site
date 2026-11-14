(function () {
  // Get this from Cloudflare dashboard -> Analytics & Logs -> Web Analytics ->
  // Manage site -> JavaScript snippet (manual setup). Leave the placeholder in
  // until then; no beacon loads without a real token.
  const CF_BEACON_TOKEN = "42fe14da73b64ad49593191361515c29";
  const CONSENT_KEY = "frops-consent";
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
    banner.className = "consent on-field";
    banner.style.transform = "translateY(100%)";
    banner.style.opacity = "0";
    banner.style.transition = reduceMotion ? "none" : "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s cubic-bezier(0.16,1,0.3,1)";
    banner.innerHTML =
      '<div class="container consent__inner">' +
        '<p data-i18n="consent.message"></p>' +
        '<div class="consent__actions">' +
          '<a href="privacy.html#gdpr" data-i18n="consent.privacyLink"></a>' +
          '<button type="button" data-consent="reject" data-i18n="consent.reject" class="btn btn--quiet"></button>' +
          '<button type="button" data-consent="accept" data-i18n="consent.accept" class="btn btn--primary"></button>' +
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

  window.FROps = window.FROps || {};
  window.FROps.openConsentSettings = showBanner;

  document.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted") loadAnalytics();
    else if (stored !== "rejected") showBanner();
  });
})();
