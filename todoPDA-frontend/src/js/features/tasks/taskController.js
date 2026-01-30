import { taskView } from "./taskView.js";
import * as taskService from "./taskService.js";
import { alert } from "../../ui/alert.js";
import { $ } from "../../ui/dom.js";

/**
 * Controller responsável por orquestrar:
 * - estado local das tarefas
 * - interações do usuário
 * - comunicação entre View e Service
 *
 * Não contém regras de persistência nem lógica de renderização detalhada.
 *
 * @param {{ taskModal: any, confirmModal: any }} deps
 */
export function createTaskController(deps) {
  /** Estado local das tarefas carregadas */
  let tasks = [];

  /** Filtro ativo da lista */
  let filter = "all";

  /** Controle temporário para confirmação de exclusão */
  let pendingDeleteId = null;

  /**
   * Regra de negócio:
   * ciclo permitido de status da tarefa
   */
  const STATUS_FLOW = {
    "a fazer": "em andamento",
    "em andamento": "concluída",
    "concluída": "a fazer",
  };

  /** Retorna o próximo status válido no ciclo */
  const nextStatus = (current) => STATUS_FLOW[current] ?? "a fazer";

  /**
   * Padroniza exibição de erros para o usuário
   * evitando duplicação de código e mensagens inconsistentes
   */
  const showError = (err, fallback) => {
    alert.show(err?.message || fallback, { role: "alert" });
  };

  /** Busca uma tarefa no estado local pelo id */
  const findTaskById = (id) => tasks.find((t) => t.id === id);

  /** Substitui uma tarefa no estado local após update */
  const replaceTaskInState = (updated) => {
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
  };

  /** Insere uma nova tarefa no topo da lista */
  const prependTaskInState = (created) => {
    tasks = [created, ...tasks];
  };

  /** Remove uma tarefa do estado local */
  const removeTaskFromState = (id) => {
    tasks = tasks.filter((t) => t.id !== id);
  };

  /** Retorna tarefas visíveis de acordo com o filtro atual */
  const getVisibleTasks = () => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.status === filter);
  };

  /**
   * Renderização centralizada:
   * garante consistência entre lista, filtro e contagem
   */
  const render = () => {
    taskView.setActiveFilter(filter);
    taskView.renderList(tasks, filter);
    taskView.setCount(getVisibleTasks());
  };

  /**
   * Atualiza ou cria um card específico
   * e sincroniza a lista visível
   */
  const renderAndUpsert = (task) => {
    taskView.upsertCard(task);
    render();
  };

  /**
   * Carrega tarefas do backend
   * e sincroniza o estado inicial da UI
   */
  const fetchAndRender = async () => {
    try {
      tasks = await taskService.listTasks();
      render();
    } catch (err) {
      showError(err, "Falha ao carregar tarefas.");
    }
  };

  /** Atualiza o filtro ativo e re-renderiza */
  const setFilter = (newFilter) => {
    filter = newFilter || "all";
    render();
  };

  /** Handler de clique nos filtros */
  const onFilterClick = (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    setFilter(btn.dataset.filter);
  };

  /** Abre modal para criação de tarefa */
  const openCreate = () => {
    deps.taskModal.openForCreate();
  };

  /**
   * Decide se a operação é create ou update
   * abstraindo essa decisão do handler de submit
   */
  const saveTask = async (data) => {
    if (data.id) return taskService.updateTask(data.id, data.payload);
    return taskService.createTask(data.payload);
  };

  /**
   * Submit do formulário de tarefa
   * responsável apenas por:
   * - validar dados
   * - delegar persistência
   * - atualizar estado e UI
   */
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

  /** Solicita confirmação de exclusão */
  const requestDelete = (id) => {
    pendingDeleteId = id;
    deps.confirmModal.open();
  };

  /**
   * Confirma exclusão da tarefa
   * garantindo sincronização entre estado e UI
   */
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

  /** Abre modal para edição */
  const handleEdit = async (id) => {
    const task = findTaskById(id);
    if (!task) return;
    deps.taskModal.openForEdit(task);
  };

  /** Dispara fluxo de exclusão */
  const handleDelete = async (id) => {
    requestDelete(id);
  };

  /**
   * Altera status da tarefa respeitando
   * o fluxo de estados permitido
   */
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

  /**
   * Dispatcher de ações da lista
   * evita cadeias de if/else e reduz complexidade
   */
  const listActionHandlers = {
    edit: handleEdit,
    delete: handleDelete,
    "cycle-status": handleCycleStatus,
  };

  /** Handler único de ações da lista */
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

  /**
   * Registro centralizado de eventos
   * mantendo o controller como camada de orquestração
   */
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
