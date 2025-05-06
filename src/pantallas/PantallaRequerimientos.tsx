import { ReactNode, useRef, useState } from "react";
import { PantallaWrapper } from "./PantallaWrapper";
import { BaseOption, FilterDropDown } from "../components/ui/FilterDropDown";
import { DateFilter } from "../components/ui/DateFilter";
import { useMenu } from "../context/MenuContext";
import { useRequerimientos } from "../hooks/useRequirements";
import { ESTADO_ATENDIDO, ESTADO_RQ } from "../utils/config";
import { AgregarRQModal } from "../components/ui/ModalNuevoRQ";
import { ModalDetallesRQ } from "../components/ui/ModalDetallesRQ";
import { RequirementItem } from "../models/type/RequirementItemType";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import { useFetchClients } from "../hooks/useFetchClients";
import { Loading } from "../components/ui/Loading";
import { useParams } from "../context/ParamsContext";

interface SearchProps {
    idCliente: number | null;
    buscar: string | null;
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
    const { paramsByMaestro, loading: paramLoading } = useParams(`${ESTADO_RQ}`);

    const options = paramsByMaestro[ESTADO_RQ] || [];
    const paramOptions: BaseOption[] = options.map((param) => ({
        value: param.num1.toString(),
        label: param.string1,
    })) || [];

    const clientOptions: BaseOption[] = clientes.filter((client) => client.total > 0).map((client) => ({
        value: client.idCliente.toString(),
        label: client.razonSocial,
    }));

    const { toggleMenu } = useMenu();

    const search = ({ idCliente, buscar, estado, fechaSolicitud }: SearchProps) => {
        fetchRequerimientos({
            nPag: 1,
            idCliente: idCliente,
            buscar: buscar,
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
        let searchDate = null;

        if (date !== null) {
            searchDate = format(new Date(date), 'yyyy/MM/dd')
        }

        setSelectedDate(searchDate);
        executeSearch({
            estado: selectedEstado,
            fechaSolicitud: date ? searchDate : null,
        });
    };

    const executeSearch = (overrides: { estado?: number | null; fechaSolicitud?: string | null; idCliente?: number | null } = {}) => {
        if (!loading) {
            search({
                idCliente: overrides.idCliente !== undefined ? overrides.idCliente : selectedCliente,
                buscar: RequerimientoRef.current?.value || null,
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

    const getAlertIconPath = (idAlerta: number): string => {
        switch (idAlerta) {
            case 1:
                return "/assets/ic_success.svg"; // Alerta baja
            case 2:
                return "/assets/ic_warning.svg"; // Alerta media
            case 3:
                return "/assets/ic_error.svg"; // Alerta alta
            default:
                return "/assets/ic_success.svg";
        }
    }

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
                            <label htmlFor="requerimiento" className="input-label">Búsqueda por título o código de requerimiento</label>
                            <input
                                type="text"
                                name="requerimiento"
                                id="requerimiento"
                                ref={RequerimientoRef}
                                className="input"
                            />
                        </div>
                        <div className="flex gap-4 justify-evenly sm:justify-start flex-wrap">
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
                            <DateFilter label="Fecha" onDateSelected={handleDateSelected} />
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
                                    <th className="table-header-cell">Título</th>
                                    <th className="table-header-cell">Requerimiento</th>
                                    <th className="table-header-cell">Fecha Solicitud</th>
                                    <th className="table-header-cell">Estado</th>
                                    <th className="table-header-cell text-center">Confirmados / Vacantes</th>
                                    <th className="table-header-cell">Acciones</th>
                                    <th className="table-header-cell"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {emptyList ? (
                                    <tr>
                                        <td colSpan={8} className="table-empty">
                                            No hay requerimientos disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    requerimientos.map((req) => (
                                        <tr key={req.idRequerimiento} className="table-row">
                                            <td className="table-cell">{req.idRequerimiento}</td>
                                            <td className="table-cell">{req.cliente}</td>
                                            <td className="table-cell">{req.titulo}</td>
                                            <td className="table-cell">{req.codigoRQ}</td>
                                            <td className="table-cell">{req.fechaSolicitud}</td>
                                            <td className="table-cell">{req.estado}</td>
                                            <td className="table-cell text-center">
                                                <div className="min-w-full flex justify-center">
                                                    <div className="w-fit relative group">
                                                        <p className=" px-2 py-1 rounded-lg bg-slate-100 w-fit">
                                                            {req.vacantesCubiertas} / {req.vacantes}
                                                        </p>
                                                        <div className="absolute invisible group-hover:visible z-10 right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs bg-[#484848] text-white rounded whitespace-nowrap">
                                                            {req?.lstPerfiles?.map((perfil, index) => (
                                                                <p className="text-start" key={index}>{perfil.vacantesCubiertas} / {perfil.vacantesTotales} {perfil.perfil}</p>
                                                            ))}
                                                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#484848]"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
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
                                            <td className="table-cell">
                                                {req?.idAlerta !== null && req?.idAlerta > 0 && (
                                                    <div className="relative inline-block group">
                                                        <img
                                                            src={getAlertIconPath(req.idAlerta)}
                                                            alt="icon estado alerta RQ"
                                                            className="w-5 h-5 cursor-pointer min-w-5 min-h-5"
                                                        />
                                                        <div className="absolute invisible group-hover:visible z-10 right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 text-xs bg-[#484848] text-white rounded whitespace-nowrap">
                                                            Vence: {req.fechaVencimiento}
                                                            <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-[#484848]"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </PantallaWrapper>
            {isNuevoRQModalOpen &&
                <AgregarRQModal
                    onClose={() => setIsNuevoRQModalOpen(false)}
                    updateRQData={updateRQData}
                    estadoOptions={options}
                    clientes={clientes}
                />
            }
            {isDetallesRQModalOpen &&
                <ModalDetallesRQ
                    onClose={() => setIsDetallesRQModalOpen(false)}
                    estadoOptions={options}
                    RQ={selectedRQ}
                    clientes={clientes}
                    handleAsignar={handleAsignarClick}
                    updateRQData={updateRQData}
                />
            }
        </>
    );
};