import axios from 'axios';

// Настройка базового URL для запросов
const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://dailypl-api.onrender.com' : 'http://localhost:5000',
});

// Добавление заголовка Authorization для авторизованных запросов
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Получение списка задач
export const getTodos = async () => {
  try {
    const response = await instance.get('/api/todos');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка при получении списка задач');
  }
};

// Создание новой задачи
export const createTodo = async (description) => {
  try {
    const response = await instance.post('/api/todos', { description });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка при создании задачи');
  }
};

// Обновление задачи (статус или описание)
export const updateTodo = async (todoId, updates) => {
  try {
    const response = await instance.put(`/api/todos/${todoId}`, updates);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка при обновлении задачи');
  }
};

// Удаление задачи
export const deleteTodo = async (todoId) => {
  try {
    const response = await instance.delete(`/api/todos/${todoId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка при удалении задачи');
  }
};