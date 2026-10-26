// Bandeja de aprobaciones (FTBO-1118). Los códigos coinciden con las
// restricciones de dbo.FMI_SOLICITUD_APROBACION y con Constante del backend.

export type TipoSolicitudAprobacion = "INGRESO" | "MOVIMIENTO" | "CESE";
export type EstadoSolicitudAprobacion = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "ANULADA";

export const TIPOS_SOLICITUD_APROBACION: { value: TipoSolicitudAprobacion; label: string }[] = [
  { value: "INGRESO", label: "Ingreso" },
  { value: "MOVIMIENTO", label: "Movimiento" },
  { value: "CESE", label: "Cese" },
];

export const ESTADOS_SOLICITUD_APROBACION: { value: EstadoSolicitudAprobacion; label: string }[] = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "APROBADA", label: "Aprobada" },
  { value: "RECHAZADA", label: "Rechazada" },
  { value: "ANULADA", label: "Anulada" },
];

export interface ApprovalItem {
  idSolicitud: number;
  tipoSolicitud: TipoSolicitudAprobacion;
  estado: EstadoSolicitudAprobacion;
  idCliente: number;
  cliente: string;
  idTalento: number | null;
  nombreTalento: string | null;
  resumen: string | null;
  usuarioSolicitante: string | null;
  /** yyyy-MM-dd HH:mm */
  fechaSolicitud: string;
}

export interface ApprovalDetail extends ApprovalItem {
  /** Instantánea del formulario enviado a aprobación, en JSON. */
  datosFormulario: string;
  usuarioModificacion: string | null;
  fechaModificacion: string | null;
}

export interface ApprovalClient {
  idCliente: number;
  razonSocial: string;
}

export interface ApprovalInbox {
  solicitudes: {
    items: ApprovalItem[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  };
  /** Clientes asignados al gestor: las únicas opciones del filtro Cliente. */
  clientes: ApprovalClient[];
}

export interface ApprovalFilters {
  idCliente: number | null;
  tipoSolicitud: TipoSolicitudAprobacion | null;
  estado: EstadoSolicitudAprobacion | null;
  /** Número exacto de solicitud, o texto del talento o del resumen. Se busca en el backend. */
  busqueda: string | null;
}

/** Igual que @BUSQUEDA NVARCHAR(100) del SP y el límite del backend. */
export const MAX_LONGITUD_BUSQUEDA_APROBACIONES = 100;

export interface ApprovalResult<T> {
  baseResponse: { idTipoMensaje: number; mensaje: string };
  data: T | null;
}
