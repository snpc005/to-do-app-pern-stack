import React, { useState } from 'react';
import { updateTodo } from '../api/todoApi';

const EditTodo = ({ todo, onTodoUpdated, setError }) => {
  const [description, setDescription] = useState(todo.description);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async () => {
    if (!description.trim()) {
      setError('Введите описание задачи');
      return;
    }

    try {
      await updateTodo(todo.todo_id, description);
      setIsEditing(false);
      onTodoUpdated();
    } catch (err) {
      setError('Ошибка обновления задачи');
    }
  };

  return (
    <div style={{ flexGrow: 1 }}>
      {isEditing ? (
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleUpdate}
          onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
          autoFocus
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
          }}
        />
      ) : (
        <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer' }}>
          {todo.description}
        </span>
      )}
    </div>
  );
};

export default EditTodo;