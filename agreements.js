const nav = document.querySelector("[data-legal-nav]");
const content = document.querySelector("[data-legal-content]");
const documentCache = new Map();
let documentsManifest;

const privateFields = {
  operator_name: ["Шмыр", "ев Михаил", " Юрьевич"].join(""),
  operator_name_dative: ["Шмыр", "еву Михаилу", " Юрьевичу"].join(""),
  operator_tax_id: ["503", "506", "897", "345"].join(""),
};

const hydratePrivateFields = (markdown) =>
  Object.entries(privateFields).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    markdown,
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
