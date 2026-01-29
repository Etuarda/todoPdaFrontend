const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(",");

export const focus = {
  /** @param {HTMLElement} container */
  getFirst(container) {
    return /** @type {HTMLElement|null} */ (container.querySelector(FOCUSABLE));
  },
  /** @param {HTMLElement} container */
  getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE));
  }
};
