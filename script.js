(() => {
const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const primaryNav = document.querySelector("[data-nav]");
const carouselSlides = [...document.querySelectorAll("[data-carousel-slide]")];
const carouselScreens = [...document.querySelectorAll(".carousel-screen")];
const carouselDots = [...document.querySelectorAll("[data-carousel-dot]")];
let carouselIndex = 0;
let carouselTimer;

const updateHeader = () => {
  if (!header) return;

  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const setMenuOpen = (isOpen) => {
  if (!header || !navToggle) return;

  header.classList.toggle("is-menu-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
};

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

if (carouselSlides.length) {
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
}
})();
