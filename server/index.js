require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// Настройка PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'todos',
  password: process.env.DB_PASSWORD || 'wls51',
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Проверка подключения к БД
pool.on('connect', () => {
  console.log('Подключение к БД установлено');
});

pool.on('error', (err) => {
  console.error('Неожиданная ошибка подключения к БД:', err);
  process.exit(-1);
});

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verify error:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      username: newUser.rows[0].username 
    });

  } catch (err) {
    console.error('Ошибка регистрации:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      username: user.rows[0].username 
    });

  } catch (err) {
    console.error('Ошибка авторизации:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение списка пользователей (для отладки)
app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await pool.query(
      "SELECT id, username, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(allUsers.rows);
  } catch (err) {
    console.error('Ошибка получения пользователей:', err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Маршруты для задач
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const allTodos = await pool.query(
      "SELECT * FROM todo WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(allTodos.rows);
  } catch (err) {
    console.error('Ошибка получения задач:', err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post('/api/todos', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todo (description, user_id) VALUES ($1, $2) RETURNING *",
      [description, req.user.id]
    );
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error('Ошибка создания задачи:', err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, completed } = req.body;
    
    const updateTodo = await pool.query(
      "UPDATE todo SET description = $1, completed = $2 WHERE todo_id = $3 AND user_id = $4 RETURNING *",
      [description, completed, id, req.user.id]
    );
    
    if (updateTodo.rows.length === 0) {
      return res.status(404).json({ error: "Задача не найдена" });
    }
    
    res.json(updateTodo.rows[0]);
  } catch (err) {
    console.error('Ошибка обновления задачи:', err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query(
      "DELETE FROM todo WHERE todo_id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );
    
    if (deleteTodo.rows.length === 0) {
      return res.status(404).json({ error: "Задача не найдена" });
    }
    
    res.json({ message: "Задача удалена" });
  } catch (err) {
    console.error('Ошибка удаления задачи:', err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Проверка валидности токена
app.get('/api/validate-token', authenticateToken, (req, res) => {
  res.json({ valid: true, user: { id: req.user.id } });
});

// Статические файлы для фронтенда
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});