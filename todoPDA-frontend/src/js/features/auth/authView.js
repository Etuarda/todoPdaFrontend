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
    // Referências para controlar o campo de nome
    fieldNome: () => $("#field-nome"),
    inputNome: () => $("#auth-nome")
  },

  /**
   * @param {"login"|"register"} mode
   */
  setMode(mode) {
    const isLogin = mode === "login";
    
    // Atualização de textos
    this.els.title().textContent = isLogin ? "Entrar" : "Criar conta";
    this.els.subtitle().textContent = isLogin 
        ? "Use seu e-mail e sua chave de acesso." 
        : "Cadastre um nome, e-mail e uma chave de acesso.";
    this.els.submit().textContent = isLogin ? "Entrar no sistema" : "Finalizar registro";
    this.els.toggle().textContent = isLogin ? "Criar nova conta" : "Já possuo conta";
    
    // LOGICA REFORÇADA:
    const fieldNome = this.els.fieldNome();
    if (isLogin) {
        fieldNome.setAttribute('hidden', '');
        fieldNome.style.display = 'none'; // Força o desaparecimento visual
    } else {
        fieldNome.removeAttribute('hidden');
        fieldNome.style.display = 'flex'; // Ou 'block', dependendo do seu layout
    }
    
    this.els.inputNome().toggleAttribute("required", !isLogin);
}
  
};

