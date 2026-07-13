/* Устанавливает тему до первой отрисовки (подключается в <head> ДО styles.css).
   Приоритет: сохранённый выбор (localStorage "medhome_theme") → системная тема.
   CSP: inline-скрипты запрещены, поэтому файл отдельный и локальный.
   Логика переключения — в script.js (initThemeToggle). */
(() => {
  const root = document.documentElement;
  let theme = null;

  try {
    theme = window.localStorage.getItem("medhome_theme");
  } catch {
    theme = null;
  }

  if (theme !== "dark" && theme !== "light") {
    try {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      theme = "light";
    }
  }

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
})();
