import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


const ListaUsuarios: React.FC = () => {
  const usuarios = [
    { nombre: 'Katerin Valeria', estado: 'Rxh' },
    { nombre: 'Marco Botton', estado: 'Planilla' },
    { nombre: 'Mariah Maclachlan', estado: 'Planilla' },
    { nombre: 'Valerie Liberty', estado: 'Planilla' }
  ];

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
                <button className="btn btn-outline-secondary me-2">Ingreso</button>
                <button className="btn btn-outline-secondary me-2">Movimiento</button>
                <button className="btn btn-outline-secondary">Dar de baja</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaUsuarios;
