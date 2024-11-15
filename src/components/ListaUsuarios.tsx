import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ModalIngreso from './ModalIngreso';

interface ListaUsuariosProps {
  onSeleccionColaborador: (colaborador: any) => void;
}

const ListaUsuarios: React.FC<ListaUsuariosProps> = ({ onSeleccionColaborador }) => {
  const [mostrarModal, setMostrarModal] = useState(false);

  const usuarios = [
    { nombre: 'Katerin Valeria', estado: 'Rxh', unidad: 'Unidad 1' },
    { nombre: 'Marco Botton', estado: 'Planilla', unidad: 'Unidad 2' },
    { nombre: 'Mariah Maclachlan', estado: 'Planilla', unidad: 'Unidad 3' },
    { nombre: 'Valerie Liberty', estado: 'Planilla', unidad: 'Unidad 4' }
  ];

  const manejarMostrarModal = () => {
    setMostrarModal(true);
  };

  const manejarCerrarModal = () => {
    setMostrarModal(false);
  };

  return (
    <div className="container mt-5">
      <input type="text" className="form-control mb-3" placeholder="🔍 Buscar" />
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre (Estado)</th>
            <th>Opciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario, index) => (
            <tr key={index}>
              <td>
                {usuario.nombre}
                <br />
                <small>{usuario.estado}</small>
              </td>
              <td>
                <button className="btn btn-link p-0">
                  <i className="bi bi-file-earmark-text-fill"></i>
                </button>
              </td>
              <td>
                <button className="btn btn-outline-secondary me-2" onClick={() => { manejarMostrarModal(); onSeleccionColaborador(usuario); }}>Ingreso</button>
                <button className="btn btn-outline-secondary me-2">Movimiento</button>
                <button className="btn btn-outline-secondary">Dar de baja</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalIngreso mostrar={mostrarModal} manejarCerrar={manejarCerrarModal} />
    </div>
  );
};

export default ListaUsuarios;
