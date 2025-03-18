import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/ui/BackButton';

// Types
type TalentoType = {
  idTalento: number;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  estado: string;
  situacion: string;
};

// Components
const TableHeader: React.FC = () => (
  <thead>
    <tr className="bg-gray-100 text-gray-700 text-sm">
      <th className="py-3 px-4 text-left font-semibold">ID</th>
      <th className="py-3 px-4 text-left font-semibold">Nombres</th>
      <th className="py-3 px-4 text-left font-semibold">Apellidos</th>
      <th className="py-3 px-4 text-left font-semibold">DNI</th>
      <th className="py-3 px-4 text-left font-semibold">Cel</th>
      <th className="py-3 px-4 text-left font-semibold">Email</th>
      <th className="py-3 px-4 text-left font-semibold">Situación</th>
      <th className="py-3 px-4 text-left font-semibold">Estado</th>
      <th className="py-3 px-4 text-left font-semibold">Acciones</th>
    </tr>
  </thead>
);

interface TableRowProps {
  talento: TalentoType;
  onRemove: (id: number) => void;
  onUpdate: (talento: TalentoType) => void;
}

const TableRow: React.FC<TableRowProps> = ({ talento, onRemove, onUpdate }) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="py-3 px-4">{talento.idTalento}</td>
    <td className="py-3 px-4">{talento.nombres}</td>
    <td className="py-3 px-4">{talento.apellidos}</td>
    <td className="py-3 px-4">{talento.dni}</td>
    <td className="py-3 px-4">{talento.telefono}</td>
    <td className="py-3 px-4">{talento.email}</td>
    <td className="py-3 px-4">{talento.situacion}</td>
    <td className="py-3 px-4">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        talento.estado === 'ACEPTADO' ? 'bg-green-100 text-green-800' : 
        talento.estado === 'OBSERVADO' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-gray-100 text-gray-800'
      }`}>
        {talento.estado}
      </span>
    </td>
    <td className="py-3 px-4 flex gap-2">
      <button 
        onClick={() => onUpdate(talento)} 
        disabled={talento.estado !== 'OBSERVADO'}
        className={`px-3 py-1 ${
          talento.estado === 'OBSERVADO' 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        } text-xs rounded transition-colors`}
      >
        Actualizar
      </button>


      <button 
        onClick={() => onRemove(talento.idTalento)} 
        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
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
      <p className="font-medium">{talent.nombres} {talent.apellidos}</p>
      <p className="text-sm text-gray-600">DNI: {talent.dni}</p>
    </div>
    <button
      onClick={() => onSelect(talent)}
      disabled={isSelected}
      className={`px-4 py-2 rounded ${
        isSelected 
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
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
}

const SelectionModal: React.FC<SelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  availableTalents, 
  selectedTalents,
  onSelectTalent 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTalents = availableTalents.filter(talent => 
    (talent.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
     talent.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
     talent.dni.includes(searchTerm)) &&
    !selectedTalents.some(selected => selected.idTalento === talent.idTalento)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Seleccione el talento</h2>
          {/* <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button> */}
        </div>
        
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {filteredTalents.length > 0 ? (
            filteredTalents.map((talent) => (
              <TalentoSelection
                key={talent.idTalento}
                talent={talent}
                onSelect={onSelectTalent}
                isSelected={selectedTalents.some(t => t.idTalento === talent.idTalento)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No hay talentos disponibles que coincidan con la búsqueda
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock data for demo purposes
const mockAvailableTalents: TalentoType[] = [
  { idTalento: 1, nombres: 'Denis', apellidos: 'Alcántara', dni: '67655355', telefono: '9998373553', email: 'denis765@gmail.com', estado: 'ACEPTADO', situacion: 'LIBRE' },
  { idTalento: 2, nombres: 'Luis', apellidos: 'Li Tang', dni: '45678912', telefono: '9876543210', email: 'luis.li@gmail.com', estado: 'OBSERVADO', situacion: 'LIBRE' },
  { idTalento: 3, nombres: 'Max', apellidos: 'Cárdenas', dni: '12345678', telefono: '9123456789', email: 'max.cardenas@gmail.com', estado: 'ACEPTADO', situacion: 'OCUPADO' },
  { idTalento: 4, nombres: 'Ana', apellidos: 'Gómez', dni: '87654321', telefono: '9567891234', email: 'ana.gomez@gmail.com', estado: 'ACEPTADO', situacion: 'LIBRE' },
  { idTalento: 5, nombres: 'Carlos', apellidos: 'Mendoza', dni: '23456789', telefono: '9012345678', email: 'carlos.m@gmail.com', estado: 'OBSERVADO', situacion: 'OCUPADO' },
];

const TalentTable: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTalents, setSelectedTalents] = useState<TalentoType[]>([]);
  const [availableTalents, setAvailableTalents] = useState<TalentoType[]>(mockAvailableTalents);

  // In a real app, you'd fetch data from an API
  useEffect(() => {
    // fetchAvailableTalents()
    //   .then(response => setAvailableTalents(response))
    //   .catch(error => console.error('Error fetching talents:', error));
  }, []);

  const handleSelectTalent = (talent: TalentoType) => {
    setSelectedTalents(prev => [...prev, talent]);
  };

  const handleRemoveTalent = (id: number) => {
    setSelectedTalents(prev => prev.filter(talent => talent.idTalento !== id));
  };

  const handleUpdateTalent = (talent: TalentoType) => {
    // Navigate to the data screen with the selected talent
    navigate('/formSolicitarEquipo', { state: { talento: talent } });
  };

  const handleFinalize = () => {
    // Here you would save the data to your backend
    console.log('Finalizing with selected talents:', selectedTalents);
    // API call to save the data
    alert('Datos guardados correctamente!');
  };

  const goBack = () => navigate(-1);

  return (
    <div className="container mx-auto p-4">
    
    <div className="flex flex-col gap-4">
      <h3 className="text-2xl font-semibold flex gap-2">
        <BackButton backClicked={goBack} />
        Módulo para búsqueda de talentos
      </h3>
      {/* Título */}
      {/* <h1 className="text-2xl font-bold">Módulo para búsqueda de talentos</h1> */}

      {/* Cuadro de requerimientos */}
      <div className="bg-white shadow-md rounded-lg p-4 w-full">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600"><span className="font-medium">Id:</span> 675</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Cliente:</span> Banbil</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Rq:</span> BS-702-PK 2027</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Fecha Solicitud:</span> 11/03/2025</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Estado:</span> Asignado</p>
          <p className="text-sm text-gray-600"><span className="font-medium">Vacantes:</span> 1</p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between w-full pb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agregar Talento
        </button>
        <button
          onClick={handleFinalize}
          disabled={selectedTalents.length === 0}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedTalents.length === 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Finalizar
        </button>
      </div>
    </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <TableHeader />
            <tbody>
              {selectedTalents.map(talento => (
                <TableRow
                  key={talento.idTalento}
                  talento={talento}
                  onRemove={handleRemoveTalent}
                  onUpdate={handleUpdateTalent}
                />
              ))}
              {selectedTalents.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-4 text-center text-gray-500">
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
        availableTalents={availableTalents}
        selectedTalents={selectedTalents}
        onSelectTalent={handleSelectTalent}
      />
    </div>
  );
};

export default TalentTable;