import { $, setHidden } from "../../ui/dom.js";
import { createModal } from "../../ui/modal.js";

export function createTaskModal() {
  const modalEl = $("#task-modal");
  const modal = createModal(modalEl);

  const titleEl = $("#task-modal-title");
  const idEl = $("#task-id");
  const form = $("#task-form");
  const tituloEl = $("#task-titulo");
  const statusEl = $("#task-status");
  const descEl = $("#task-descricao");
  const submitEl = $("#task-submit");

  const setTitle = (t) => { titleEl.textContent = t; };

  const reset = () => {
    idEl.value = "";
    form.reset();
    statusEl.value = "a fazer";
  };

  const openForCreate = () => {
    reset();
    setTitle("Nova entrada");
    submitEl.textContent = "Salvar";
    modal.open();
    tituloEl.focus();
  };

  const openForEdit = (task) => {
    reset();
    setTitle("Refinar demanda");
    idEl.value = String(task.id);
    tituloEl.value = task.titulo || "";
    statusEl.value = task.status || "a fazer";
    descEl.value = task.descricao || "";
    submitEl.textContent = "Salvar";
    modal.open();
    tituloEl.focus();
  };

  const readForm = () => {
    const id = idEl.value ? Number(idEl.value) : null;
    const payload = {
      titulo: tituloEl.value.trim(),
      descricao: descEl.value.trim() || "",
      status: statusEl.value
    };
    return { id, payload };
  };

  const validate = ({ payload }) => {
    const errs = [];
    if (!payload.titulo || payload.titulo.length < 2) errs.push("Informe um título (mínimo 2 caracteres).");
    if (payload.titulo.length > 120) errs.push("Título muito longo (máx. 120).");
    if (!["a fazer", "em andamento", "concluída"].includes(payload.status)) errs.push("Status inválido.");
    if (payload.descricao.length > 1000) errs.push("Observações muito longas (máx. 1000).");
    return errs;
  };

  return {
    form,
    openForCreate,
    openForEdit,
    readForm,
    validate,
    close: modal.close
  };
}

export function createConfirmModal() {
  const modalEl = $("#confirm-modal");
  const modal = createModal(modalEl);
  const confirmButton = $("#confirm-delete");
  return { open: modal.open, close: modal.close, confirmButton };
}
