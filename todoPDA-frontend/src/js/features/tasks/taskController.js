import { taskView } from "./taskView.js";
import * as taskService from "./taskService.js";
import { alert } from "../../ui/alert.js";
import { $ } from "../../ui/dom.js";

/**
 * @param {{ taskModal: any, confirmModal: any }} deps
 */
export function createTaskController(deps) {
  /** @type {any[]} */
  let tasks = [];
  let filter = "all";
  let pendingDeleteId = null;

  const nextStatus = (current) => {
    const map = { "a fazer": "em andamento", "em andamento": "concluída", "concluída": "a fazer" };
    return map[current] || "a fazer";
  };

  const fetchAndRender = async () => {
    try {
      tasks = await taskService.listTasks();
      taskView.setActiveFilter(filter);
      taskView.renderList(tasks, filter);
    } catch (err) {
      alert.show(err?.message || "Falha ao carregar tarefas.", { role: "alert" });
    }
  };

  const onFilterClick = (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    filter = btn.dataset.filter || "all";
    taskView.setActiveFilter(filter);
    taskView.renderList(tasks, filter);
  };

  const openCreate = () => {
    deps.taskModal.openForCreate();
  };

  /** @param {SubmitEvent} e */
  const onTaskFormSubmit = async (e) => {
    e.preventDefault();
    const data = deps.taskModal.readForm();
    const errors = deps.taskModal.validate(data);
    if (errors.length) {
      alert.show(errors[0], { role: "alert" });
      return;
    }

    try {
      if (data.id) {
        const updated = await taskService.updateTask(data.id, data.payload);
        tasks = tasks.map(t => t.id === updated.id ? updated : t);
        deps.taskModal.close();
        alert.show("Registro atualizado.");
        // Atualiza card específico (sem reload)
        taskView.upsertCard(updated);
      } else {
        const created = await taskService.createTask(data.payload);
        tasks = [created, ...tasks];
        deps.taskModal.close();
        alert.show("Registro criado.");
        taskView.upsertCard(created);
      }

      // Recalcula contagem com o filtro atual
      const visible = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
      taskView.setCount(visible);
    } catch (err) {
      alert.show(err?.message || "Falha ao salvar registro.", { role: "alert" });
    }
  };

  const requestDelete = (id) => {
    pendingDeleteId = id;
    deps.confirmModal.open();
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    pendingDeleteId = null;

    try {
      await taskService.deleteTask(id);
      tasks = tasks.filter(t => t.id !== id);

      const card = taskView.els.container().querySelector(`[data-task-id="${id}"]`);
      if (card) taskView.removeCard(card);

      alert.show("Registro removido.");

      // Se o filtro atual ficou vazio, re-render para mostrar empty-state
      taskView.renderList(tasks, filter);
    } catch (err) {
      alert.show(err?.message || "Falha ao remover registro.", { role: "alert" });
    } finally {
      deps.confirmModal.close();
    }
  };

  const onListClick = async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = Number(btn.dataset.taskId);

    if (!id) return;

    if (action === "edit") {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      deps.taskModal.openForEdit(task);
      return;
    }

    if (action === "delete") {
      requestDelete(id);
      return;
    }

    if (action === "cycle-status") {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const status = nextStatus(task.status);

      try {
        const updated = await taskService.patchStatus(id, { status });
        tasks = tasks.map(t => t.id === updated.id ? updated : t);

        // Atualiza card específico (sem reload)
        taskView.upsertCard(updated);

        // Se mudou e não encaixa no filtro, re-render para remover da lista visível
        taskView.renderList(tasks, filter);
      } catch (err) {
        alert.show(err?.message || "Falha ao alterar status.", { role: "alert" });
      }
    }
  };

  const mount = () => {
    taskView.els.createBtn().addEventListener("click", openCreate);
    $("#app-view").addEventListener("click", (e) => {
      // filtros
      if (e.target.closest("[data-filter]")) return onFilterClick(e);
      // lista
      if (e.target.closest("[data-action]")) return onListClick(e);
    });

    deps.taskModal.form.addEventListener("submit", onTaskFormSubmit);
    deps.confirmModal.confirmButton.addEventListener("click", confirmDelete);
  };

  return { mount, fetchAndRender };
}
