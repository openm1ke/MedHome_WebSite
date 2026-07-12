(() => {
  "use strict";

  const initAnimations = () => {
    if (!window.gsap) return;
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const mm = gsap.matchMedia();

    /* ==================== HERO ==================== */

    const initHero = () => {
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
    };

    /* ==================== STORY ==================== */

    const initStory = () => {
      const story = document.querySelector(".story");
      if (!story || !window.ScrollTrigger) return;

      const layers = [...story.querySelectorAll("[data-story-screens] .phone-android__layer")];
      const scenes = [...story.querySelectorAll(".scene")];
      const dots = [...story.querySelectorAll(".story__dot")];
      const caption = story.querySelector("[data-story-caption]");
      const cards = scenes.map((scene) => scene.querySelector(".scene__card"));
      const sceneNames = [...story.querySelectorAll(".scene__eyebrow")].map((el) => el.textContent.trim());
      if (!layers.length || layers.length !== scenes.length) return;

      let currentScreen = 0;
      let chartDrawn = false;

      /* --- Сценовые эффекты: каждый объясняет возможность продукта --- */

      /* Сцена 2: одна короткая линия сканирования при входе, без повторов */
      const initScanAnimation = () => {
        const line = story.querySelector(".scan-card__line");
        if (!line) return () => {};
        return () => {
          gsap
            .timeline({ defaults: { overwrite: "auto" } })
            .fromTo(
              line,
              { top: "18%", opacity: 0.9 },
              { top: "78%", duration: 0.5, ease: "power1.inOut" }
            )
            .to(line, { top: "50%", opacity: 0.5, duration: 0.25, ease: "power1.out" });
        };
      };

      /* Сцена 3: сначала уведомление, затем прогресс курса */
      const initCourseProgress = () => {
        const notify = story.querySelector(".notify-card");
        const fill = story.querySelector(".course-progress__fill");
        const label = story.querySelector(".course-progress__label");
        if (!notify || !fill) return () => {};
        return () => {
          gsap
            .timeline({ defaults: { ease: "power2.out", overwrite: "auto" } })
            .fromTo(notify, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35 }, 0.05)
            .fromTo(label, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.3)
            .fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power1.inOut" }, 0.35);
        };
      };

      /* Сцена 5: линия графика рисуется один раз, точки и подпись — после */
      const initHealthChart = () => {
        const line = story.querySelector("[data-chart-line]");
        const dotsGroup = story.querySelector("[data-chart-dots]");
        const label = story.querySelector("[data-chart-label]");
        if (!line || !dotsGroup) return () => {};
        return () => {
          if (chartDrawn) return;
          chartDrawn = true;
          const length = line.getTotalLength();
          const chartDots = [...dotsGroup.querySelectorAll("circle")];
          gsap
            .timeline({ defaults: { overwrite: "auto" } })
            .fromTo(
              line,
              { strokeDasharray: length, strokeDashoffset: length },
              { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut" },
              0.15
            )
            .fromTo(
              chartDots,
              { scale: 0, transformOrigin: "50% 50%" },
              { scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.06 },
              0.7
            )
            .fromTo(label, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 1.2);
        };
      };

      const sceneEffects = {
        1: initScanAnimation(),
        2: initCourseProgress(),
        4: initHealthChart(),
      };

      /* Появление/скрытие карточки сцены; overwrite защищает от быстрой прокрутки */
      const animateSceneCard = (index, active) => {
        const card = cards[index];
        if (!card) return;
        if (active) {
          gsap.fromTo(
            card,
            { y: 14, scale: 0.97, autoAlpha: 0 },
            { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" }
          );
          sceneEffects[index]?.();
        } else {
          gsap.to(card, { autoAlpha: 0, duration: 0.2, ease: "power1.out", overwrite: "auto" });
        }
      };

      const initSceneCards = (activeIndex) => {
        cards.forEach((card, i) => {
          if (card) gsap.set(card, { autoAlpha: i === activeIndex ? 1 : 0 });
        });
      };

      /* Возврат карточек и эффектов к статичному состоянию (mobile, no-JS, cleanup) */
      const resetSceneVisuals = () => {
        const fxTargets = [
          ...cards,
          story.querySelector(".scan-card__line"),
          story.querySelector(".notify-card"),
          story.querySelector(".course-progress__label"),
          story.querySelector(".course-progress__fill"),
          story.querySelector("[data-chart-line]"),
          story.querySelector("[data-chart-label]"),
          ...story.querySelectorAll("[data-chart-dots] circle"),
        ].filter(Boolean);
        gsap.killTweensOf(fxTargets);
        gsap.set(fxTargets, { clearProps: "all" });
      };

      /* Двухслойный crossfade текущего и целевого экрана.
         overwrite: "auto" снимает встречные твины при быстрой прокрутке. */
      const setPhoneScreen = (index) => {
        if (index === currentScreen || !layers[index]) return;
        const prev = layers[currentScreen];
        const next = layers[index];
        currentScreen = index;
        gsap.to(prev, { autoAlpha: 0, duration: 0.3, ease: "power1.out", overwrite: "auto" });
        gsap.fromTo(
          next,
          { autoAlpha: 0, scale: 1.02 },
          { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power1.out", overwrite: "auto" }
        );
      };

      const updateStoryProgress = (index) => {
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
        if (caption && sceneNames[index] && caption.textContent !== sceneNames[index]) {
          caption.textContent = sceneNames[index];
          gsap.fromTo(caption, { autoAlpha: 0.3 }, { autoAlpha: 1, duration: 0.25, overwrite: "auto" });
        }
      };

      const activateScene = (index) => {
        scenes.forEach((scene, i) => {
          const isActive = i === index;
          const wasActive = scene.classList.contains("is-active");
          scene.classList.toggle("is-active", isActive);
          if (isActive !== wasActive) animateSceneCard(i, isActive);
        });
        setPhoneScreen(index);
        updateStoryProgress(index);
      };

      const createSceneTrigger = (scene, index) =>
        ScrollTrigger.create({
          trigger: scene,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) activateScene(index);
          },
        });

      /* Mobile/tablet/reduced: статичная вертикальная последовательность.
         Базовая разметка и CSS уже показывают всё — JS ничего не прячет. */
      const initMobileStory = () => {};

      const initDesktopStory = () => {
        story.classList.add("story--js");
        gsap.set(layers, { autoAlpha: 0 });
        gsap.set(layers[0], { autoAlpha: 1 });
        currentScreen = 0;

        const triggers = scenes.map((scene, index) => createSceneTrigger(scene, index));
        ScrollTrigger.refresh();

        const activeIndex = Math.max(
          triggers.findIndex((trigger) => trigger.isActive),
          0
        );
        initSceneCards(activeIndex);
        activateScene(activeIndex);

        return destroyStory(triggers);
      };

      const destroyStory = (triggers) => () => {
        triggers.forEach((trigger) => trigger.kill());
        story.classList.remove("story--js");
        scenes.forEach((scene) => scene.classList.remove("is-active"));
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === 0));
        gsap.killTweensOf(layers);
        gsap.set(layers, { clearProps: "all" });
        resetSceneVisuals();
        currentScreen = 0;
      };

      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 1000px)",
        },
        (context) => {
          const { reduce, desktop } = context.conditions;
          if (reduce || !desktop) {
            initMobileStory();
            return;
          }
          return initDesktopStory();
        }
      );
    };

    /* ==================== НИЖНИЕ СЕКЦИИ ==================== */

    /* Короткий однократный reveal для extras/download/trust/contacts.
       Один ScrollTrigger.batch — не создаёт отдельного триггера на каждый
       элемент и не конкурирует с триггерами story. */
    const initLowerReveals = () => {
      if (!window.ScrollTrigger) return;
      const targets = [
        ...document.querySelectorAll(".extras .reveal, .download .reveal, .trust .reveal, .contacts .reveal"),
      ];
      if (!targets.length) return;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(targets, { autoAlpha: 0, y: 18 });

        const triggers = ScrollTrigger.batch(targets, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              stagger: 0.08,
              overwrite: "auto",
            }),
        });

        return () => {
          triggers.forEach((trigger) => trigger.kill());
          gsap.killTweensOf(targets);
          gsap.set(targets, { clearProps: "all" });
        };
      });
    };

    initHero();
    initStory();
    initLowerReveals();

    const destroyAnimations = () => {
      mm.revert();
    };

    window.medhomeAnimations = { destroy: destroyAnimations };
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnimations, { once: true });
  } else {
    initAnimations();
  }
})();
