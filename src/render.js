import escapeHtml from "escape-html";

const STYLE = `
  * { box-sizing: border-box; }
  input[type=text] { min-width: 0; }
  li span { min-width: 0; overflow-wrap: anywhere; }
  li form { flex-shrink: 0; }
  footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #8884; font-size: .875rem; }
  a { color: #2457bd; }
  :focus-visible { outline: 2px solid #2457bd; outline-offset: 3px; }

  :root { color-scheme: light; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    margin: 0;
    padding: 3rem 1rem;
    background: #f7f7f8;
    color: #1c1c1e;
  }
  main { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 1.5rem; }
  form.add { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
  input[type="text"] {
    flex: 1;
    padding: 0.6rem 0.75rem;
    font: inherit;
    border: 1px solid #c9c9cf;
    border-radius: 6px;
    background: #fff;
    color: inherit;
  }
  button {
    padding: 0.6rem 1rem;
    font: inherit;
    border: 1px solid #c9c9cf;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
  }
  button.primary { background: #1c1c1e; border-color: #1c1c1e; color: #fff; }
  ul { list-style: none; margin: 0; padding: 0; }
  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #fff;
    border: 1px solid #e3e3e7;
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }
  li span { flex: 1; overflow-wrap: anywhere; }
  li form { margin: 0; }
  li button { padding: 0.35rem 0.7rem; font-size: 0.875rem; }
  p.empty { color: #6b6b70; }
`;

function renderItem(todo) {
  return `      <li>
        <span>${escapeHtml(todo.title)}</span>
        <form method="post" action="/delete">
          <input type="hidden" name="id" value="${escapeHtml(todo.id)}">
          <button type="submit">Delete</button>
        </form>
      </li>`;
}

export function renderPage(todos) {
  const list = todos.length
    ? `    <ul>\n${todos.map(renderItem).join("\n")}\n    </ul>`
    : `    <p class="empty">No items yet.</p>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Express Todo | AppHaven</title>
  <style>${STYLE}</style>
</head>
<body>
  <main>
    <h1>Express Todo</h1><p>A shared task list, built with Express and PostgreSQL.</p>
    <form class="add" method="post" action="/add">
      <input type="text" name="title" aria-label="New task" placeholder="What needs doing?" maxlength="200" required autofocus>
      <button class="primary" type="submit">Add</button>
    </form>
${list}
  <footer><p>Deploy your own on <a href="https://apphaven.eu">AppHaven</a> · <a href="https://github.com/apphaven-eu/example-node">Source code</a> · <a href="https://docs.apphaven.eu/getting-started">Deployment guide</a></p></footer></main>
</body>
</html>
`;
}
