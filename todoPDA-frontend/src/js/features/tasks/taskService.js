import { apiFetch } from "../../api/apiFetch.js";

/** @param {{ status?: string }} [opts] */
export const listTasks = (opts = {}) => {
  const q = opts.status && opts.status !== "all" ? `?status=${encodeURIComponent(opts.status)}` : "";
  return apiFetch(`/tarefas${q}`);
};

/** @param {{ titulo: string, descricao?: string, status: string }} payload */
export const createTask = (payload) => apiFetch("/tarefas", { method: "POST", body: payload });

/** @param {number|string} id @param {{ titulo: string, descricao?: string, status: string }} payload */
export const updateTask = (id, payload) => apiFetch(`/tarefas/${id}`, { method: "PUT", body: payload });

/** @param {number|string} id @param {{ status: string }} payload */
export const patchStatus = (id, payload) => apiFetch(`/tarefas/${id}/status`, { method: "PATCH", body: payload });

/** @param {number|string} id */
export const deleteTask = (id) => apiFetch(`/tarefas/${id}`, { method: "DELETE" });
