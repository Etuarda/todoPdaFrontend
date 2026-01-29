import { focus } from "./focus.js";

export const createModal = (modalEl) => {
  let lastActive = /** @type {HTMLElement|null} */ (null);

  /** @param {KeyboardEvent} e */
  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      api.close();
      return;
    }

    if (e.key !== "Tab") return;

    const panel = modalEl.querySelector(".modal__panel");
    if (!panel) return;

    const items = focus.getFocusable(/** @type {HTMLElement} */ (panel));
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];
    const current = /** @type {HTMLElement} */ (document.activeElement);

    if (e.shiftKey && current === first) {
      e.preventDefault();
      last.focus();
      return;
    }

    if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /** @param {MouseEvent} e */
  const onBackdropClick = (e) => {
    if (e.target === modalEl) api.close();
  };

  const api = {
    open() {
      lastActive = /** @type {HTMLElement|null} */ (document.activeElement);
      modalEl.hidden = false;

      // Foco inicial: primeiro campo do modal.
      const panel = modalEl.querySelector(".modal__panel");
      const first = panel ? focus.getFirst(/** @type {HTMLElement} */ (panel)) : null;
      (first || modalEl).focus?.();

      document.addEventListener("keydown", onKeyDown, true);
      modalEl.addEventListener("click", onBackdropClick);
    },
    close() {
      modalEl.hidden = true;
      document.removeEventListener("keydown", onKeyDown, true);
      modalEl.removeEventListener("click", onBackdropClick);
      lastActive?.focus?.();
      lastActive = null;
    },
    bindCloseButtons() {
      modalEl.querySelectorAll("[data-modal-close]").forEach((btn) => {
        btn.addEventListener("click", () => api.close());
      });
    }
  };

  api.bindCloseButtons();
  return api;
};
