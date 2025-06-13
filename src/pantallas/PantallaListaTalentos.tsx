import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTalentos from '../hooks/useTalentos';
import { PantallaWrapper } from './PantallaWrapper';
import { useMenu } from '../context/MenuContext';
import { Loading } from '../components/ui/Loading';
import { TalentoType } from '../models/type/TalentoType';
import { ModalArchivos } from '../components/ui/ModalArchivos';

const PantallaListaTalentos = () => {
  const navigate = useNavigate();
  const { toggleMenu } = useMenu();
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [currentTalent, setCurrentTalent] = useState<TalentoType | null>(null)
  const { talentos, loading, currentPage, setCurrentPage, emptyList, setSearchTerm } = useTalentos();

  const textSearchRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (textSearchRef.current) {
      setSearchTerm(textSearchRef.current.value);
      setCurrentPage(1);
    }
  };

  const handleFilesButtonClick = (talento: TalentoType) => {
    // fetchAndOpenPdf(talento.idTipoHistorial, talento.idTalento)
    setCurrentTalent(talento);
    setShowFilesModal(true);
  }

  const handleModalArchivoClose = () => {
    setCurrentTalent(null);
    setShowFilesModal(false);
  }

  return (
    <>
      {showFilesModal && (
        <ModalArchivos
          isOpen={showFilesModal}
          onClose={handleModalArchivoClose}
          talento={currentTalent}
        />
      )}
      {loading && (<Loading overlayMode={true} />)}
      <PantallaWrapper>
        <div className="p-2">
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
              <table className="table">
                <thead className="bg-gray-50">
                  <tr className="table-header">
                    <th className="table-header-cell">Nombres y Apellidos</th>
                    <th className="table-header-cell">Opciones</th>
                    <th className="table-header-cell text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {talentos.map((talento, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="table-cell">
                        <div className="flex flex-col">
                          <span>{talento.nombres + ' ' + talento.apellidos}</span>
                          <small className="text-gray-600">{talento.modalidad}</small>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className='flex gap-2'>
                          {/* FILE BUTTONS */}
                          <button
                            className="w-12 rounded-lg hover:bg-slate-200 p-2"
                            aria-label="Descargar PDF"
                            onClick={handleFilesButtonClick.bind(null, talento)}
                          >
                            <img src="assets/ic_pdf.svg" alt="download pdf icon" />
                          </button>
                        </div>
                      </td>
                      <td className="py-5 lg:px-4 flex flex-col md:flex-row md:justify-center *:w-[90%] *:md:w-fit gap-2 justify-center">
                        <button
                          className={`btn btn-orange`}
                          onClick={() => navigate('/formMovimiento', { state: { talento } })}
                          aria-label="Movimiento">
                          Movimiento
                        </button>
                        <button
                          className={`btn btn-red`}
                          onClick={() => navigate('/formCese', { state: { talento } })}
                          aria-label="Cese">
                          Cese
                        </button>
                        <button
                          className={`btn btn-primary`}
                          onClick={() => navigate('/formSolicitarEquipo', { state: { talento } })}
                          aria-label="equipo">
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
        </div>
      </PantallaWrapper>
    </>
  );
};

export default PantallaListaTalentos;
