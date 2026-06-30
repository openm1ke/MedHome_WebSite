const METRIKA_COUNTER_ID = 110289623;
const COOKIE_CONSENT_KEY = "medhome_cookie_consent";
const COOKIE_CONSENT_VERSION = "2026-06-30";
const COOKIE_CONSENT_ACCEPTED = "accepted";
const COOKIE_CONSENT_DECLINED = "declined";
let metrikaLoaded = false;

const getCookieConsent = () => {
  try {
    const savedConsent = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) return null;

    if (savedConsent === COOKIE_CONSENT_ACCEPTED || savedConsent === COOKIE_CONSENT_DECLINED) {
      return {
        value: savedConsent,
        version: null,
        updatedAt: null,
      };
    }

    return JSON.parse(savedConsent);
  } catch {
    return null;
  }
};

const setCookieConsent = (value) => {
  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        value,
        version: COOKIE_CONSENT_VERSION,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    return;
  }
};

const loadYandexMetrika = () => {
  if (metrikaLoaded || window.ym) {
    metrikaLoaded = true;
    return;
  }

  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    for (var j = 0; j < document.scripts.length; j++) {
      if (document.scripts[j].src === r) {
        return;
      }
    }
    (k = e.createElement(t)), (a = e.getElementsByTagName(t)[0]), (k.async = 1), (k.src = r), a.parentNode.insertBefore(k, a);
  })(window, document, "script", `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_COUNTER_ID}`, "ym");

  window.ym(METRIKA_COUNTER_ID, "init", {
    ssr: true,
    webvisor: true,
    clickmap: true,
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });

  metrikaLoaded = true;
};

const initCookieConsent = () => {
  const banner = document.querySelector("[data-cookie-consent]");
  const acceptButton = document.querySelector("[data-cookie-accept]");
  const declineButton = document.querySelector("[data-cookie-decline]");
  const settingsButtons = [...document.querySelectorAll("[data-cookie-settings]")];
  let consent = getCookieConsent()?.value ?? null;

  const showBanner = () => {
    if (banner) banner.hidden = false;
  };

  const hideBanner = () => {
    if (banner) banner.hidden = true;
  };

  if (consent === COOKIE_CONSENT_ACCEPTED) {
    loadYandexMetrika();
  } else if (banner && consent !== COOKIE_CONSENT_DECLINED) {
    showBanner();
  }

  settingsButtons.forEach((button) => {
    button.addEventListener("click", showBanner);
  });

  acceptButton?.addEventListener("click", () => {
    setCookieConsent(COOKIE_CONSENT_ACCEPTED);
    consent = COOKIE_CONSENT_ACCEPTED;
    hideBanner();
    loadYandexMetrika();
  });

  declineButton?.addEventListener("click", () => {
    const shouldReload = consent === COOKIE_CONSENT_ACCEPTED && metrikaLoaded;
    setCookieConsent(COOKIE_CONSENT_DECLINED);
    consent = COOKIE_CONSENT_DECLINED;
    hideBanner();

    if (shouldReload) {
      window.location.reload();
    }
  });
};

initCookieConsent();
