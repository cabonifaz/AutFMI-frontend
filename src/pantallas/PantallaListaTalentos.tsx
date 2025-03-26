import { useRef, useState } from 'react';
import { TalentoType } from '../models/type/TalentoType';
import { useNavigate } from 'react-router-dom';
import useTalentos from '../hooks/useTalentos';
import ModalModalidad from '../components/ui/ModalModalidad';
import { enqueueSnackbar } from 'notistack';
import useDownloadPdf from '../hooks/useDownloadPdf';
import { PantallaWrapper } from './PantallaWrapper';
import { useMenu } from '../context/MenuContext';
import { Loading } from '../components/ui/Loading';

const PantallaListaTalentos = () => {
  const navigate = useNavigate();
  const { toggleMenu } = useMenu();
  const { fetchAndOpenPdf, loading: downloadPdfLoading } = useDownloadPdf();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTalento, selectTalento] = useState<TalentoType | null>(null);
  const { talentos, loading, currentPage, setCurrentPage, emptyList, setSearchTerm } = useTalentos();

  const textSearchRef = useRef<HTMLInputElement>(null);

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
    if (textSearchRef.current) {
      setSearchTerm(textSearchRef.current.value);
      setCurrentPage(1);
    }
  };

  return (
    <>
      {loading && (<Loading overlayMode={true} />)}
      {downloadPdfLoading && (<Loading overlayMode={true} />)}
      <PantallaWrapper>
        <div className="mb-3 flex gap-2 md:gap-4">
          <div className="space-y-1 cursor-pointer self-center ms-1 lg:hidden" onClick={toggleMenu}>
            <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
            <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
            <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
          </div>
          <label htmlFor="searchInput" className="sr-only">Buscar</label>
          <input
            id="searchInput"
            type="text"
            ref={textSearchRef}
            className="w-full input"
            placeholder="🔍 Buscar"
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSearch}>
            Buscar
          </button>
        </div>
        <div>
          <div className='table-container'>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
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
                    <td className="py-5 lg:px-4 flex flex-col md:flex-row *:w-[90%] *:md:w-fit gap-2 justify-center">
                      <button
                        className={`btn ${talento.esTrabajador ? 'btn-disabled' : 'btn-blue'}`}
                        onClick={() => handleOpenModal(talento)}
                        aria-label="Ingreso de talento"
                        disabled={talento.esTrabajador}>
                        Ingreso
                      </button>
                      <button
                        className={`btn ${!talento.esTrabajador ? 'btn-disabled' : 'btn-orange'}`}
                        onClick={() => navigate('/formMovimiento', { state: { talento } })}
                        aria-label="Movimiento"
                        disabled={!talento.esTrabajador}>
                        Movimiento
                      </button>
                      <button
                        className={`btn ${!talento.esTrabajador ? 'btn-disabled' : 'btn-red'}`}
                        onClick={() => navigate('/formCese', { state: { talento } })}
                        aria-label="Cese"
                        disabled={!talento.esTrabajador}>
                        Cese
                      </button>
                      <button
                        className={`btn ${!talento.esTrabajador ? 'btn-disabled' : 'btn-primary'}`}
                        onClick={() => navigate('/formSolicitarEquipo', { state: { talento } })}
                        aria-label="equipo"
                        disabled={!talento.esTrabajador}>
                        Solicitar equipo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {talentos.length > 0 && (
            <div className="flex justify-center items-center gap-4 my-2">
              <button
                className={`btn ${currentPage === 1 || emptyList ? 'btn-disabled' : 'btn-blue'}`}
                onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
                disabled={currentPage === 1 || emptyList}>
                Anterior
              </button>
              <span>Página {currentPage}</span>
              <button
                className={`btn ${talentos.length < 15 || emptyList ? 'btn-disabled' : 'btn-blue'}`}
                onClick={() => setCurrentPage(prevPage => prevPage + 1)}
                disabled={emptyList || talentos.length < 15}>
                Siguiente
              </button>
            </div>
          )}
        </div>
      </PantallaWrapper>

      <ModalModalidad
        talento={selectedTalento!}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default PantallaListaTalentos;
