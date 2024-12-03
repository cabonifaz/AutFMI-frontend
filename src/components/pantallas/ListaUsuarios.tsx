import { useState, FC } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ModalIngreso from '../ModalModalidad';
import { TalentoType } from '../../types/TalentoType';
import { useNavigate } from 'react-router-dom';
import useTalentos from '../../hooks/useTalentos';
import Loading from '../loading/Loading';

const ListaUsuarios: FC = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [selectedTalento, selectTalento] = useState<TalentoType | null>(null);
  const navigate = useNavigate();
  const { talentos, loading } = useTalentos();

  const manejarMostrarModal = (talento: TalentoType) => {
    selectTalento(talento);
    setMostrarModal(true);
  };

  const manejarCerrarModal = () => {
    setMostrarModal(false);
  };

  const navigateTo = (pantalla: string, talento: TalentoType) => {
    if (pantalla.includes('Ingreso') && !talento.perteneceEmpresa) {
      manejarMostrarModal(talento);
      return;
    }

    navigate(pantalla, { state: { talento } });
  };

  if (loading) {
    return <Loading />;
  }

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
            {talentos.map((talento, index) => (
              <tr key={index}>
                <td>
                  {talento.nombres + ' ' + talento.apellidos}
                  <br />
                  <small>{talento.modalidad}</small>
                </td>
                <td
                  className="d-flex justify-content-center align-items-center"
                  style={{ width: '120px', minHeight: '52px' }} >
                  <button
                    className="btn btn-link p-0 d-flex justify-content-center align-items-center"
                    style={{ minHeight: '52px' }}
                    aria-label="Editar talento"
                    onClick={() => { navigateTo('/pantallaDatos', talento); }}>
                    <i className="bi bi-pencil-fill fs-4 text-muted"></i>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => { navigateTo('/pantallaIngreso', talento); }}
                    aria-label="Ingreso de talento">
                    Ingreso
                  </button>
                  <button
                    className="btn btn-outline-secondary me-2"
                    onClick={() => { navigateTo('/pantallaMovimiento', talento); }}
                    aria-label="Movimiento">
                    Movimiento
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => { navigateTo('/pantallaCese', talento); }}
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
        talento={selectedTalento!}
      />
    </div>
  );
};

export default ListaUsuarios;
