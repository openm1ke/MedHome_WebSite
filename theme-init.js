/* Устанавливает тему до первой отрисовки (подключается в <head> ДО styles.css).
   Приоритет: сохранённый выбор (localStorage "medhome_theme") → тёмная тема
   по умолчанию (dark — тема по умолчанию для новых пользователей, системная
   prefers-color-scheme больше не влияет на выбор темы).
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
    theme = "dark";
  }

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
})();
