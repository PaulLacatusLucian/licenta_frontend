import React from 'react';
import ReactDOM from 'react-dom/client';  // Importă ReactDOM pentru a monta aplicația
import './index.css';  // Importă fișierul CSS, care conține stilurile Tailwind și personalizate
import App from './App';  // Importă componenta principală App

// Crează un root div în DOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Montează aplicația React pe elementul cu id-ul 'root'
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
