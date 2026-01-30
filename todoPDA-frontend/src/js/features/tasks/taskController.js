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

  /**
   * Regra de ciclo de status da tarefa:
   * a fazer → em andamento → concluída → a fazer
   */
  const STATUS_FLOW = {
    "a fazer": "em andamento",
    "em andamento": "concluída",
    "concluída": "a fazer",
  };

  const nextStatus = (current) => STATUS_FLOW[current] ?? "a fazer";

  const showError = (err, fallback) => {
    alert.show(err?.message || fallback, { role: "alert" });
  };

  const findTaskById = (id) => tasks.find((t) => t.id === id);

  const replaceTaskInState = (updated) => {
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
  };

  const prependTaskInState = (created) => {
    tasks = [created, ...tasks];
  };

  const removeTaskFromState = (id) => {
    tasks = tasks.filter((t) => t.id !== id);
  };

  const getVisibleTasks = () => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  };

  const render = () => {
    taskView.setActiveFilter(filter);
    taskView.renderList(tasks, filter);
    taskView.setCount(getVisibleTasks());
  };

  const renderAndUpsert = (task) => {
    taskView.upsertCard(task);
    render();
  };

  const fetchAndRender = async () => {
    try {
      tasks = await taskService.listTasks();
      render();
    } catch (err) {
      showError(err, "Falha ao carregar tarefas.");
    }
  };

  const setFilter = (newFilter) => {
    filter = newFilter || "all";
    render();
  };

  const onFilterClick = (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    setFilter(btn.dataset.filter);
  };

  const openCreate = () => {
    deps.taskModal.openForCreate();
  };

  const saveTask = async (data) => {
    if (data.id) return taskService.updateTask(data.id, data.payload);
    return taskService.createTask(data.payload);
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
      const saved = await saveTask(data);

      if (data.id) {
        replaceTaskInState(saved);
        alert.show("Registro atualizado.");
      } else {
        prependTaskInState(saved);
        alert.show("Registro criado.");
      }

      deps.taskModal.close();
      renderAndUpsert(saved);
    } catch (err) {
      showError(err, "Falha ao salvar registro.");
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
      removeTaskFromState(id);

      const container = taskView.els.container();
      const card = container?.querySelector(`[data-task-id="${id}"]`);
      if (card) taskView.removeCard(card);

      alert.show("Registro removido.");
      render();
    } catch (err) {
      showError(err, "Falha ao remover registro.");
    } finally {
      deps.confirmModal.close();
    }
  };

  const handleEdit = async (id) => {
    const task = findTaskById(id);
    if (!task) return;
    deps.taskModal.openForEdit(task);
  };

  const handleDelete = async (id) => {
    requestDelete(id);
  };

  const handleCycleStatus = async (id) => {
    const task = findTaskById(id);
    if (!task) return;

    const status = nextStatus(task.status);

    try {
      const updated = await taskService.patchStatus(id, { status });
      replaceTaskInState(updated);
      renderAndUpsert(updated);
    } catch (err) {
      showError(err, "Falha ao alterar status.");
    }
  };

  const listActionHandlers = {
    edit: handleEdit,
    delete: handleDelete,
    "cycle-status": handleCycleStatus,
  };

  const onListClick = async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = Number(btn.dataset.taskId);

    if (!id) return;

    const handler = listActionHandlers[action];
    if (!handler) return;

    await handler(id);
  };

  const mount = () => {
    taskView.els.createBtn().addEventListener("click", openCreate);

    $("#app-view").addEventListener("click", async (e) => {
      if (e.target.closest("[data-filter]")) {
        onFilterClick(e);
        return;
      }

      if (e.target.closest("[data-action]")) {
        await onListClick(e);
      }
    });

    deps.taskModal.form.addEventListener("submit", onTaskFormSubmit);
    deps.confirmModal.confirmButton.addEventListener("click", confirmDelete);
  };

  return { mount, fetchAndRender };
}
