import { $ } from "./dom.js";

let timer = 0;

const DEFAULT_TTL = 1400; // mais rápido
const MAX_TOASTS = 2;     // evita pilha

export const alert = {
  /**
   * @param {string} message
   * @param {{ role?: "status"|"alert", timeoutMs?: number }} opts
   */
  show(message, opts = {}) {
    const host = $("#app-alert");
    if (!host || !message) return;

    // Limita quantidade de toasts na tela
    while (host.children.length >= MAX_TOASTS) {
      host.firstElementChild?.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    // Para erros críticos use role="alert" (anuncia imediatamente)
    const role = opts.role || "status";
    toast.setAttribute("role", role);

    host.appendChild(toast);

    // Se você aplicar animação via CSS: adiciona classe de entrada
    requestAnimationFrame(() => toast.classList.add("is-show"));

    const ttl = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : DEFAULT_TTL;

    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      toast.classList.remove("is-show");
      toast.classList.add("is-hide");

      // tempo para a transição do CSS
      window.setTimeout(() => toast.remove(), 180);
    }, ttl);
  },
};
