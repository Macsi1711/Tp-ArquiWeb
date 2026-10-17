import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { UsuarioActivoProvider } from './context/UsuarioActivo.jsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UsuarioActivoProvider>
        <App />
      </UsuarioActivoProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
