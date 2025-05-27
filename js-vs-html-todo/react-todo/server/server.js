import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let todos = [
  { id: 1, text: 'Learn React' },
  { id: 2, text: 'Build something cool' },
];

let nextId = 3;

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const todoText = req.body.text;
  const newTodo = { id: nextId++, text: todoText };
  todos.push(newTodo);
  res.json(newTodo);
});

app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(todo => todo.id !== id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

