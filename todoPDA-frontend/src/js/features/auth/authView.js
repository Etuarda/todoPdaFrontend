import { $, setHidden } from "../../ui/dom.js";

export const authView = {
  els: {
    view: () => $("#auth-view"),
    title: () => $("#auth-title"),
    subtitle: () => $("#auth-subtitle"),
    form: () => $("#auth-form"),
    toggle: () => $("#auth-toggle"),
    submit: () => $("#auth-submit"),
    inputEmail: () => $("#auth-email"),
    inputSenha: () => $("#auth-senha"),
    // Novos elementos:
    fieldNome: () => $("#field-nome"),
    inputNome: () => $("#auth-nome")
  },

  /**
   * @param {"login"|"register"} mode
   */
  setMode(mode) {
    const isLogin = mode === "login";
    this.els.title().textContent = isLogin ? "Entrar" : "Criar conta";
    this.els.subtitle().textContent = isLogin 
      ? "Use seu e-mail e sua chave de acesso." 
      : "Cadastre um nome, e-mail e uma chave de acesso.";
    this.els.submit().textContent = isLogin ? "Entrar no sistema" : "Finalizar registro";
    this.els.toggle().textContent = isLogin ? "Criar nova crônica" : "Já possuo conta";
    
    // Mostra o campo nome apenas se não for login
    setHidden(this.els.fieldNome(), isLogin);
    this.els.inputNome().toggleAttribute("required", !isLogin);
  },

  resetForm() {
    this.els.form().reset();
  }
};