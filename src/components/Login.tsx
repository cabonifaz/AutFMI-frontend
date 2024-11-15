import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const manejarInicioSesion = () => {
    if (usuario && contrasena) {
      onLogin();
    } else {
      alert('Por favor, ingrese usuario y contraseña');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="border p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">AutFMI</h2>
        <div className="form-group">
          <label htmlFor="usuario">Usuario:</label>
          <input
            type="text"
            id="usuario"
            className="form-control"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="contrasena">Contraseña:</label>
          <input
            type="password"
            id="contrasena"
            className="form-control"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </div>
        <button className="btn btn-primary w-100 mt-4" onClick={manejarInicioSesion}>
          Iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default Login;
