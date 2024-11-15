import React, { useState } from 'react';
import Login from './components/Login';
import ListaUsuarios from './components/ListaUsuarios';
import './App.css';

function App() {
  const [autenticado, setAutenticado] = useState(false);

  const manejarAutenticacion = () => {
    setAutenticado(true);
  };

  return (
    <div className="App">
      {autenticado ? <ListaUsuarios /> : <Login onLogin={manejarAutenticacion} />}
    </div>
  );
}

export default App;
