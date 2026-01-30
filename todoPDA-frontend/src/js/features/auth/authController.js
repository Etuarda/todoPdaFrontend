import { authView } from "./authView.js";
import * as authService from "./authService.js";
import { storage } from "../../storage.js";
import { alert } from "../../ui/alert.js";

export function createAuthController(deps) {
  let mode = /** @type {"login"|"register"} */ ("login");

  const validate = (payload) => {
    const errors = [];
    
    // Validação do nome adicionada para o modo registro
    if (mode === "register" && (!payload.nome || payload.nome.trim().length < 2)) {
      errors.push("Por favor, informe seu nome.");
    }
    
    if (!payload.email || !payload.email.includes("@")) {
      errors.push("Informe um e-mail válido.");
    }
    if (!payload.senha || payload.senha.length < 4) {
      errors.push("Sua chave de acesso deve ter pelo menos 4 caracteres.");
    }
    return errors;
  };

  const onToggle = () => {
    mode = mode === "login" ? "register" : "login";
    authView.setMode(mode);
    authView.resetForm();
    // Se for registro, foca no nome, se for login, foca no e-mail
    if (mode === "register") {
        authView.els.inputNome().focus();
    } else {
        authView.els.inputEmail().focus();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nome: authView.els.inputNome().value.trim(), // Adicionado ao payload
      email: authView.els.inputEmail().value.trim(),
      senha: authView.els.inputSenha().value
    };

    const errors = validate(payload);
    if (errors.length) {
      alert.show(errors[0], { role: "alert" });
      return;
    }

    try {
      // O authService.register já aceita payload com nome no seu arquivo original
      const data = mode === "login"
        ? await authService.login({ email: payload.email, senha: payload.senha })
        : await authService.register(payload);

      const session = { user: data.user, token: data.token };
      storage.setSession(session);

      alert.show("Sessão iniciada.");
      deps.onAuthenticated();
    } catch (err) {
      const msg = err?.message || "Falha ao autenticar.";
      alert.show(msg, { role: "alert" });
    }
  };

// Dentro da função createAuthController(deps)
const mount = () => {
    // Garante que ao iniciar, o modo seja 'login' (escondendo o nome)
    authView.setMode("login"); 
    
    authView.els.toggle().addEventListener("click", onToggle);
    authView.els.form().addEventListener("submit", onSubmit);
};

  return { mount };
}