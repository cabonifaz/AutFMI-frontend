import { useCallback, useEffect, useRef, useState } from "react";
import { PantallaWrapper } from "./PantallaWrapper";
import { FilterDropDown } from "../components/ui/FilterDropDown";
import { DateFilter } from "../components/ui/DateFilter";
import { useMenu } from "../context/MenuContext";
import { useRequerimientos } from "../hooks/useRequirements";
import Loading from "../components/loading/Loading";

interface SearchProps {
    cliente: string | null;
    requerimiento: string | null;
    estado: number | null;
    fechaSolicitud: string | null;
}

export const PantallaRequerimientos = () => {
    const clienteRef = useRef<HTMLInputElement>(null);
    const RequerimientoRef = useRef<HTMLInputElement>(null);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [selectedEstado, setSelectedEstado] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { requerimientos, loading, emptyList } = useRequerimientos();

    const { toggleMenu } = useMenu();

    const search = ({ cliente, requerimiento, estado, fechaSolicitud }: SearchProps) => {
        console.log({
            cliente: cliente,
            requerimiento: requerimiento,
            estado: estado,
            fechaSolicitud: fechaSolicitud,
        });
    };

    const executeSearch = useCallback(() => {
        search({
            cliente: clienteRef.current?.value || null,
            requerimiento: RequerimientoRef.current?.value || null,
            estado: selectedEstado,
            fechaSolicitud: selectedDate ? selectedDate.toISOString() : null,
        });
    }, [selectedDate, selectedEstado]);

    useEffect(() => {
        executeSearch();
    }, [selectedEstado, selectedDate, executeSearch]);

    const handleEstadoChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedEstado(newValue);
    };

    const handleDateSelected = (date: Date | null) => {
        setSelectedDate(date);
    };

    const handleSearch = () => {
        executeSearch();
    };

    return (
        <>
            {loading && (<Loading />)}
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
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">Cliente</label>
                                <input
                                    type="text"
                                    name="cliente"
                                    id="cliente"
                                    ref={clienteRef}
                                    className="mt-1 block w-full rounded-md border border-zinc-300 shadow-sm focus:outline-none sm:text-sm px-4 py-2"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="requerimiento" className="block text-sm font-medium text-gray-700">Requerimiento</label>
                                <input
                                    type="text"
                                    name="requerimiento"
                                    id="requerimiento"
                                    ref={RequerimientoRef}
                                    className="mt-1 block w-full rounded-md border border-zinc-300 shadow-sm focus:outline-none sm:text-sm px-4 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <FilterDropDown
                                name="estado"
                                label="Estado"
                                options={[{ value: "1", label: "option 1" }, { value: "2", label: "option 2" }]}
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
                                className="bg-zinc-600 rounded-lg px-4 py-2 text-white hover:bg-zinc-700 transition duration-200">Buscar</button>
                            <button type="button" className="bg-[#009688] rounded-lg px-4 py-2 text-white hover:bg-[#359c92] transition duration-200">Nuevo RQ</button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-md overflow-x-auto max-w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Requerimiento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Fecha Solicitud</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Vacantes</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {emptyList ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No hay requerimientos disponibles.
                                    </td>
                                </tr>
                            ) : (
                                requerimientos.map((req) => (
                                    <tr key={req.idRequerimiento}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.idRequerimiento}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.cliente}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.codigoRQ}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.fechaSolicitud}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.Estado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.Vacantes}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button className="bg-blue-500 text-white rounded-lg px-3 py-1 mr-2 hover:bg-blue-600 transition duration-200">
                                                Asignar
                                            </button>
                                            <button className="bg-[#009688] text-white rounded-lg px-3 py-1 hover:bg-[#359c92] transition duration-200">
                                                Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </PantallaWrapper>
        </>
    );
};