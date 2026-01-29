export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, details?: string[] }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = "ApiError";
    this.status = meta.status ?? 0;
    this.details = meta.details ?? [];
  }
}

export const normalizeApiErrorMessage = (payload) => {
  if (!payload) return { message: "Falha ao comunicar com o servidor.", details: [] };
  if (typeof payload === "string") return { message: payload, details: [] };
  if (payload.erro && typeof payload.erro === "string") return { message: payload.erro, details: [] };
  if (Array.isArray(payload.erros) && payload.erros.length) return { message: "Verifique os campos informados.", details: payload.erros.map(String) };
  return { message: "Erro inesperado.", details: [] };
};
