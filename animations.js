(() => {
  "use strict";

  const initAnimations = () => {
    if (!window.gsap) return;

    const hero = document.querySelector(".hero");
    const heroTitle = document.getElementById("hero-title");
    if (!hero || !heroTitle) return;

    const originalTitleHTML = heroTitle.innerHTML;
    const phone = hero.querySelector(".phone-android");
    const cards = [...hero.querySelectorAll(".float-card")];
    const copySequence = [
      hero.querySelector(".hero__lead"),
      hero.querySelector(".hero__actions .button"),
      hero.querySelector(".hero__stores"),
      hero.querySelector(".hero__trust"),
    ].filter(Boolean);

    let introPlayed = false;

    /* Заголовок: оборачиваем существующие визуальные строки в блоки,
       без разбиения на буквы. Разбиение только по обычным пробелам,
       чтобы не разорвать неразрывный пробел в «за вас». */
    const splitTitleLines = () => {
      const words = heroTitle.textContent.split(" ");
      heroTitle.textContent = "";
      const wordSpans = words.map((word) => {
        const span = document.createElement("span");
        span.style.display = "inline-block";
        span.textContent = word;
        heroTitle.appendChild(span);
        heroTitle.appendChild(document.createTextNode(" "));
        return span;
      });

      const grouped = [];
      let lastTop = null;
      wordSpans.forEach((span) => {
        if (span.offsetTop !== lastTop) {
          grouped.push([]);
          lastTop = span.offsetTop;
        }
        grouped[grouped.length - 1].push(span.textContent);
      });

      heroTitle.textContent = "";
      return grouped.map((lineWords, index) => {
        if (index) heroTitle.appendChild(document.createTextNode(" "));
        const line = document.createElement("span");
        line.style.display = "block";
        line.textContent = lineWords.join(" ");
        heroTitle.appendChild(line);
        return line;
      });
    };

    const restoreTitle = () => {
      heroTitle.innerHTML = originalTitleHTML;
    };

    const initHeroIntro = (lines) => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          introPlayed = true;
        },
      });

      tl.from(lines, { y: 22, autoAlpha: 0, duration: 0.55, stagger: 0.09 }, 0)
        .from(copySequence, { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 0.22);

      if (phone) {
        tl.from(phone, { y: 30, autoAlpha: 0, duration: 0.7 }, 0.15);
      }

      if (cards.length) {
        tl.from(cards, { y: 12, scale: 0.96, autoAlpha: 0, duration: 0.4, stagger: 0.1 }, 0.58);
      }

      return tl;
    };

    /* Медленное «дыхание» карточек: y ≤ 5px, rotation ≤ 0.7deg,
       разные фазы. Телефон неподвижен. */
    const initHeroCardFloat = () => {
      cards.forEach((card, index) => {
        gsap.to(card, {
          y: index % 2 ? 4 : -4,
          rotation: index % 2 ? -0.5 : 0.5,
          duration: 4.5 + index * 0.9,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: (introPlayed ? 0.2 : 1.3) + index * 0.7,
        });
      });
    };

    /* Реакция карточек на указатель: только ось X (float занимает Y),
       смещение ≤ 4px, мягкий возврат при уходе курсора. */
    const initHeroPointerEffect = () => {
      const visual = hero.querySelector(".hero__visual");
      if (!visual || !cards.length) return () => {};

      const strengths = [4, -3, 3];
      const setters = cards.map((card) =>
        gsap.quickTo(card, "x", { duration: 0.7, ease: "power3.out" })
      );

      const onMove = (event) => {
        const rect = visual.getBoundingClientRect();
        const nx = gsap.utils.clamp(-1, 1, ((event.clientX - rect.left) / rect.width - 0.5) * 2);
        setters.forEach((set, i) => set(nx * (strengths[i] ?? 3)));
      };

      const onLeave = () => setters.forEach((set) => set(0));

      visual.addEventListener("pointermove", onMove);
      visual.addEventListener("pointerleave", onLeave);

      return () => {
        visual.removeEventListener("pointermove", onMove);
        visual.removeEventListener("pointerleave", onLeave);
        onLeave();
      };
    };

    /* Reduced motion: без intro, float и parallax — контент статичен и видим. */
    const initReducedMotion = () => {
      const targets = [heroTitle, ...copySequence, phone, ...cards].filter(Boolean);
      gsap.killTweensOf(targets);
      gsap.set(targets, { clearProps: "all" });
    };

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 1000px)",
        fine: "(pointer: fine)",
      },
      (context) => {
        const { reduce, desktop, fine } = context.conditions;

        if (reduce) {
          initReducedMotion();
          return;
        }

        const lines = introPlayed ? [] : splitTitleLines();
        if (!introPlayed) {
          initHeroIntro(lines);
        }
        initHeroCardFloat();

        const cleanupPointer = desktop && fine ? initHeroPointerEffect() : () => {};

        return () => {
          cleanupPointer();
          if (heroTitle.querySelector("span")) restoreTitle();
        };
      }
    );

    const destroyAnimations = () => {
      mm.revert();
      restoreTitle();
    };

    window.medhomeAnimations = { destroy: destroyAnimations };
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnimations, { once: true });
  } else {
    initAnimations();
  }
})();
