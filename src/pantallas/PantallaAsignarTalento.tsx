import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../components/ui/BackButton';
import { apiClientWithToken } from '../utils/apiClient';
import Toast from '../components/ui/Toast';

type TalentoType = {
  idTalento: number;
  nombres: string;
  apellidos?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  dni: string;
  telefono?: string;
  celular?: string;
  email: string;
  estado?: string;
  idEstado?: number;
  situacion?: string;
  idSituacion?: number;
};

type RequerimientoType = {
  cliente: string;
  codigoRQ: string;
  fechaSolicitud: string;
  descripcion: string;
  estado: number;
  vacantes: number;
  idRequerimiento?: number;
};

const TableHeader: React.FC = () => (
  <thead>
    <tr className="table-header">
      <th className="table-header-cell">ID</th>
      <th className="table-header-cell">Nombres</th>
      <th className="table-header-cell">Apellidos</th>
      <th className="table-header-cell">DNI</th>
      <th className="table-header-cell">Cel</th>
      <th className="table-header-cell">Email</th>
      <th className="table-header-cell">Situación</th>
      <th className="table-header-cell">Estado</th>
      <th className="table-header-cell">Acciones</th>
    </tr>
  </thead>
);

interface TableRowProps {
  talento: TalentoType;
  onRemove: (id: number) => void;
  onUpdate: (talento: TalentoType) => void;
  disabled: boolean;
}

const TableRow: React.FC<TableRowProps> = ({ talento, onRemove, onUpdate, disabled }) => (
  <tr className="table-row">
    <td className="table-cell">{talento.idTalento}</td>
    <td className="table-cell">{talento.nombres}</td>
    <td className="table-cell">{talento.apellidos || `${talento.apellidoPaterno || ''} ${talento.apellidoMaterno || ''}`}</td>
    <td className="table-cell">{talento.dni}</td>
    <td className="table-cell">{talento.telefono || talento.celular}</td>
    <td className="table-cell">{talento.email}</td>
    <td className="table-cell">{talento.situacion || (talento.idSituacion === 1 ? 'LIBRE' : 'OCUPADO')}</td>
    <td className="table-cell">
      <span className={`badge ${talento.estado?.toUpperCase() === 'ACEPTADO' ? 'badge-green' :
        talento.estado?.toUpperCase() === 'OBSERVADO' ? 'badge-yellow' :
          ''
        }`}>
        {(talento.estado || (talento.idEstado === 1 ? 'ACEPTADO' : 'OBSERVADO')).toUpperCase()}
      </span>
    </td>
    <td className="py-3 px-4 flex gap-2 whitespace-nowrap">
      <button
        onClick={() => onUpdate(talento)}
        disabled={(talento.estado?.toUpperCase() !== 'OBSERVADO' && talento.idEstado !== 2) || disabled}
        className={`btn btn-actions ${(talento.estado?.toUpperCase() === 'OBSERVADO' || talento.idEstado === 2) && !disabled
          ? 'btn-blue'
          : 'btn-disabled'
          }`}
      >
        Actualizar
      </button>

      <button
        onClick={() => onRemove(talento.idTalento)}
        disabled={disabled}
        className={`btn btn-actions ${disabled ? 'btn-disabled': 'btn btn-red'}`}
      >
        Remover
      </button>
    </td>
  </tr>
);

interface TalentoSelectionProps {
  talent: TalentoType;
  onSelect: (talent: TalentoType) => void;
  isSelected: boolean;
}

const TalentoSelection: React.FC<TalentoSelectionProps> = ({ talent, onSelect, isSelected }) => (
  <div className="flex items-center justify-between p-4 border-b">
    <div>
      <p className="font-medium">{talent.nombres} {talent.apellidoPaterno} {talent.apellidoMaterno}</p>
    </div>
    <button
      onClick={() => onSelect(talent)}
      disabled={isSelected}
      className={`btn ${isSelected ? 'btn-disabled': 'btn-blue'}`}
    >
      {isSelected ? 'Seleccionado' : 'Seleccionar'}
    </button>
  </div>
);

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTalents: TalentoType[];
  selectedTalents: TalentoType[];
  onSelectTalent: (talent: TalentoType) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  availableTalents,
  selectedTalents,
  onSelectTalent,
  onSearch,
  searchTerm,
  setSearchTerm,
  isLoading
}) => {

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  const handleSearchSubmit = () => {
    onSearch(searchTerm);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Seleccione el talento</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex relative h-10 w-11/12">
              <img src="/assets/ic_search.svg" alt="search icon" className="absolute top-2 left-3" />
              <input
                type="text"
                placeholder="Buscar por nombre"
                className="input-search-container"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="handle-clear-search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearchSubmit}
              className="btn btn-primary"
            >
              Buscar
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Cargando talentos...
            </div>
          ) : availableTalents.length > 0 ? (
            availableTalents.map((talent) => (
              <TalentoSelection
                key={talent.idTalento}
                talent={talent}
                onSelect={onSelectTalent}
                isSelected={selectedTalents.some(t => t.idTalento === talent.idTalento)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "No se encontraron talentos con ese criterio de búsqueda" : "Ingrese un término para buscar talentos"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Confirmación</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const TalentTable: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { idRequerimiento } = location.state || { idRequerimiento: 1 };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTalents, setSelectedTalents] = useState<TalentoType[]>([]);
  const [searchResults, setSearchResults] = useState<TalentoType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requerimiento, setRequerimiento] = useState<RequerimientoType | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [dateFormatted, setDateFormatted] = useState('');
  const [selectedTalent, setSelectedTalent] = useState<TalentoType | null>(null);
  const [isTalent, setIsTalent] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage({ message, type });
  };

  const closeToast = () => {
    setToastMessage(null);
  };

  useEffect(() => {
    const fetchRequerimiento = async () => {
      try {
        setIsLoading(true);
        const response = await apiClientWithToken.get(
          `/fmi/requirement/data?idRequerimiento=${idRequerimiento}&showfiles=false`
        );

        if (response.data.idTipoMensaje === 2) {
          setRequerimiento(response.data.requerimiento);

          if (response.data.requerimiento.fechaSolicitud) {
            const date = new Date(response.data.requerimiento.fechaSolicitud);
            setDateFormatted(date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }));
          }

          if (response.data.requerimiento.lstRqTalento && response.data.requerimiento.lstRqTalento.length > 0) {
            const formattedTalents = response.data.requerimiento.lstRqTalento.map((talent: any) => ({
              idTalento: talent.idTalento,
              nombres: talent.nombresTalento,
              apellidos: talent.apellidosTalento,
              dni: talent.dni,
              telefono: talent.celular,
              celular: talent.celular,
              email: talent.email,
              estado: talent.estado,
              idEstado: talent.idEstado,
              situacion: talent.situacion,
              idSituacion: talent.idSituacion
            }));

            setSelectedTalents(formattedTalents);
            formattedTalents.length > 0 ? setIsTalent(true) : setIsTalent(false);
          }
        }
      } catch (error) {
        console.error('Error fetching requerimiento:', error);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    };

    fetchRequerimiento();
  }, [idRequerimiento]);

  const fetchTalentDetails = async (idTalento: number) => {
    try {
      setIsLoading(true);
      const response = await apiClientWithToken.get(
        `https://autfmibackendstaging-axf5cac2b3c0g0f0.brazilsouth-01.azurewebsites.net/fmi/requirement/talents/data?idTalento=${idTalento}`
      );

      if (response.data.idTipoMensaje === 2) {
        const talent = response.data.talento;
        setSelectedTalents(prev => prev.map(t =>
          t.idTalento === idTalento ?
            {
              ...t,
              nombres: talent.nombres,
              apellidos: talent.apellidos,
              dni: talent.dni,
              celular: talent.celular,
              email: talent.email,
              idSituacion: talent.idSituacion,
              situacion: talent.situacion,
              idEstado: talent.idEstado,
              estado: talent.estado
            } : t
        ));

        setSelectedTalent(talent);
      }
    } catch (error) {
      console.error('Error fetching talent details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {

    try {
      setIsLoading(true);
      const response = await apiClientWithToken.get(
        `/fmi/talent/requirement/list?nPag=1&busqueda=${term}`
      );

      if (response.data.idTipoMensaje === 2) {
        const formattedTalents = response.data.talentos.map((talent: any) => ({
          idTalento: talent.idTalento,
          nombres: talent.nombres,
          apellidoPaterno: talent.apellidoPaterno,
          apellidoMaterno: talent.apellidoMaterno,
          dni: talent.dni || '',
          email: talent.email || '',
          idEstado: 1,
          idSituacion: 1,
        }));

        setSearchResults(formattedTalents);
      }
    } catch (error) {
      console.error('Error searching talents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTalent = async (talent: TalentoType) => {
    try {
      setIsLoading(true);
      const response = await apiClientWithToken.get(
        `/fmi/requirement/talents/data?idTalento=${talent.idTalento}`
      );

      if (response.data.idTipoMensaje === 2) {
        const talentDetails = response.data.talento;

        const formattedTalent = {
          idTalento: talentDetails.idTalento,
          nombres: talentDetails.nombres,
          apellidos: talentDetails.apellidos || '',
          dni: talentDetails.dni || '',
          celular: talentDetails.celular || '',
          telefono: talentDetails.celular || '',
          email: talentDetails.email || '',
          estado: talentDetails.estado || 'OBSERVADO',
          idEstado: talentDetails.idEstado || 2,
          situacion: talentDetails.situacion || 'LIBRE',
          idSituacion: talentDetails.idSituacion || 1
        };

        setSelectedTalents(prev => [...prev, formattedTalent]);
      } else {
        const formattedTalent = {
          idTalento: talent.idTalento,
          nombres: talent.nombres,
          apellidos: talent.apellidoPaterno && talent.apellidoMaterno ?
            `${talent.apellidoPaterno} ${talent.apellidoMaterno}` :
            talent.apellidos || '',
          dni: talent.dni || '',
          telefono: talent.telefono || talent.celular || '',
          celular: talent.telefono || talent.celular || '',
          email: talent.email || '',
          estado: talent.estado?.toUpperCase() || (talent.idEstado === 1 ? 'ACEPTADO' : 'OBSERVADO'),
          situacion: talent.situacion || (talent.idSituacion === 1 ? 'LIBRE' : 'OCUPADO'),
          idEstado: talent.idEstado || 1,
          idSituacion: talent.idSituacion || 1,
        };

        setSelectedTalents(prev => [...prev, formattedTalent]);
      }
    } catch (error) {
      console.error('Error fetching talent details:', error);

      const formattedTalent = {
        idTalento: talent.idTalento,
        nombres: talent.nombres,
        apellidos: talent.apellidoPaterno && talent.apellidoMaterno ?
          `${talent.apellidoPaterno} ${talent.apellidoMaterno}` :
          talent.apellidos || '',
        dni: talent.dni || '',
        telefono: talent.telefono || talent.celular || '',
        celular: talent.telefono || talent.celular || '',
        email: talent.email || '',
        estado: talent.estado?.toUpperCase() || (talent.idEstado === 1 ? 'ACEPTADO' : 'OBSERVADO'),
        situacion: talent.situacion || (talent.idSituacion === 1 ? 'LIBRE' : 'OCUPADO'),
        idEstado: talent.idEstado || 1,
        idSituacion: talent.idSituacion || 1,
      };

      setSelectedTalents(prev => [...prev, formattedTalent]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleRemoveTalent = (id: number) => {
    setSelectedTalents(prev => prev.filter(talent => talent.idTalento !== id));
  };

  const handleUpdateTalent = (talent: TalentoType) => {
    navigate('/formDatos', { state: { talento: talent } });
  };

  const handleConfirmOpen = () => {
    const hasAcceptedTalents = selectedTalents.some(
      talent => talent.estado?.toUpperCase() === 'ACEPTADO' || talent.idEstado === 2
    );

    if (hasAcceptedTalents) {
      setIsConfirmModalOpen(true);
    } else {
      showToast('Debe seleccionar al menos un talento con estado ACEPTADO para finalizar.', 'error');
    }
  };

  const handleFinalize = async () => {
    try {
      setIsLoading(true);

      const talentos = selectedTalents.map(talent => ({
        idTalento: talent.idTalento,
        nombres: talent.nombres,
        apellidos: talent.apellidos || `${talent.apellidoPaterno || ''} ${talent.apellidoMaterno || ''}`,
        dni: talent.dni,
        celular: talent.telefono || talent.celular || '',
        email: talent.email,
        idEstado: talent.idEstado || (talent.estado === 'ACEPTADO' ? 1 : 2),
        idSituacion: talent.idSituacion || (talent.situacion === 'LIBRE' ? 1 : 2)
      }));

      const payload = {
        idRequerimiento,
        lstTalentos: talentos
      };

      const response = await apiClientWithToken.post(
        '/fmi/requirement/talents/save',
        payload
      );

      if (response.data && response.data.idTipoMensaje === 2) {
        setSavedSuccessfully(true);
        setIsConfirmModalOpen(false);
        showToast(response.data.mensaje, 'success');
      } else {
        showToast('Error al guardar los datos: ' + response.data.mensaje, 'error');
      }
    } catch (error) {
      console.error('Error saving talents:', error);
      showToast('Error al guardar los datos. Por favor, intente nuevamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => navigate(-1);

  const buttonsDisabled = savedSuccessfully || isTalent || initialLoad;

  return (
    <div className="container mx-auto p-4">

      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-semibold flex gap-2">
          <BackButton backClicked={goBack} />
          Módulo para búsqueda de talentos
        </h3>

        {/* Cuadro de requerimientos */}
        <div className="card">
          <div className="card-content">
            <p className="card-title"><span className="font-medium">Id:</span> {idRequerimiento}</p>
            <p className="card-title"><span className="font-medium">Cliente:</span> {requerimiento?.cliente || 'Cargando...'}</p>
            <p className="card-title"><span className="font-medium">Rq:</span> {requerimiento?.codigoRQ || 'Cargando...'}</p>
            <p className="card-title"><span className="font-medium">Fecha Solicitud:</span> {dateFormatted || 'Cargando...'}</p>
            <p className="card-title"><span className="font-medium">Estado:</span> {requerimiento?.estado === 1 ? 'Asignado' : 'Pendiente'}</p>
            <p className="card-title"><span className="font-medium">Vacantes:</span> {requerimiento?.vacantes || 'Cargando...'}</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between w-full pb-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setSearchResults([]);
              setIsModalOpen(true);
              handleSearch('');
            }}
            disabled={buttonsDisabled}
            className={`btn ${buttonsDisabled ? 'btn-disabled': 'btn-blue'}`}
          >
            Agregar Talento
          </button>
          <button
            onClick={handleConfirmOpen}
            disabled={
              selectedTalents.length === 0 ||
              buttonsDisabled ||
              !selectedTalents.some(t => t.idEstado === 2 || t.estado === 'ACEPTADO') ||
              selectedTalents.filter(t => t.idEstado === 2 || t.estado === 'ACEPTADO').length > (requerimiento?.vacantes || 0)
            }
            className={`btn ${selectedTalents.length === 0 || buttonsDisabled || !selectedTalents.some(t => t.idEstado === 2 || t.estado === 'ACEPTADO') ||
              selectedTalents.filter(t => t.idEstado === 2 || t.estado === 'ACEPTADO').length > (requerimiento?.vacantes || 0)
              ? 'btn-disabled'
              : 'btn-primary'
              }`}
          >
            Finalizar
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className='table-wrapper'>
          <table className="table">
            <TableHeader />
            <tbody>
              {selectedTalents.map(talento => (
                <TableRow
                  key={talento.idTalento}
                  talento={talento}
                  onRemove={handleRemoveTalent}
                  onUpdate={handleUpdateTalent}
                  disabled={buttonsDisabled}
                />
              ))}
              {selectedTalents.length === 0 && (
                <tr>
                  <td colSpan={9} className="table-empty">
                    No hay talentos seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableTalents={searchResults}
        selectedTalents={selectedTalents}
        onSelectTalent={handleSelectTalent}
        onSearch={handleSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalize}
        message="¿Está seguro que desea finalizar y guardar los talentos seleccionados?"
      />

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default TalentTable;