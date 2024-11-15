import React, { useState } from 'react';
import Login from './components/Login';
import ListaUsuarios from './components/ListaUsuarios';
import PantallaIngreso from './components/PantallaIngreso';
import './App.css';

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [pantalla, setPantalla] = useState('login');
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<any>(null);

  const manejarAutenticacion = () => {
    setAutenticado(autenticado);
    setPantalla('listaUsuarios');
  };

  const manejarSeleccionColaborador = (colaborador: any) => {
    setColaboradorSeleccionado(colaborador);
    setPantalla('pantallaIngreso');
  };

  return (
    <div className="App">
      {pantalla === 'login' && <Login onLogin={manejarAutenticacion} />}
      {pantalla === 'listaUsuarios' && (
        <ListaUsuarios onSeleccionColaborador={manejarSeleccionColaborador} />
      )}
      {pantalla === 'pantallaIngreso' && (
        <PantallaIngreso colaborador={colaboradorSeleccionado} onCancelar={() => setPantalla('listaUsuarios')} />
      )}
    </div>
  );
}

export default App;
