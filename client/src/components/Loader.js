import React from 'react';
import styles from '../App.module.css';

const Loader = ({ size = 40, color = '#3498db' }) => (
  <div className={styles.loaderContainer}>
    <div 
      className={styles.loader} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        border: `4px solid #f3f3f3`,
        borderTop: `4px solid ${color}`,
        borderRadius: '50%'
      }}
    ></div>
  </div>
);

export default Loader;