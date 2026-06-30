const METRIKA_COUNTER_ID = 110289623;
const COOKIE_CONSENT_KEY = "medhome_cookie_consent";
const COOKIE_CONSENT_ACCEPTED = "accepted";
const COOKIE_CONSENT_DECLINED = "declined";

const getCookieConsent = () => {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return null;
  }
};

const setCookieConsent = (value) => {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    return;
  }
};

const loadYandexMetrika = () => {
  if (window.ym) return;

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
    ecommerce: "dataLayer",
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  });
};

const initCookieConsent = () => {
  const banner = document.querySelector("[data-cookie-consent]");
  const acceptButton = document.querySelector("[data-cookie-accept]");
  const declineButton = document.querySelector("[data-cookie-decline]");
  const consent = getCookieConsent();

  if (consent === COOKIE_CONSENT_ACCEPTED) {
    loadYandexMetrika();
    return;
  }

  if (!banner || consent === COOKIE_CONSENT_DECLINED) return;

  banner.hidden = false;

  acceptButton?.addEventListener("click", () => {
    setCookieConsent(COOKIE_CONSENT_ACCEPTED);
    banner.hidden = true;
    loadYandexMetrika();
  });

  declineButton?.addEventListener("click", () => {
    setCookieConsent(COOKIE_CONSENT_DECLINED);
    banner.hidden = true;
  });
};

initCookieConsent();
