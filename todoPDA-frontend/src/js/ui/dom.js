export const $ = (selector, root = document) => {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`Elemento não encontrado: ${selector}`);
  return el;
};

export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export const setHidden = (el, hidden) => {
  el.hidden = !!hidden;
};

export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const toKebab = (s) => String(s ?? "").trim().toLowerCase().replaceAll(" ", "-");

export const formatCount = (n) => {
  const num = Number.isFinite(n) ? n : 0;
  return num === 1 ? "1 registro" : `${num} registros`;
};
