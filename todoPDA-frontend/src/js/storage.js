import { config } from "./config.js";

/** @typedef {{ user: any, token: string }} Session */

export const storage = {
  /** @returns {Session|null} */
  getSession() {
    try {
      const raw = localStorage.getItem(config.storageKeys.session);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.token) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  /** @param {Session} session */
  setSession(session) {
    localStorage.setItem(config.storageKeys.session, JSON.stringify(session));
  },

  clearSession() {
    localStorage.removeItem(config.storageKeys.session);
  },

  /** @returns {"default"|"high"} */
  getVision() {
    const v = localStorage.getItem(config.storageKeys.vision);
    return v === "high" ? "high" : "default";
  },

  /** @param {"default"|"high"} v */
  setVision(v) {
    localStorage.setItem(config.storageKeys.vision, v);
  }
};
