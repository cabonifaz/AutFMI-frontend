import { useState } from 'react';
import { TalentoType } from '../models/type/TalentoType';
import { useNavigate } from 'react-router-dom';
import useTalentos from '../hooks/useTalentos';
import Loading from '../components/loading/Loading';
import ModalModalidad from '../components/ui/ModalModalidad';

const PantallaListaTalentos = () => {
  const navigate = useNavigate();
  const [selectedTalento, selectTalento] = useState<TalentoType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { talentos, loading, currentPage, setCurrentPage, emptyList } = useTalentos();

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = (talento: TalentoType) => {
    selectTalento(talento);
    setIsModalOpen(true);
  };

  return (
    <>
      {loading && (<Loading />)}
      <div className="flex">
        <div className="w-48 h-screen fixed border-r border-gray-300 bg-white">
          <ul className="text-gray-700 flex flex-col justify-end h-screen py-2 list-none m-0 p-0">
            <li className='w-48'>
              <button type='button' className='flex gap-2 max-h-12 items-center rounded-lg w-48 px-8 py-2 hover:bg-slate-200'>
                <img src="assets/ic_logout.svg" alt="logout icon" className="max-h-8" />
                Logout
              </button>
            </li>
          </ul>
        </div>

        <div className="flex-1 p-4 ms-48">
          <div className="mb-3">
            <label htmlFor="searchInput" className="sr-only">Buscar</label>
            <input
              id="searchInput"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-gray-500 focus:outline-none"
              placeholder="🔍 Buscar"
            />
          </div>

          <div>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Nombres y Apellidos</th>
                  <th className="py-2 px-4 text-center w-32">Opciones</th>
                  <th className="py-2 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {talentos.map((talento, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="py-2 px-4">
                      <div className="flex flex-col">
                        <span>{talento.nombres + ' ' + talento.apellidos}</span>
                        <small className="text-gray-600">{talento.modalidad}</small>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        className="w-12 rounded-lg hover:bg-slate-200"
                        aria-label="Editar talento"
                        onClick={() => navigate("/formDatos", { state: { talento } })}>
                        <img src="assets/ic_edit.svg" alt="edit icon" />
                      </button>
                    </td>
                    <td className="py-2 px-4 text-center *:me-6">
                      <button
                        className={`px-4 py-1 rounded-lg text-white ${talento.esTrabajador ? 'bg-gray-300 text-slate-500' : 'bg-blue-400 hover:bg-blue-500'}`}
                        onClick={() => handleOpenModal(talento)}
                        aria-label="Ingreso de talento"
                        disabled={talento.esTrabajador}>
                        Ingreso
                      </button>
                      <button
                        className={`px-4 py-1 rounded-lg text-white ${!talento.esTrabajador ? 'bg-gray-300 text-slate-500' : 'bg-orange-500 hover:bg-orange-600'}`}
                        onClick={() => navigate('/formMovimiento', { state: { talento } })}
                        aria-label="Movimiento"
                        disabled={!talento.esTrabajador}>
                        Movimiento
                      </button>
                      <button
                        className={`px-4 py-1 rounded-lg text-white ${!talento.esTrabajador ? 'bg-gray-300 text-slate-500' : 'bg-red-500 hover:bg-red-600'}`}
                        onClick={() => navigate('/formCese', { state: { talento } })}
                        aria-label="Dar de baja"
                        disabled={!talento.esTrabajador}>
                        Dar de baja
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 my-2">
              <button
                className={`px-4 py-2 rounded-lg text-white ${currentPage === 1 || emptyList ? 'bg-slate-500 cursor-default' : 'bg-slate-800 hover:bg-slate-900'}`}
                onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
                disabled={currentPage === 1 || emptyList}>
                Anterior
              </button>
              <span>Página {currentPage}</span>
              <button
                className={`px-4 py-2 rounded-lg text-white ${talentos.length < 15 || emptyList ? 'bg-slate-500 cursor-default' : 'bg-slate-800 hover:bg-slate-900'}`}
                onClick={() => setCurrentPage(prevPage => prevPage + 1)}
                disabled={emptyList || talentos.length < 15}>
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalModalidad
        talento={selectedTalento!}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default PantallaListaTalentos;
