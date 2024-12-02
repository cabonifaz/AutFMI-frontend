import { useState, FC } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ModalIngreso from '../ModalModalidad';
import { ColaboradorType } from '../../types/ColaboradorType';
import { useNavigate } from 'react-router-dom';

const ListaUsuarios: FC = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [selectedColab, selectColab] = useState<ColaboradorType | null>(null);
  const navigate = useNavigate();

  const colaboradores = [
    { nombre: 'Katerin Valeria', estado: 'Rxh', unidad: 'Unidad 1' },
    { nombre: 'Marco Botton', estado: 'Planilla', unidad: 'Unidad 2' },
    { nombre: 'Mariah Maclachlan', estado: 'Planilla', unidad: 'Unidad 3' },
    { nombre: 'Valerie Liberty', estado: 'Planilla', unidad: 'Unidad 4' }
  ];

  const manejarMostrarModal = (colab: ColaboradorType) => {
    selectColab(colab);
    setMostrarModal(true);
  };

  const manejarCerrarModal = () => {
    setMostrarModal(false);
  };

  const navigateTo = (pantalla: string, colab: ColaboradorType) => {
    navigate(pantalla, { state: { colab } });
  };

  return (
    <div className="container mt-5">
      <div className="mb-3">
        <label htmlFor="searchInput" className="form-label visually-hidden">Buscar</label>
        <input
          id="searchInput"
          type="text"
          className="form-control"
          placeholder="🔍 Buscar"
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nombre (Estado)</th>
              <th className="text-center" style={{ width: '120px' }}>Opciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((colab, index) => (
              <tr key={index}>
                <td>
                  {colab.nombre}
                  <br />
                  <small>{colab.estado}</small>
                </td>
                <td
                  className="d-flex justify-content-center align-items-center"
                  style={{ width: '120px', minHeight: '52px' }}>
                  <button
                    className="btn btn-link p-0 d-flex justify-content-center align-items-center"
                    style={{ minHeight: '52px' }}
                    aria-label="Editar usuario"
                    onClick={() => { navigateTo('/pantallaDatos', colab); }}>
                    <i className="bi bi-pencil-fill fs-4 text-muted"></i>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => { manejarMostrarModal(colab); }}
                    aria-label="Ingreso de colaborador">
                    Ingreso
                  </button>
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={() => { navigateTo('/pantallaMovimiento', colab); }}
                    aria-label="Movimiento">
                    Movimiento
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => { navigateTo('/pantallaCese', colab); }}
                    aria-label="Dar de baja">
                    Dar de baja
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalIngreso
        mostrar={mostrarModal}
        manejarCerrar={manejarCerrarModal}
        colab={selectedColab!}
      />
    </div>
  );
};

export default ListaUsuarios;
