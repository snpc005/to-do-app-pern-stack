import React, { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiLogOut } from 'react-icons/fi';
import { getTodos, deleteTodo, updateTodo, createTodo } from '../api/todoApi';
import styles from '../App.module.css';

const ListTodos = ({ user, onLogout }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна
  const [newTodoText, setNewTodoText] = useState(''); // Текст новой задачи

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await getTodos();
      setTodos(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return; // Проверяем, что текст не пустой
    try {
      await createTodo(newTodoText);
      setNewTodoText(''); // Очищаем поле
      setIsModalOpen(false); // Закрываем модальное окно
      await fetchTodos();
    } catch (error) {
      console.error('Ошибка добавления:', error);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    await updateTodo(id, { completed: !currentStatus });
    fetchTodos();
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    setTodos(todos.filter(todo => todo.todo_id !== id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.header}>
          🕒 Мои задачи
        </h1>
        <div className={styles.userControls}>
          <span>{user}</span>
          <button onClick={onLogout} className={styles.logoutButton}>
            <FiLogOut />
          </button>
        </div>
      </div>

      <div className={styles.addForm}>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)} // Открываем модальное окно
        >
          Добавить
        </button>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalHeader}>Новая задача</h2>
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Введите текст задачи..."
              className={styles.modalInput}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button
                onClick={handleAddTodo}
                className={styles.modalButton}
                disabled={!newTodoText.trim()} // Отключаем кнопку, если текст пустой
              >
                Подтвердить
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewTodoText('');
                }}
                className={`${styles.modalButton} ${styles.cancelButton}`}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <ul className={styles.todoList}>
        {todos.map((todo) => (
          <li key={todo.todo_id} className={styles.todoItem}>
            <input
              type="checkbox"
              className={styles.todoCheckbox}
              checked={todo.completed}
              onChange={() => toggleComplete(todo.todo_id, todo.completed)}
            />
            <span className={`${styles.todoText} ${todo.completed ? 'completed' : ''}`}>
              {todo.description}
            </span>
            <div className={styles.actions}>
              <button className={styles.actionButton}>
                <FiEdit2 /> Редактировать
              </button>
              <button
                className={`${styles.actionButton} ${styles.delete}`}
                onClick={() => handleDelete(todo.todo_id)}
              >
                <FiTrash2 /> Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListTodos;