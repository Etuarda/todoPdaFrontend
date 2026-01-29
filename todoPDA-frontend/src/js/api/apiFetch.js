import { config } from "../config.js";
import { storage } from "../storage.js";
import { ApiError, normalizeApiErrorMessage } from "./errors.js";

const buildUrl = (path) => {
  const base = config.baseUrl.replace(/\/$/, "");
  const prefix = config.prefix.startsWith("/") ? config.prefix : `/${config.prefix}`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix}${p}`;
};

const hasJsonContent = (res) => {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
};

/**
 * @template T
 * @param {string} path
 * @param {{ method?: string, body?: any, headers?: Record<string,string> }} [options]
 * @returns {Promise<T|null>}
 */
export async function apiFetch(path, options = {}) {
  const session = storage.getSession();

  const headers = {
    "Accept": "application/json",
    ...(options.headers || {})
  };

  if (options.body !== undefined && options.body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  const res = await fetch(buildUrl(path), {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined && options.body !== null ? JSON.stringify(options.body) : undefined
  });

  if (res.status === 204) return null;

  const payload = hasJsonContent(res) ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (res.status === 401) {
    // Sessão expirada/inválida: limpa e notifica.
    storage.clearSession();
    window.dispatchEvent(new CustomEvent("auth:expired"));
    const n = normalizeApiErrorMessage(payload);
    throw new ApiError(n.message || "Sessão expirada. Faça login novamente.", { status: 401, details: n.details });
  }

  if (!res.ok) {
    const n = normalizeApiErrorMessage(payload);
    throw new ApiError(n.message || "Erro ao comunicar com o servidor.", { status: res.status, details: n.details });
  }

  return /** @type {any} */ (payload);
}
