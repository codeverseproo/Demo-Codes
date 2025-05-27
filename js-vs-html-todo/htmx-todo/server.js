const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

let todos = [
  { id: 1, text: 'Learn React' },
  { id: 2, text: 'Build something cool' }
];
let nextId = 3;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Render full HTML page
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>HTMX Todo App</title>
      <script src="https://unpkg.com/htmx.org@1.9.6"></script>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <h1>HTMX Todo App</h1>
      
      <form hx-post="/todos" hx-target="#todo-list" hx-swap="beforeend">
        <input type="text" name="todo" placeholder="Add a new todo" required />
        <button type="submit">Add</button>
      </form>

      <div id="todo-list">
        ${todos.map(todo => renderTodoItem(todo)).join('')}
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Add a todo
app.post('/todos', (req, res) => {
  const todoText = req.body.todo;
  const newTodo = { id: nextId++, text: todoText };
  todos.push(newTodo);
  res.send(renderTodoItem(newTodo));
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(todo => todo.id !== id);
  res.send('');
});

// Render a single todo item
function renderTodoItem(todo) {
  return `
    <div class="todo-item">
      <span>${todo.text}</span>
      <button 
        hx-delete="/todos/${todo.id}" 
        hx-target="closest .todo-item" 
        hx-swap="outerHTML">Delete</button>
    </div>
  `;
}

app.listen(PORT, () => {
  console.log(`HTMX Todo App running at http://localhost:${PORT}`);
});

