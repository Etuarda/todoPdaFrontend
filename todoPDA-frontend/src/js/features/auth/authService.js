import { apiFetch } from "../../api/apiFetch.js";

/**
 * @param {{ nome: string, email: string, senha: string }} payload
 */
export const register = (payload) => apiFetch("/auth/register", { method: "POST", body: payload });

/**
 * @param {{ email: string, senha: string }} payload
 */
export const login = (payload) => apiFetch("/auth/login", { method: "POST", body: payload });
