import { authView } from "./authView.js";
import * as authService from "./authService.js";
import { storage } from "../../storage.js";
import { alert } from "../../ui/alert.js";

/**
 * @param {{ onAuthenticated: () => void }} deps
 */
export function createAuthController(deps) {
  let mode = /** @type {"login"|"register"} */ ("login");

  const validate = (payload) => {
    const errors = [];
    if (mode === "register") {
      if (!payload.nome || payload.nome.trim().length < 2) errors.push("Informe seu nome (mínimo 2 caracteres).");
    }
    if (!payload.email || !payload.email.includes("@")) errors.push("Informe um e-mail válido.");
    if (!payload.senha || payload.senha.length < 4) errors.push("Sua chave de acesso deve ter pelo menos 4 caracteres.");
    return errors;
  };

  const onToggle = () => {
    mode = mode === "login" ? "register" : "login";
    authView.setMode(mode);
    authView.resetForm();
    authView.els.inputEmail().focus();
  };

  /** @param {SubmitEvent} e */
  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nome: authView.els.inputNome().value.trim(),
      email: authView.els.inputEmail().value.trim(),
      senha: authView.els.inputSenha().value
    };

    const errors = validate(payload);
    if (errors.length) {
      alert.show(errors[0], { role: "alert" });
      return;
    }

    try {
      const data = mode === "login"
        ? await authService.login({ email: payload.email, senha: payload.senha })
        : await authService.register({ nome: payload.nome, email: payload.email, senha: payload.senha });

      const session = { user: data.user, token: data.token };
      storage.setSession(session);

      alert.show("Sessão iniciada.");
      deps.onAuthenticated();
    } catch (err) {
      const msg = err?.message || "Falha ao autenticar.";
      alert.show(msg, { role: "alert" });
    }
  };

  const mount = () => {
    authView.setMode(mode);
    authView.els.toggle().addEventListener("click", onToggle);
    authView.els.form().addEventListener("submit", onSubmit);
  };

  return { mount };
}
