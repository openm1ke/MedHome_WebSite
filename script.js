const header = document.querySelector("[data-header]");
const carouselSlides = [...document.querySelectorAll("[data-carousel-slide]")];
const carouselScreens = [...document.querySelectorAll(".carousel-screen")];
const carouselDots = [...document.querySelectorAll("[data-carousel-dot]")];
let carouselIndex = 0;
let carouselTimer;

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

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
