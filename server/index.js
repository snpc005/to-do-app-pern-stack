const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

// Настройка CORS
app.use(cors({
  origin: 'https://dailypl-client.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Парсинг JSON
app.use(express.json());

// Эндпоинт для получения всех задач
app.get('/api/todos', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Заглушка для user_id
    const todos = await pool.query('SELECT * FROM todo WHERE user_id = $1', [userId]);
    res.json(todos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для создания задачи
app.post('/api/todos', async (req, res) => {
  try {
    const { description } = req.body;
    const userId = req.user?.id || 1; // Заглушка для user_id
    if (!description) {
      return res.status(400).json({ error: 'Описание задачи обязательно' });
    }

    const newTodo = await pool.query(
      'INSERT INTO todo (description, user_id) VALUES ($1, $2) RETURNING *',
      [description, userId]
    );
    res.status(201).json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для обновления задачи
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body;
    const userId = req.user?.id || 1; // Заглушка
    const updateTodo = await pool.query(
      'UPDATE todo SET description = $1, completed = $2 WHERE todo_id = $3 AND user_id = $4 RETURNING *',
      [description, completed, id, userId]
    );
    if (updateTodo.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    res.json(updateTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для удаления задачи
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1; // Заглушка
    const deleteTodo = await pool.query(
      'DELETE FROM todo WHERE todo_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (deleteTodo.rows.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    res.json({ message: 'Задача удалена' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const PORT = process.env.PORT || 5432;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));