import { storage } from "./storage.js";
import { $ } from "./ui/dom.js";
import { alert } from "./ui/alert.js";
import { authView } from "./features/auth/authView.js";
import { taskView } from "./features/tasks/taskView.js";
import { createAuthController } from "./features/auth/authController.js";
import { createTaskController } from "./features/tasks/taskController.js";
import { createTaskModal, createConfirmModal } from "./features/tasks/taskViewModal.js";

const showAuth = () => {
  authView.els.view().hidden = false;
  taskView.hide();
  $("#header-actions").hidden = true;

  // foco no título para leitura de screen reader + teclado
  $("#main").focus();
  authView.els.inputEmail().focus();
};

const showApp = () => {
  authView.els.view().hidden = true;
  taskView.show();
  $("#main").focus();
};

const applyVision = () => {
  const vision = storage.getVision();
  document.body.dataset.vision = vision;
  const pressed = vision === "high";
  const btn = $("#hc-toggle");
  btn.setAttribute("aria-pressed", String(pressed));
};

const toggleVision = () => {
  const next = storage.getVision() === "high" ? "default" : "high";
  storage.setVision(next);
  applyVision();
};

const initVlibras = () => {
  if (typeof window.VLibras === "undefined") return;
  try {
    new window.VLibras.Widget("https://vlibras.gov.br/app");
  } catch {
    // Não quebra a navegação se o widget falhar.
  }
};

const boot = () => {
  initVlibras();
  applyVision();

  const taskModal = createTaskModal();
  const confirmModal = createConfirmModal();

  const taskController = createTaskController({ taskModal, confirmModal });
  const authController = createAuthController({
    onAuthenticated() {
      showApp();
      taskController.fetchAndRender();
    }
  });

  authController.mount();
  taskController.mount();

  $("#hc-toggle").addEventListener("click", toggleVision);
  $("#logout-btn").addEventListener("click", () => {
    storage.clearSession();
    alert.show("Sessão encerrada.");
    showAuth();
  });

  window.addEventListener("auth:expired", () => {
    alert.show("Sessão expirada. Faça login novamente.", { role: "alert" });
    showAuth();
  });

  // Sessão existente
  const session = storage.getSession();
  if (session?.token) {
    showApp();
    taskController.fetchAndRender();
  } else {
    showAuth();
  }
};

boot();
