import { useState } from 'react';
import { TalentoType } from '../models/type/TalentoType';
import { useNavigate } from 'react-router-dom';
import useTalentos from '../hooks/useTalentos';
import Loading from '../components/loading/Loading';
import ModalModalidad from '../components/ui/ModalModalidad';
import { useAuth } from '../context/AuthContext';
import { enqueueSnackbar } from 'notistack';
import useDownloadPdf from '../hooks/useDownloadPdf';

const PantallaListaTalentos = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { fetchAndOpenPdf, loading: downloadPdfLoading } = useDownloadPdf();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedTalento, selectTalento] = useState<TalentoType | null>(null);
  const { talentos, loading, currentPage, setCurrentPage, emptyList, setSearchTerm } = useTalentos();

  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenModal = (talento: TalentoType) => {
    if (talento.idUsuarioTalento === 0) {
      enqueueSnackbar('Debe actualizar los datos del talento', { variant: 'warning' });
      return;
    };
    selectTalento(talento);
    setIsModalOpen(true);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  return (
    <>
      {loading && (<Loading />)}
      {downloadPdfLoading && (<Loading />)}
      <div className="flex">
        <div className={`bg-black absolute top-0 left-20 bottom-0 right-0 z-10 opacity-50 md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-[125%]'} transition-transform duration-300`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}>
        </div>
        <div className={`w-20 h-screen fixed border-r border-gray-300 bg-white md:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-20'} transition-transform duration-300`}>
          <ul className="text-gray-700 flex flex-col justify-between h-screen py-2 list-none m-0 p-0">
            <li>
              <div className="space-y-1 cursor-pointer justify-self-center ms-1 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
                <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
                <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
              </div>
            </li>
            <li className='w-20 group relative'>
              <button onClick={logout} type='button' className='flex gap-2 max-h-12 items-center rounded-lg px-6 py-2 hover:bg-slate-100'>
                <img src="assets/ic_logout.svg" alt="logout icon" className="max-h-8" />
              </button>
              <div className="absolute left-20 top-1/2 -translate-y-1/2 bg-gray-700 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-nowrap">
                Cerrar sesión
              </div>
            </li>
          </ul>
        </div>

        <div className="flex-1 p-4 md:ms-20">
          <div className="mb-3 flex gap-2 md:gap-4">
            <div className="space-y-1 cursor-pointer self-center ms-1 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
              <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
              <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
            </div>
            <label htmlFor="searchInput" className="sr-only">Buscar</label>
            <input
              id="searchInput"
              type="text"
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-gray-300 focus:outline-none"
              placeholder="🔍 Buscar"
            />
            <button type="button" className="border bg-slate-700 rounded-lg px-4 md:px-8 text-white hover:bg-slate-600" onClick={handleSearch}>Buscar</button>
          </div>

          <div>
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-4 text-left">Nombres y Apellidos</th>
                  <th className="py-2 px-4 text-center ">Opciones</th>
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
                    <td className="text-center">
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          className="w-12 rounded-lg hover:bg-slate-200"
                          aria-label="Editar talento"
                          onClick={() => navigate("/formDatos", { state: { talento } })}>
                          <img src="assets/ic_edit.svg" alt="edit icon" />
                        </button>
                        <button
                          className="w-12 rounded-lg hover:bg-slate-200 p-2"
                          aria-label="Descargar PDF"
                          onClick={() => fetchAndOpenPdf(talento.idTipoHistorial, talento.idUsuarioTalento)}
                        >
                          <img src="assets/ic_pdf.svg" alt="download pdf icon" />
                        </button>
                      </div>
                    </td>
                    <td className="py-5 lg:px-4 flex flex-col md:flex-row *:w-full *:md:w-fit gap-2 lg:gap-6 justify-center">
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
                        aria-label="Cese"
                        disabled={!talento.esTrabajador}>
                        Cese
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {talentos.length > 0 && (
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
            )}
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
