import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { PantallaWrapper } from "./PantallaWrapper";
import { BaseOption, FilterDropDown } from "../components/ui/FilterDropDown";
import { Pagination } from "../components/ui/Pagination";
import { Loading } from "../components/ui/Loading";
import { ModalSolicitudAprobacion } from "../components/ui/modals/ModalSolicitudAprobacion";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";
import { getApprovalInbox } from "../services/approval.service";
import { RUTA_BANDEJA_APROBACIONES } from "../utils/navigation";
import {
  ApprovalClient,
  ApprovalFilters,
  ApprovalItem,
  ESTADOS_SOLICITUD_APROBACION,
  EstadoSolicitudAprobacion,
  MAX_LONGITUD_BUSQUEDA_APROBACIONES,
  TIPOS_SOLICITUD_APROBACION,
  TipoSolicitudAprobacion,
} from "../models/type/ApprovalRequest";

const SIN_FILTROS: ApprovalFilters = { idCliente: null, tipoSolicitud: null, estado: null, busqueda: null };
const SIN_DESPLEGABLES: Partial<ApprovalFilters> = { idCliente: null, tipoSolicitud: null, estado: null };

// Espera tras la última tecla antes de consultar: evita una petición por tecla.
export const ESPERA_BUSQUEDA_MS = 350;
const PLACEHOLDER_BUSQUEDA = "Buscar por número, talento o resumen";

const tipoOptions: BaseOption[] = TIPOS_SOLICITUD_APROBACION;
const estadoOptions: BaseOption[] = ESTADOS_SOLICITUD_APROBACION;

const ESTADO_BADGE: Record<EstadoSolicitudAprobacion, string> = {
  PENDIENTE: "badge badge-yellow",
  APROBADA: "badge badge-green",
  RECHAZADA: "badge bg-red-100 text-red-800",
  ANULADA: "badge bg-gray-100 text-gray-700",
};

const labelOf = (options: BaseOption[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

interface LoadError {
  message: string;
  canRetry: boolean;
}


export const PantallaBandejaAprobaciones = () => {
  const navigate = useNavigate();
  const { idSolicitud } = useParams();
  const { logout } = useAuth();
  const { toggleMenu } = useMenu();

  const [filters, setFilters] = useState<ApprovalFilters>(SIN_FILTROS);
  // Lo que se está escribiendo; pasa a filters.busqueda tras ESPERA_BUSQUEDA_MS.
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [clientes, setClientes] = useState<ApprovalClient[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadError | null>(null);

  // Solo cuenta la respuesta de la última consulta (filtros cambiados rápido).
  const lastRequest = useRef(0);

  const handleSessionExpired = useCallback(() => {
    enqueueSnackbar("Tu sesión ha vencido. Inicia sesión nuevamente.", { variant: "warning" });
    logout();
    navigate("/");
  }, [logout, navigate]);
  const sessionExpiredRef = useRef(handleSessionExpired);
  sessionExpiredRef.current = handleSessionExpired;

  useEffect(() => {
    const requestId = ++lastRequest.current;
    setLoading(true);
    setError(null);

    getApprovalInbox(filters, page)
      .then((response) => {
        if (requestId !== lastRequest.current) return;
        setLoading(false);
        const data = response.data.data;
        if (response.data.baseResponse?.idTipoMensaje !== 2 || !data) {
          setItems([]);
          setError({
            message: response.data.baseResponse?.mensaje || "No se pudo cargar la bandeja de aprobaciones.",
            canRetry: true,
          });
          return;
        }
        setItems(data.solicitudes.items ?? []);
        setTotalPages(data.solicitudes.totalPages ?? 0);
        setTotalElements(data.solicitudes.totalElements ?? 0);
        setClientes(data.clientes ?? []);
      })
      .catch((err) => {
        if (requestId !== lastRequest.current) return;
        setLoading(false);
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 401) {
          sessionExpiredRef.current();
          return;
        }
        setItems([]);
        setTotalPages(0);
        setTotalElements(0);
        setError(
          status === 403
            ? { message: "No tienes permiso para ver la bandeja de aprobaciones.", canRetry: false }
            : { message: "No se pudo cargar la bandeja de aprobaciones.", canRetry: true }
        );
      });
  }, [filters, page, reloadKey]);

  const updateFilters = (patch: Partial<ApprovalFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  // Aplica el texto escrito cuando deja de cambiar; un texto que no cambia la
  // búsqueda (p. ej. un espacio al final) no vuelve a consultar ni de página.
  useEffect(() => {
    const busqueda = textoBusqueda.trim() || null;
    if (busqueda === filters.busqueda) return;
    const timer = setTimeout(() => {
      setFilters((current) => ({ ...current, busqueda }));
      setPage(1);
    }, ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(timer);
  }, [textoBusqueda, filters.busqueda]);

  const applySearchNow = () => {
    const busqueda = textoBusqueda.trim() || null;
    if (busqueda !== filters.busqueda) updateFilters({ busqueda });
  };

  const clearSearch = () => {
    setTextoBusqueda("");
    if (filters.busqueda !== null) updateFilters({ busqueda: null });
  };

  const toggleDropdown = (index: number) =>
    setOpenDropdown(openDropdown === index ? null : index);

  const clientOptions: BaseOption[] = clientes.map((c) => ({
    value: c.idCliente.toString(),
    label: c.razonSocial,
  }));

  const hasFilters =
    filters.idCliente !== null || filters.tipoSolicitud !== null || filters.estado !== null;

  const openDetail = (id: number) => navigate(`${RUTA_BANDEJA_APROBACIONES}/${id}`);
  const closeDetail = useCallback(() => navigate(RUTA_BANDEJA_APROBACIONES), [navigate]);

  const renderBody = () => {
    if (loading && items.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="table-empty" role="status">
            Cargando solicitudes…
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={9} className="table-empty">
            <div role="alert" className="flex flex-col items-center gap-3">
              <span className="text-red-600">{error.message}</span>
              {error.canRetry && (
                <button
                  type="button"
                  className="btn btn-blue"
                  onClick={() => setReloadKey((k) => k + 1)}
                >
                  Reintentar
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    }
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="table-empty">
            {filters.busqueda !== null ? (
              <div className="flex flex-col items-center gap-3">
                <span>
                  No hay solicitudes que coincidan con “{filters.busqueda}”
                  {hasFilters ? " y los filtros seleccionados" : ""}.
                </span>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-outline-blue" onClick={clearSearch}>
                    Limpiar búsqueda
                  </button>
                  {hasFilters && (
                    <button type="button" className="btn btn-outline-blue" onClick={() => updateFilters(SIN_DESPLEGABLES)}>
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            ) : hasFilters ? (
              <div className="flex flex-col items-center gap-3">
                <span>No hay solicitudes que coincidan con los filtros seleccionados.</span>
                <button type="button" className="btn btn-outline-blue" onClick={() => updateFilters(SIN_DESPLEGABLES)}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              "No hay solicitudes de aprobación para tus clientes."
            )}
          </td>
        </tr>
      );
    }
    return items.map((item) => (
      <tr key={item.idSolicitud} className="table-row">
        <td className="table-cell">{item.idSolicitud}</td>
        <td className="table-cell">{labelOf(tipoOptions, item.tipoSolicitud)}</td>
        <td className="table-cell">{item.cliente}</td>
        <td className="table-cell">{item.nombreTalento || "-"}</td>
        <td className="table-cell">
          {item.resumen
            ? item.resumen.length > 60
              ? `${item.resumen.slice(0, 60)}...`
              : item.resumen
            : "-"}
        </td>
        <td className="table-cell">{item.usuarioSolicitante || "-"}</td>
        <td className="table-cell text-nowrap">{item.fechaSolicitud}</td>
        <td className="table-cell">
          <span className={ESTADO_BADGE[item.estado] ?? "badge"}>{labelOf(estadoOptions, item.estado)}</span>
        </td>
        <td className="table-cell">
          <button
            type="button"
            onClick={() => openDetail(item.idSolicitud)}
            className="btn btn-actions btn-primary"
          >
            Ver detalle
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <>
      {loading && items.length > 0 && <Loading overlayMode={true} />}
      <PantallaWrapper>
        <div className="flex flex-col h-screen overflow-hidden p-2">
          <div className="flex-none max-w-[95vw]">
            <h2 className="text-2xl font-semibold mb-4 flex gap-2">
              <div
                className="space-y-1 cursor-pointer ms-1 lg:hidden self-center"
                onClick={toggleMenu}
              >
                <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
                <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
                <div className="w-6 h-1 bg-gray-800 rounded-lg"></div>
              </div>
              Bandeja de aprobaciones
            </h2>
            <div className="card mb-6">
              <div className="flex gap-4 justify-evenly sm:justify-start flex-wrap items-center">
                <div className="relative w-full sm:w-80">
                  <Search
                    size={16}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="search"
                    className="input w-full !pl-10 !pr-9 [&::-webkit-search-cancel-button]:hidden"
                    placeholder={PLACEHOLDER_BUSQUEDA}
                    aria-label={PLACEHOLDER_BUSQUEDA}
                    maxLength={MAX_LONGITUD_BUSQUEDA_APROBACIONES}
                    value={textoBusqueda}
                    onChange={(e) => setTextoBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applySearchNow();
                      if (e.key === "Escape") clearSearch();
                    }}
                  />
                  {textoBusqueda !== "" && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Limpiar búsqueda"
                      title="Limpiar búsqueda"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <FilterDropDown
                  name="cliente"
                  label="Cliente"
                  options={clientOptions}
                  optionsType="radio"
                  optionsPanelSize="w-80"
                  inputPosition="right"
                  isOpen={openDropdown === 0}
                  onToggle={() => toggleDropdown(0)}
                  selectedValues={filters.idCliente !== null ? [filters.idCliente.toString()] : []}
                  onChange={(values) =>
                    updateFilters({ idCliente: values[0] ? Number(values[0]) : null })
                  }
                />
                <FilterDropDown
                  name="tipoSolicitud"
                  label="Tipo de solicitud"
                  options={tipoOptions}
                  optionsType="radio"
                  optionsPanelSize="w-44"
                  inputPosition="right"
                  isOpen={openDropdown === 1}
                  onToggle={() => toggleDropdown(1)}
                  selectedValues={filters.tipoSolicitud ? [filters.tipoSolicitud] : []}
                  onChange={(values) =>
                    updateFilters({ tipoSolicitud: (values[0] as TipoSolicitudAprobacion) || null })
                  }
                />
                <FilterDropDown
                  name="estado"
                  label="Estado"
                  options={estadoOptions}
                  optionsType="radio"
                  optionsPanelSize="w-40"
                  inputPosition="right"
                  isOpen={openDropdown === 2}
                  onToggle={() => toggleDropdown(2)}
                  selectedValues={filters.estado ? [filters.estado] : []}
                  onChange={(values) =>
                    updateFilters({ estado: (values[0] as EstadoSolicitudAprobacion) || null })
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg max-w-[95vw] lg:max-w-[calc(100vw-100px)] xl:max-w-[calc(100vw-192px)] overflow-x-auto">
            <table className="table">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="table-header">
                  <th className="table-header-cell text-nowrap">N°</th>
                  <th className="table-header-cell text-nowrap">Tipo</th>
                  <th className="table-header-cell text-nowrap">Cliente</th>
                  <th className="table-header-cell text-nowrap">Talento</th>
                  <th className="table-header-cell text-nowrap">Resumen</th>
                  <th className="table-header-cell text-nowrap">Solicitado por</th>
                  <th className="table-header-cell text-nowrap">Fecha</th>
                  <th className="table-header-cell text-nowrap">Estado</th>
                  <th className="table-header-cell text-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">{renderBody()}</tbody>
            </table>
          </div>

          {!error && totalElements > 0 && (
            <div className="flex flex-col items-center gap-2 my-4">
              <span className="text-sm text-gray-500">
                {totalElements} {totalElements === 1 ? "solicitud" : "solicitudes"}
              </span>
              {totalPages > 1 && (
                <Pagination totalPages={totalPages} currentPage={page} onPaginate={setPage} />
              )}
            </div>
          )}
        </div>
      </PantallaWrapper>

      {idSolicitud !== undefined && (
        <ModalSolicitudAprobacion
          idSolicitud={Number(idSolicitud)}
          onClose={closeDetail}
          onSessionExpired={handleSessionExpired}
        />
      )}
    </>
  );
};

export default PantallaBandejaAprobaciones;
