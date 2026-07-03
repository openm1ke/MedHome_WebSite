(() => {
  const METRIKA_COUNTER_ID = 110289623;
  const COOKIE_CONSENT_KEY = "medhome_cookie_consent";
  const COOKIE_CONSENT_VERSION = "2026-06-30";
  const COOKIE_CONSENT_ACCEPTED = "accepted";
  const COOKIE_CONSENT_DECLINED = "declined";
  let carouselIndex = 0;
  let carouselTimer;
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
      for (let j = 0; j < document.scripts.length; j++) {
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

    if (banner && consent !== COOKIE_CONSENT_ACCEPTED && consent !== COOKIE_CONSENT_DECLINED) {
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

    if (consent === COOKIE_CONSENT_ACCEPTED) {
      loadYandexMetrika();
    }
  };

  const initNavigation = () => {
    const header = document.querySelector("[data-header]");
    const navToggle = document.querySelector("[data-nav-toggle]");
    const primaryNav = document.querySelector("[data-nav]");

    const updateHeader = () => {
      if (!header) return;

      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    const setMenuOpen = (isOpen) => {
      if (!header || !navToggle) return;

      header.classList.toggle("is-menu-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    navToggle?.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isOpen);
    });

    primaryNav?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 721px)").matches) {
        setMenuOpen(false);
      }
    });
  };

  const initCarousel = () => {
    const carouselSlides = [...document.querySelectorAll("[data-carousel-slide]")];
    const carouselScreens = [...document.querySelectorAll(".carousel-screen")];
    const carouselDots = [...document.querySelectorAll("[data-carousel-dot]")];

    const setCarouselSlide = (index) => {
      carouselIndex = Number(index);

      carouselSlides.forEach((slide) => {
        slide.classList.toggle("is-active", slide.dataset.carouselSlide === String(carouselIndex));
      });

      carouselScreens.forEach((screen) => {
        screen.classList.toggle("is-active", screen.dataset.screen === String(carouselIndex));
      });

      carouselDots.forEach((dot) => {
        dot.classList.toggle("is-active", dot.dataset.carouselDot === String(carouselIndex));
      });
    };

    const startCarousel = () => {
      if (!carouselSlides.length) return;

      window.clearInterval(carouselTimer);
      carouselTimer = window.setInterval(() => {
        setCarouselSlide((carouselIndex + 1) % carouselSlides.length);
      }, 4800);
    };

    const moveCarousel = (direction) => {
      if (!carouselSlides.length) return;
      const nextIndex = (carouselIndex + direction + carouselSlides.length) % carouselSlides.length;
      setCarouselSlide(nextIndex);
      startCarousel();
    };

    if (!carouselSlides.length) return;

    carouselDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        setCarouselSlide(dot.dataset.carouselDot);
        startCarousel();
      });
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        moveCarousel(-1);
      }

      if (event.key === "ArrowRight") {
        moveCarousel(1);
      }
    });

    startCarousel();
  };

  const initLegalDocuments = () => {
    const nav = document.querySelector("[data-legal-nav]");
    const content = document.querySelector("[data-legal-content]");
    const documentCache = new Map();
    let documentsManifest;

    if (!nav || !content) return;

    const fromCodes = (codes) => String.fromCharCode(...codes);

    const getPrivateFields = () => ({
      operator_name: fromCodes([
        1064, 1084, 1099, 1088, 1077, 1074, 32, 1052, 1080, 1093, 1072, 1080, 1083, 32, 1070, 1088,
        1100, 1077, 1074, 1080, 1095,
      ]),
      operator_name_dative: fromCodes([
        1064, 1084, 1099, 1088, 1077, 1074, 1091, 32, 1052, 1080, 1093, 1072, 1080, 1083, 1091, 32,
        1070, 1088, 1100, 1077, 1074, 1080, 1095, 1091,
      ]),
      operator_tax_id: [503, 506, 897, 345].join(""),
    });

    const hydratePrivateFields = (markdown) =>
      Object.entries(getPrivateFields()).reduce(
        (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
        markdown
      );

    const escapeHtml = (value) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    const renderInline = (value) =>
      escapeHtml(value)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    const renderMarkdown = (markdown) => {
      const lines = markdown.split(/\r?\n/);
      const html = [];
      let paragraph = [];
      let list = [];

      const flushParagraph = () => {
        if (!paragraph.length) return;
        html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
        paragraph = [];
      };

      const flushList = () => {
        if (!list.length) return;
        html.push(`<ul>${list.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
        list = [];
      };

      lines.forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
          flushParagraph();
          flushList();
          return;
        }

        if (trimmed.startsWith("# ")) {
          flushParagraph();
          flushList();
          html.push(`<h1>${renderInline(trimmed.slice(2))}</h1>`);
          return;
        }

        if (trimmed.startsWith("## ")) {
          flushParagraph();
          flushList();
          html.push(`<h2>${renderInline(trimmed.slice(3))}</h2>`);
          return;
        }

        if (trimmed.startsWith("### ")) {
          flushParagraph();
          flushList();
          html.push(`<h3>${renderInline(trimmed.slice(4))}</h3>`);
          return;
        }

        if (trimmed.startsWith("- ")) {
          flushParagraph();
          list.push(trimmed.slice(2));
          return;
        }

        paragraph.push(trimmed);
      });

      flushParagraph();
      flushList();
      return html.join("");
    };

    const setActiveLink = (id) => {
      nav.querySelectorAll("a").forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    };

    const loadDocument = async (id) => {
      documentsManifest ??= await fetch("legal/documents.json").then((response) => response.json());
      const docs = documentsManifest;
      const doc = docs.find((item) => item.id === id) ?? docs[0];

      setActiveLink(doc.id);
      window.history.replaceState(null, "", `#${doc.id}`);

      content.classList.add("is-switching");

      const markdown =
        documentCache.get(doc.file) ??
        (await fetch(doc.file)
          .then((response) => response.text())
          .then((text) => {
            documentCache.set(doc.file, text);
            return text;
          }));

      await new Promise((resolve) => window.setTimeout(resolve, 180));
      content.innerHTML = renderMarkdown(hydratePrivateFields(markdown));
      requestAnimationFrame(() => content.classList.remove("is-switching"));
    };

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      event.preventDefault();
      loadDocument(link.getAttribute("href").replace("#", ""));
    });

    loadDocument(window.location.hash.replace("#", "") || "terms");
  };

  const initPage = () => {
    initNavigation();
    initCarousel();
    initCookieConsent();
    initLegalDocuments();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage, { once: true });
  } else {
    initPage();
  }
})();
