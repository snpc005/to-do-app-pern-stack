import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';
import styles from '../App.module.css';

const AuthPage = ({ setAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (password.length < 6) return 'Пароль должен быть не менее 6 символов';
    if (!/\d/.test(password)) return 'Пароль должен содержать цифру';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { username, password, confirmPassword } = formData;
      
      if (!username.trim() || !password.trim()) {
        throw new Error('Заполните все поля');
      }

      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error('Пароли не совпадают');
        }
        const passwordError = validatePassword(password);
        if (passwordError) throw new Error(passwordError);
      }

      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await axios.post(endpoint, { 
        username: username.trim(),
        password 
      }, {
        baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      
      setAuth({
        token: response.data.token,
        username: response.data.username
      });
      
      navigate('/', { replace: true });
      return;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Ошибка авторизации:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className={styles.authContainer}> {/* Меняем на authContainer */}
      <h1 className={styles.header}>
        {isLogin ? 'Вход' : 'Регистрация'}
      </h1>
      
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <FiUser style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#95a5a6'
            }} />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Имя пользователя"
              className={styles.input}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <FiLock style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#95a5a6'
            }} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Пароль"
              className={styles.input}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <FiLock style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#95a5a6'
              }} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Подтвердите пароль"
                className={styles.input}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
              Пароль должен содержать ≥6 символов и цифру
            </div>
          </div>
        )}

        {error && (
          <div style={{
            color: 'var(--error)',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className={styles.addButton}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
        </button>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: '#7f8c8d'
        }}>
          <button
            type="button"
            onClick={toggleForm}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem'
            }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            <FiArrowRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;