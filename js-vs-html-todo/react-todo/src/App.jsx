import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    axios.get(`${API}/todos`).then(res => {
      setTodos(res.data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const res = await axios.post(`${API}/todos`, { text: newTodo });
    setTodos([...todos, res.data]);
    setNewTodo('');
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/todos/${id}`);
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>React Todo App</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          style={{ padding: '0.5rem', width: '80%' }}
        />
        <button type="submit" style={{ padding: '0.5rem' }}>Add</button>
      </form>
      <div>
        {todos.map(todo => (
          <div key={todo.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', background: '#f0f0f0', padding: '0.5rem' }}>
            <span>{todo.text}</span>
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

