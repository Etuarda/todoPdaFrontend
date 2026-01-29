import { $, $$, escapeHtml, formatCount, setHidden, toKebab } from "../../ui/dom.js";

const STATUS_LABEL = Object.freeze({
  "a fazer": "Pendente",
  "em andamento": "Em execução",
  "concluída": "Finalizado"
});

const statusIcon = (status) => {
  if (status === "concluída") return "✓";
  if (status === "em andamento") return "▶";
  return "○";
};

export const taskView = {
  els: {
    view: () => $("#app-view"),
    headerActions: () => $("#header-actions"),
    counter: () => $("#task-counter"),
    container: () => $("#tasks-container"),
    filterChips: () => $$(".chip", $("#app-view")),
    createBtn: () => $("#task-create")
  },

  /**
   * @param {any[]} tasks
   */
  setCount(tasks) {
    this.els.counter().textContent = formatCount(tasks.length);
  },

  /**
   * @param {any[]} tasks
   * @param {string} filter
   */
  renderList(tasks, filter) {
    const container = this.els.container();
    const list = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

    this.setCount(list);

    if (!list.length) {
      container.innerHTML = `<div class="empty-state" role="note">A crônica está limpa nesta categoria.</div>`;
      return;
    }

    container.innerHTML = list.map((t) => this.taskCardHtml(t)).join("");
  },

  /**
   * @param {any} task
   */
  taskCardHtml(task) {
    const statusText = STATUS_LABEL[task.status] || task.status;
    const safeTitle = escapeHtml(task.titulo);
    const safeDesc = escapeHtml(task.descricao || "Sem anotações detalhadas.");
    const kebab = toKebab(task.status);

    const done = task.status === "concluída" ? "is-done" : "";

    return `
      <article class="card task-card ${done}" role="listitem" data-task-id="${task.id}" data-status="${escapeHtml(task.status)}">
        <div class="task-card__top">
          <div>
            <button class="status-btn" type="button"
              data-action="cycle-status"
              data-task-id="${task.id}"
              aria-label="Alterar status. Status atual: ${escapeHtml(statusText)}">
              <span aria-hidden="true">${statusIcon(task.status)}</span>
            </button>
            <div class="editorial-label" style="margin-top:0.35rem;">Ciclo</div>
          </div>

          <div class="task-content">
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
              <h3 class="task-title">${safeTitle}</h3>
              <span class="status-pill" aria-label="Status: ${escapeHtml(statusText)}">
                <span aria-hidden="true">•</span>
                <span>${escapeHtml(statusText)}</span>
              </span>
            </div>
            <p class="task-desc">${safeDesc}</p>
          </div>
        </div>

        <div class="task-actions" aria-label="Ações da tarefa">
          <button class="btn btn-secondary" type="button" data-action="edit" data-task-id="${task.id}" aria-label="Editar tarefa ${safeTitle}">Editar</button>
          <button class="btn btn-secondary" type="button" data-action="delete" data-task-id="${task.id}" aria-label="Apagar tarefa ${safeTitle}" style="color: var(--danger); border-color: color-mix(in srgb, var(--danger) 25%, var(--border));">Apagar</button>
        </div>
      </article>
    `;
  },

  /** @param {HTMLElement} card */
  removeCard(card) { card.remove(); },

  /**
   * @param {any} task
   */
  upsertCard(task) {
    const container = this.els.container();
    const existing = container.querySelector(`[data-task-id="${task.id}"]`);
    const html = this.taskCardHtml(task);

    if (existing) {
      existing.outerHTML = html;
      return;
    }

    // Se a lista estava vazia (empty-state), re-render completo fica mais simples.
    if (container.querySelector(".empty-state")) {
      container.innerHTML = html;
      return;
    }

    container.insertAdjacentHTML("afterbegin", html);
  },

  /**
   * @param {string} filter
   */
  setActiveFilter(filter) {
    this.els.filterChips().forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });
  },

  show() {
    setHidden(this.els.view(), false);
    setHidden(this.els.headerActions(), false);
  },

  hide() {
    setHidden(this.els.view(), true);
    setHidden(this.els.headerActions(), true);
  }
};
