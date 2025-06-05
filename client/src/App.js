import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import AuthPage from './pages/AuthPage';
import ListTodos from './components/ListTodos';
import styles from './App.module.css';

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return token && username ? { token, username } : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (auth?.token) {
      axios.defaults.headers.common['Authorization'] = auth.token;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [auth]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth(null);
    navigate('/login');
  };

  return (
    <div className={styles.appContainer}>
      <Routes>
        <Route 
          path="/login" 
          element={auth ? <Navigate to="/" /> : <AuthPage setAuth={setAuth} />} 
        />
        <Route 
          path="/" 
          element={
            auth ? (
              <ListTodos 
                user={auth.username} 
                onLogout={handleLogout} 
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </div>
  );
}

export default App;