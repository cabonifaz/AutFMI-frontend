import { useRef, useState } from "react";
import { PantallaWrapper } from "./PantallaWrapper";
import { BaseOption, FilterDropDown } from "../components/ui/FilterDropDown";
import { DateFilter } from "../components/ui/DateFilter";
import { useMenu } from "../context/MenuContext";
import { useRequerimientos } from "../hooks/useRequirements";
import useFetchParams from "../hooks/useFetchParams";
import { ESTADO_ATENDIDO, ESTADO_RQ } from "../utils/config";
import { AgregarRQModal } from "../components/ui/ModalNuevoRQ";
import { ModalDetallesRQ } from "../components/ui/ModalDetallesRQ";
import { RequirementItem } from "../models/type/RequirementItemType";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import { useFetchClients } from "../hooks/useFetchClients";
import { Loading } from "../components/ui/Loading";

interface SearchProps {
    idCliente: number | null;
    codigoRQ: string | null;
    estado: number | null;
    fechaSolicitud: string | null;
}

export const PantallaRequerimientos = () => {
    const navigate = useNavigate();
    const RequerimientoRef = useRef<HTMLInputElement>(null);

    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [selectedEstado, setSelectedEstado] = useState<number | null>(null);
    const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isNuevoRQModalOpen, setIsNuevoRQModalOpen] = useState(false);
    const [isDetallesRQModalOpen, setIsDetallesRQModalOpen] = useState(false);
    const [selectedRQ, setSelectedRQ] = useState<RequirementItem | null>(null);

    const { requerimientos, loading, emptyList, fetchRequerimientos } = useRequerimientos();
    const { clientes, fetchClients, loading: clientsLoading } = useFetchClients();
    const { params, paramLoading } = useFetchParams(`${ESTADO_RQ}`);

    const options = params?.filter((param) => param.idMaestro === Number(ESTADO_RQ)) || [];
    const paramOptions: BaseOption[] = params?.filter((param) => param.idMaestro === Number(ESTADO_RQ)).map((param) => ({
        value: param.num1.toString(),
        label: param.string1,
    })) || [];

    const clientOptions: BaseOption[] = clientes.filter((client) => client.total > 0).map((client) => ({
        value: client.idCliente.toString(),
        label: client.razonSocial,
    }));

    const { toggleMenu } = useMenu();

    const search = ({ idCliente, codigoRQ, estado, fechaSolicitud }: SearchProps) => {
        fetchRequerimientos({
            nPag: 1,
            idCliente: idCliente,
            codigoRQ: codigoRQ,
            estado: estado,
            fechaSolicitud: fechaSolicitud,
        });
    };

    const handleEstadoChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedEstado(newValue);
        executeSearch({
            estado: newValue,
            fechaSolicitud: selectedDate ? selectedDate : null,
        });
    };

    const handleClienteChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedCliente(newValue);
        executeSearch({
            estado: selectedEstado,
            fechaSolicitud: selectedDate ? selectedDate : null,
            idCliente: newValue
        });
    };

    const handleDateSelected = (date: Date | null) => {
        if (date !== null) {
            const searchDate = format(new Date(date), 'yyyy/MM/dd')
            setSelectedDate(searchDate);
            executeSearch({
                estado: selectedEstado,
                fechaSolicitud: date ? searchDate : null,
            });
        }
    };

    const executeSearch = (overrides: { estado?: number | null; fechaSolicitud?: string | null; idCliente?: number | null } = {}) => {
        if (!loading) {
            search({
                idCliente: overrides.idCliente !== undefined ? overrides.idCliente : selectedCliente,
                codigoRQ: RequerimientoRef.current?.value || null,
                estado: overrides.estado !== undefined ? overrides.estado : selectedEstado,
                fechaSolicitud: overrides.fechaSolicitud !== undefined ? overrides.fechaSolicitud : (selectedDate ? selectedDate : null),
            });
        }
    };

    const handleSearch = () => {
        executeSearch();
    };

    const openDetallesRQModal = (req: RequirementItem) => {
        setIsDetallesRQModalOpen(true);
        setSelectedRQ(req);
    }

    const updateRQData = () => {
        executeSearch();
        fetchClients();
    }

    const handleAsignarClick = (idRequerimiento: number) => {
        navigate('/tableAsignarTalento', { state: { idRequerimiento } });
    };

    return (
        <>
            {(loading || paramLoading || clientsLoading) && (<Loading overlayMode={true} />)}
            <PantallaWrapper>
                <h2 className="text-2xl font-semibold mb-4 flex gap-2">
                    <div className="space-y-1 cursor-pointer ms-1 lg:hidden self-center" onClick={toggleMenu}>
                        <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
                        <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
                        <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
                    </div>
                    Requerimientos
                </h2>
                {/* filters */}
                <div className="card mb-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="requerimiento" className="input-label">Requerimiento</label>
                            <input
                                type="text"
                                name="requerimiento"
                                id="requerimiento"
                                ref={RequerimientoRef}
                                className="input"
                            />
                        </div>
                        <div className="flex gap-4">
                            <FilterDropDown
                                name="cliente"
                                label="Cliente"
                                options={clientOptions}
                                optionsType="radio"
                                optionsPanelSize="w-36"
                                inputPosition="right"
                                isOpen={openDropdown === 0}
                                onToggle={() => setOpenDropdown(openDropdown === 0 ? null : 0)}
                                selectedValues={selectedCliente ? [selectedCliente.toString()] : []}
                                onChange={handleClienteChangeFilter}
                            />
                            <FilterDropDown
                                name="estado"
                                label="Estado"
                                options={paramOptions}
                                optionsType="radio"
                                optionsPanelSize="w-36"
                                inputPosition="right"
                                isOpen={openDropdown === 1}
                                onToggle={() => setOpenDropdown(openDropdown === 1 ? null : 1)}
                                selectedValues={selectedEstado ? [selectedEstado.toString()] : []}
                                onChange={handleEstadoChangeFilter}
                            />
                            <DateFilter label="Seleccionar fecha" onDateSelected={handleDateSelected} />
                        </div>
                        <div className="flex justify-between">
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="btn btn-primary">
                                Buscar
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsNuevoRQModalOpen(true)}
                                className="btn btn-blue">
                                Nuevo RQ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr className="table-header">
                                    <th className="table-header-cell">ID</th>
                                    <th className="table-header-cell">Cliente</th>
                                    <th className="table-header-cell">Requerimiento</th>
                                    <th className="table-header-cell">Fecha Solicitud</th>
                                    <th className="table-header-cell">Estado</th>
                                    <th className="table-header-cell">Vacantes</th>
                                    <th className="table-header-cell">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {emptyList ? (
                                    <tr>
                                        <td colSpan={7} className="table-empty">
                                            No hay requerimientos disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    requerimientos.map((req) => (
                                        <tr key={req.idRequerimiento} className="table-row">
                                            <td className="table-cell">{req.idRequerimiento}</td>
                                            <td className="table-cell">{req.cliente}</td>
                                            <td className="table-cell">{req.codigoRQ}</td>
                                            <td className="table-cell">{req.fechaSolicitud}</td>
                                            <td className="table-cell">{req.estado}</td>
                                            <td className="table-cell">{req.vacantes}</td>
                                            <td className="table-cell">
                                                <button
                                                    onClick={() => handleAsignarClick(req.idRequerimiento)}
                                                    disabled={req.idEstado === ESTADO_ATENDIDO}
                                                    className={`btn btn-actions ${req.idEstado === ESTADO_ATENDIDO ? 'btn-disabled' : 'btn-blue'}`}>
                                                    Asignar
                                                </button>
                                                <button
                                                    onClick={() => openDetallesRQModal(req)}
                                                    className="btn btn-actions btn-primary">
                                                    Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </PantallaWrapper>
            {isNuevoRQModalOpen && <AgregarRQModal onClose={() => setIsNuevoRQModalOpen(false)} updateRQData={updateRQData} estadoOptions={options} clientes={clientes} />}
            {isDetallesRQModalOpen && <ModalDetallesRQ onClose={() => setIsDetallesRQModalOpen(false)} estadoOptions={options} RQ={selectedRQ} clientes={clientes} updateRQData={updateRQData} />}
        </>
    );
};