# TodoPDA — Crónica de Produtividade (Frontend)

Frontend estático (HTML/CSS/JS **sem frameworks**) para consumir a API publicada em `https://todopda.onrender.com/api`.

## Rodar localmente

### Opção A — VS Code Live Server
1. Abra a pasta `todoPDA-frontend/` no VS Code
2. Clique com o botão direito em `index.html` → **Open with Live Server**

### Opção B — Python (http.server)
Na raiz do projeto:

```bash
python -m http.server 5173
```

Acesse:
- `http://localhost:5173/`

## Configuração
A API já está pronta e apontada no código:

- Base URL: `https://todopda.onrender.com`
- Prefixo: `/api`

Ajuste em `src/js/config.js` se necessário.

## Fluxos e endpoints usados (JWT)

- `POST /api/auth/register` `{ nome, email, senha }` → `{ user, token }`
- `POST /api/auth/login` `{ email, senha }` → `{ user, token }`

Rotas protegidas com `Authorization: Bearer <token>`:
- `GET /api/tarefas?status=...`
- `POST /api/tarefas`
- `PUT /api/tarefas/:id`
- `PATCH /api/tarefas/:id/status`
- `DELETE /api/tarefas/:id`

Sessão persistida no `localStorage` como:
- `todopda.session` → `{ user, token }`

## Checklist de acessibilidade (WCAG 2.2)

Implementado:

- Skip-link funcional para `#main`
- `:focus-visible` destacado (sem remover outline sem alternativa)
- Região de alertas com `aria-live="polite"` e toasts com `role="status"` / `role="alert"`
- Navegação completa por teclado (Tab)
- Modais com:
  - foco inicial no primeiro campo
  - **trap focus**
  - **ESC fecha**
  - restaura foco ao fechar
  - backdrop click fecha (não bloqueia o usuário)
- Inputs com `<label for>` e mensagens auxiliares
- Ações com `aria-label` coerente (editar/apagar/alterar status)
- Status exibido por **texto** (não depende só de cor)
- Botão de alto contraste / baixa visão:
  - `aria-pressed`
  - persiste no `localStorage` (`todopda.vision`)
  - aumenta fonte e reforça contraste via tokens

VLibras:
- Widget incluído conforme script oficial. Falhas no carregamento não quebram o app.

## Deploy estático

Compatível com:
- GitHub Pages
- Netlify
- Vercel

Basta publicar o conteúdo do repositório (não há build).
