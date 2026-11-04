import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import {
  Check,
  FileText,
  Laptop,
  KeyRound,
  X,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getApprovalDetail,
  getApprovalFlow,
  getApprovalAreas,
  reviewApprovalArea,
  updateApprovalArea,
  decideApprovalAreas,
} from "../../../services/approval.service";
import {
  ApprovalDetail,
  ApprovalFlow,
  ApprovalAreas,
  ApprovalAreaName,
  ApprovalEditableField,
  TIPOS_SOLICITUD_APROBACION,
} from "../../../models/type/ApprovalRequest";
import { ApprovalExpandableText } from "../ApprovalExpandableText";
import { formatApprovalDate } from "../../../utils/approvalTime";

interface Props {
  idSolicitud: number;
  onClose: () => void;
  onSessionExpired: () => void;
  onChanged?: () => void;
}
const TABS = [
  {
    area: "FMI" as const,
    label: "FMI",
    icon: FileText,
    description: "Datos del ingreso, movimiento o cese.",
  },
  {
    area: "EQUIPO" as const,
    label: "Equipo",
    icon: Laptop,
    description: "Asignación o devolución del equipo.",
  },
  {
    area: "CREDENCIALES" as const,
    label: "Credenciales",
    icon: KeyRound,
    description: "Creación, cambio o baja de accesos.",
  },
];
const text = (value: unknown) =>
  value === null || value === undefined
    ? ""
    : typeof value === "boolean"
      ? value
        ? "Sí"
        : "No"
      : typeof value === "object"
        ? ""
        : String(value);
const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADA: "Aprobada",
  RECHAZADA: "Desaprobada",
  NO_APLICA: "No aplica",
  ANULADA: "Anulada",
};
const statusStyles: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700",
  APROBADA: "bg-emerald-50 text-emerald-700",
  RECHAZADA: "bg-red-50 text-red-700",
  NO_APLICA: "bg-slate-100 text-slate-500",
  ANULADA: "bg-slate-100 text-slate-500",
};
const ETIQUETAS_CAMPO: Record<string, string> = {
  nombres: "Nombres",
  apellidoPaterno: "Apellido paterno",
  apellidoMaterno: "Apellido materno",
  cliente: "Cliente",
  area: "Área",
  movArea: "Área destino",
  cargo: "Cargo",
  puesto: "Puesto",
  horario: "Horario",
  ubicacion: "Ubicación",
  fchInicioContrato: "Inicio de contrato",
  fchTerminoContrato: "Término de contrato",
  fchMovimiento: "Fecha del movimiento",
  fchCese: "Fecha de cese",
  fchDevolucionEquipo: "Devolución de equipo",
  tiempoContrato: "Tiempo de contrato",
  proyectoServicio: "Proyecto / servicio",
  objetoContrato: "Objeto del contrato",
  remuneracion: "Remuneración",
  montoBase: "Monto base",
  montoMovilidad: "Movilidad",
  montoTrimestral: "Bono trimestral",
  montoSemestral: "Bono semestral",
  tieneEquipo: "Equipo propio",
  sedeDeclarar: "Sede a declarar",
};

const LABELS: Record<string, string> = {
  ...ETIQUETAS_CAMPO,
  fechaEntrega: "Fecha de entrega",
  procesador: "Procesador",
  ram: "Memoria RAM",
  hd: "Disco",
  marca: "Marca",
  accesorios: "Accesorios",
  tipoEquipo: "Tipo de equipo",
  usuario: "Usuario / correo",
  detalle: "Detalle",
  fecha: "Fecha requerida",
  accion: "Acción",
  software: "Software solicitado",
  anexo: "Anexo",
  celular: "Celular",
  internetMovil: "Internet móvil",
  bitCelular: "Celular",
  bitInternetMovil: "Internet móvil",
  notificarProntoInicio: "Enviar aviso de pronto inicio",
};

const FORM_GROUPS = [
  {
    label: "General",
    fields: [
      "nombres",
      "apellidos",
      "apellidoPaterno",
      "apellidoMaterno",
      "cliente",
      "idCliente",
      "area",
      "movArea",
      "idArea",
      "tieneEquipo",
      "ubicacion",
    ],
  },
  {
    label: "Ingreso",
    fields: [
      "modalidad",
      "idModalidadContrato",
      "motivo",
      "idMotivo",
      "cargo",
      "puesto",
      "horario",
    ],
  },
  {
    label: "Contrato",
    fields: [
      "fchInicioContrato",
      "fchTerminoContrato",
      "tiempoContrato",
      "fchMovimiento",
      "fchCese",
      "fchDevolucionEquipo",
      "proyectoServicio",
      "objetoContrato",
    ],
  },
  {
    label: "Salario - SUNAT",
    fields: [
      "declararSunat",
      "sedeDeclarar",
      "idSedeDeclarar",
      "tipoMoneda",
      "idMoneda",
      "montoBase",
      "montoMovilidad",
      "montoMensual",
      "remuneracion",
      "montoTrimestral",
      "montoSemestral",
    ],
  },
];
export const formGroups = (area: ApprovalAreaName, keys: string[]) => {
  if (area !== "FMI")
    return [{ label: area === "EQUIPO" ? "Equipo" : "Credenciales", keys }];
  const grouped = FORM_GROUPS.map((group) => ({
    label: group.label,
    keys: group.fields.filter((key) => keys.includes(key)),
  })).filter((group) => group.keys.length > 0);
  const extra = keys.filter(
    (key) => !FORM_GROUPS.some((group) => group.fields.includes(key)),
  );
  return extra.length
    ? [...grouped, { label: "Datos adicionales", keys: extra }]
    : grouped;
};

type Confirm = {
  areas: ApprovalAreaName[];
  action: "APROBAR" | "RECHAZAR";
  all: boolean;
};
export const ModalSolicitudAprobacion = ({
  idSolicitud,
  onClose,
  onSessionExpired,
  onChanged,
}: Props) => {
  const [detail, setDetail] = useState<ApprovalDetail | null>(null);
  const [flow, setFlow] = useState<ApprovalFlow | null>(null);
  const [areas, setAreas] = useState<ApprovalAreas | null>(null);
  const [active, setActive] = useState<ApprovalAreaName>("FMI");
  const [category, setCategory] = useState("General");
  useEffect(() => setCategory("General"), [active, idSolicitud]);
  const [selected, setSelected] = useState<ApprovalAreaName[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [reason, setReason] = useState("");
  const [reload, setReload] = useState(0);
  const actionLock = useRef(false);
  const requestIdRef = useRef(idSolicitud);
  requestIdRef.current = idSolicitud;
  const dialog = useRef<HTMLDivElement>(null);
  const sessionRef = useRef(onSessionExpired);
  sessionRef.current = onSessionExpired;
  const changedRef = useRef(onChanged);
  changedRef.current = onChanged;

  const fail = useCallback((e: unknown, fallback: string) => {
    if (isAxiosError(e) && e.response?.status === 401) {
      sessionRef.current();
      return;
    }
    const message = isAxiosError(e)
      ? e.response?.data?.baseResponse?.mensaje
      : undefined;
    setError(message || fallback);
    if (isAxiosError(e) && e.response?.status === 409) {
      setSelected([]);
      setReload((v) => v + 1);
      changedRef.current?.();
    }
  }, []);
  useEffect(() => {
    setActive("FMI");
    setSelected([]);
    setDraft({});
    setConfirm(null);
    setReason("");
    setDetail(null);
    setAreas(null);
    setFlow(null);
  }, [idSolicitud]);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);
    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      setError("La solicitud no es válida.");
      setLoading(false);
      return;
    }
    Promise.all([
      getApprovalDetail(idSolicitud),
      getApprovalFlow(idSolicitud),
      getApprovalAreas(idSolicitud),
    ])
      .then(([d, f, a]) => {
        if (!current) return;
        for (const response of [d, f, a])
          if (
            response.data.baseResponse?.idTipoMensaje !== 2 ||
            !response.data.data
          )
            throw new Error(
              response.data.baseResponse?.mensaje ||
                "No se pudo cargar la solicitud.",
            );
        setDetail(d.data.data);
        setFlow(f.data.data);
        setAreas(a.data.data);
        const applicable =
          a.data.data?.areas.filter((area) => area.estado !== "NO_APLICA") ||
          [];
        setActive((previous) =>
          applicable.some((area) => area.area === previous)
            ? previous
            : applicable[0]?.area || "FMI",
        );
        setDraft({});
        setSelected([]);
      })
      .catch((e) => {
        if (current) {
          setDetail(null);
          setAreas(null);
          fail(
            e,
            e instanceof Error ? e.message : "No se pudo cargar la solicitud.",
          );
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [idSolicitud, reload, fail]);
  const version = areas?.version;
  const canManage = areas?.puedeGestionar === true;
  useEffect(() => {
    if (!canManage || version === undefined || loading) return;
    let current = true;
    setReviewing(true);
    reviewApprovalArea(idSolicitud, active, version)
      .then((response) => {
        if (response.data.baseResponse?.idTipoMensaje !== 2)
          throw new Error(
            response.data.baseResponse?.mensaje ||
              "No se pudo registrar la revisión.",
          );
        if (requestIdRef.current === idSolicitud)
          setAreas((a) =>
            a && a.version === version
              ? {
                  ...a,
                  revisadas: Array.from(new Set([...a.revisadas, active])),
                }
              : a,
          );
      })
      .catch((e) => {
        if (current)
          fail(
            e,
            "No se pudo registrar la revisión. Reabre la pestaña antes de confirmar.",
          );
      })
      .finally(() => {
        if (current) setReviewing(false);
      });
    return () => {
      current = false;
    };
  }, [idSolicitud, active, version, canManage, loading, fail]);
  const busy = loading || working;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        if (confirm) setConfirm(null);
        else onClose();
      }
      if (event.key === "Tab" && dialog.current && !confirm) {
        const nodes = Array.from(
          dialog.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
          ),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [busy, confirm, onClose]);
  const current = areas?.areas.find((a) => a.area === active);
  const visibleTabs = TABS.filter((tab) =>
    areas?.areas.some(
      (area) => area.area === tab.area && area.estado !== "NO_APLICA",
    ),
  );
  const reviewedCount = visibleTabs.filter((tab) =>
    areas?.revisadas.includes(tab.area),
  ).length;
  const fields = current?.camposEditables || [];
  const fieldMap = Object.fromEntries(
    fields.map((field) => [field.campo, field]),
  );
  const keys = Array.from(
    new Set([
      ...Object.keys(current?.datos || {}),
      ...fields.map((field) => field.campo),
    ]),
  );
  const original = (key: string) =>
    text(
      current?.datos[key] ??
        (key === "notificarProntoInicio"
          ? flow?.notificarProntoInicio
          : undefined),
    );
  const changes = fields.filter(
    (field) =>
      field.campo in draft && draft[field.campo] !== original(field.campo),
  );
  const dirty = changes.length > 0;
  const switchTab = (area: ApprovalAreaName) => {
    if (busy || dirty) return;
    setActive(area);
    setDraft({});
    setError(null);
  };
  const choose = (area: ApprovalAreaName) =>
    setSelected((items) =>
      items.includes(area) ? items.filter((a) => a !== area) : [...items, area],
    );
  const openConfirm = (
    selection: ApprovalAreaName[],
    action: "APROBAR" | "RECHAZAR",
    all = false,
  ) => {
    setError(null);
    setReason("");
    setConfirm({ areas: selection, action, all });
  };
  const save = async () => {
    if (!areas || !dirty || actionLock.current) return;
    actionLock.current = true;
    setWorking(true);
    setError(null);
    const payload = Object.fromEntries(
      changes.map((field) => [
        field.campo,
        field.tipo === "NUMERO" || field.tipo === "SI_NO"
          ? draft[field.campo].trim() === ""
            ? null
            : Number(draft[field.campo])
          : draft[field.campo],
      ]),
    );
    try {
      const response = await updateApprovalArea(
        idSolicitud,
        active,
        areas.version,
        payload,
      );
      if (response.data.baseResponse?.idTipoMensaje !== 2)
        throw new Error(
          response.data.baseResponse?.mensaje ||
            "No se pudieron guardar los cambios.",
        );
      enqueueSnackbar(
        "Corrección guardada. Revisa los datos antes de aprobar.",
        { variant: "success" },
      );
      setReload((v) => v + 1);
      changedRef.current?.();
    } catch (e) {
      fail(
        e,
        e instanceof Error ? e.message : "No se pudieron guardar los cambios.",
      );
    } finally {
      actionLock.current = false;
      setWorking(false);
    }
  };
  const decide = async () => {
    if (!areas || !confirm || actionLock.current) return;
    actionLock.current = true;
    setWorking(true);
    setError(null);
    try {
      const response = await decideApprovalAreas(
        idSolicitud,
        areas.version,
        confirm.areas,
        confirm.action,
        reason,
        confirm.all,
      );
      if (response.data.baseResponse?.idTipoMensaje !== 2)
        throw new Error(
          response.data.baseResponse?.mensaje ||
            "No se pudo confirmar la decisión.",
        );
      enqueueSnackbar(
        confirm.action === "APROBAR"
          ? "Preaprobación confirmada correctamente."
          : "Área desaprobada. Se notificará solo al solicitante.",
        { variant: "success" },
      );
      setConfirm(null);
      setReload((v) => v + 1);
      changedRef.current?.();
    } catch (e) {
      setConfirm(null);
      fail(
        e,
        e instanceof Error ? e.message : "No se pudo confirmar la decisión.",
      );
    } finally {
      actionLock.current = false;
      setWorking(false);
    }
  };
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-title"
        className="flex h-[94vh] max-h-[94vh] w-full max-w-[1440px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-3">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
              Bandeja de aprobaciones
            </div>
            <h3
              id="approval-title"
              className="text-lg font-semibold text-slate-900"
            >
              Solicitud N° {idSolicitud}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Marca las áreas como preaprobadas y confirma la preaprobación al
              terminar.
            </p>
          </div>
          <button
            aria-label="Cerrar detalle"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col px-5 py-3">
          {loading && (
            <p
              role="status"
              className="py-8 text-center text-sm text-slate-500"
            >
              Cargando solicitud…
            </p>
          )}
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="shrink-0" />
              {error}
              <button
                className="ml-auto underline"
                disabled={busy}
                onClick={() => setReload((v) => v + 1)}
              >
                Recargar
              </button>
            </div>
          )}
          {detail && areas && !loading && (
            <>
              <div className="mb-3 shrink-0 rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-slate-800">
                    {detail.nombreTalento || "Talento"}
                  </h4>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[detail.estado] || "bg-slate-100"}`}
                  >
                    {statusLabels[detail.estado]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {
                    TIPOS_SOLICITUD_APROBACION.find(
                      (t) => t.value === detail.tipoSolicitud,
                    )?.label
                  }{" "}
                  · {detail.cliente}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                  <span>
                    Solicitado por{" "}
                    <strong className="font-medium text-slate-700">
                      {detail.usuarioSolicitante || "Sin información"}
                    </strong>
                  </span>
                  <span>
                    <ApprovalExpandableText
                      label="fecha"
                      value={formatApprovalDate(detail.fechaSolicitud)}
                      preview={
                        formatApprovalDate(detail.fechaSolicitud).split(" ")[0]
                      }
                    />
                  </span>
                </div>
                {detail.resumen && (
                  <div className="mt-1 text-xs text-slate-600">
                    <ApprovalExpandableText
                      label="resumen"
                      value={detail.resumen}
                      preview={
                        detail.resumen.length > 80
                          ? `${detail.resumen.slice(0, 80)}…`
                          : detail.resumen
                      }
                    />
                  </div>
                )}
              </div>
              <div
                role="tablist"
                aria-label="Áreas de la solicitud"
                className={`mb-3 grid gap-1 rounded-lg bg-slate-100 p-1 ${visibleTabs.length === 1 ? "grid-cols-1" : visibleTabs.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
              >
                {visibleTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const reviewed = areas.revisadas.includes(tab.area);
                  return (
                    <button
                      key={tab.area}
                      id={`tab-${tab.area}`}
                      role="tab"
                      aria-selected={active === tab.area}
                      aria-controls={`panel-${tab.area}`}
                      tabIndex={active === tab.area ? 0 : -1}
                      disabled={busy || dirty}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                          e.preventDefault();
                          const next =
                            visibleTabs[
                              (index +
                                (e.key === "ArrowRight"
                                  ? 1
                                  : visibleTabs.length - 1)) %
                                visibleTabs.length
                            ];
                          switchTab(next.area);
                          document.getElementById(`tab-${next.area}`)?.focus();
                        }
                      }}
                      onClick={() => switchTab(tab.area)}
                      className={`flex items-center justify-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${active === tab.area ? "bg-white font-semibold text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <Icon size={16} />
                      {tab.label}
                      {reviewed && (
                        <Check
                          size={14}
                          className="text-emerald-600"
                          aria-label="Revisada"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                {current && (
                  <section
                    role="tabpanel"
                    id={`panel-${active}`}
                    aria-labelledby={`tab-${active}`}
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-800">
                          {TABS.find((t) => t.area === active)?.label}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {TABS.find((t) => t.area === active)?.description}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[current.estado] || "bg-slate-100"}`}
                      >
                        {statusLabels[current.estado]}
                      </span>
                    </div>
                    {current.estado === "NO_APLICA" ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-9 text-center">
                        <CheckCircle2
                          className="mx-auto mb-2 text-slate-300"
                          size={28}
                        />
                        <p className="text-sm font-medium text-slate-600">
                          No aplica
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Esta solicitud no requiere acciones en esta área.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {keys.length === 0 && (
                            <p className="text-sm text-slate-500">
                              Solicitud de{" "}
                              {active === "CREDENCIALES"
                                ? detail.tipoSolicitud === "CESE"
                                  ? "baja de credenciales"
                                  : "creación de credenciales"
                                : "esta área"}{" "}
                              para {detail.nombreTalento}.
                            </p>
                          )}
                          {formGroups(active, keys).length > 1 && (
                            <div
                              role="tablist"
                              aria-label="Categorías del formulario"
                              className="flex flex-wrap gap-1 border-b border-slate-200"
                            >
                              {formGroups(active, keys).map(
                                (group, index, groups) => {
                                  const chosen = groups.some(
                                    (g) => g.label === category,
                                  )
                                    ? category
                                    : groups[0].label;
                                  return (
                                    <button
                                      key={group.label}
                                      type="button"
                                      role="tab"
                                      id={`category-${index}`}
                                      aria-controls={`category-panel-${index}`}
                                      aria-selected={chosen === group.label}
                                      tabIndex={chosen === group.label ? 0 : -1}
                                      onClick={() => setCategory(group.label)}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "ArrowRight" ||
                                          e.key === "ArrowLeft"
                                        ) {
                                          e.preventDefault();
                                          const next =
                                            (index +
                                              (e.key === "ArrowRight"
                                                ? 1
                                                : groups.length - 1)) %
                                            groups.length;
                                          setCategory(groups[next].label);
                                          document
                                            .getElementById(`category-${next}`)
                                            ?.focus();
                                        }
                                      }}
                                      className={`border-b-2 px-3 py-2 text-sm ${chosen === group.label ? "border-blue-600 font-semibold text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                                    >
                                      {group.label}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          )}
                          {formGroups(active, keys).map(
                            (group, index, groups) => (
                              <fieldset
                                key={group.label}
                                role="tabpanel"
                                id={`category-panel-${index}`}
                                aria-labelledby={
                                  groups.length > 1
                                    ? `category-${index}`
                                    : undefined
                                }
                                hidden={
                                  group.label !==
                                  (groups.some((g) => g.label === category)
                                    ? category
                                    : groups[0].label)
                                }
                                className="rounded-xl border border-slate-200 p-4"
                              >
                                <legend className="px-2 text-sm font-semibold text-slate-700">
                                  {group.label}
                                </legend>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                  {group.keys.map((key) => {
                                    const field = fieldMap[key];
                                    return field ? (
                                      <Input
                                        key={key}
                                        field={field}
                                        value={
                                          key in draft
                                            ? draft[key]
                                            : original(key)
                                        }
                                        disabled={busy}
                                        onChange={(v) =>
                                          setDraft((d) => ({ ...d, [key]: v }))
                                        }
                                      />
                                    ) : (
                                      <div key={key}>
                                        <div className="text-xs font-medium text-slate-500">
                                          {LABELS[key] || key}
                                        </div>
                                        <div className="mt-1 break-words text-sm text-slate-800">
                                          {text(current.datos[key]) ||
                                            "Sin información"}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </fieldset>
                            ),
                          )}
                        </div>
                        {current.fechaResolucion && (
                          <p className="mt-3 text-xs text-slate-500">
                            Resuelta por {current.usuario} ·{" "}
                            {formatApprovalDate(current.fechaResolucion)}
                          </p>
                        )}
                        {canManage && current.estado === "PENDIENTE" && (
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs text-slate-500">
                              {selected.includes(active)
                                ? "Marcada; pendiente de confirmar."
                                : "Revisa los datos antes de preaprobar."}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {dirty ? (
                                <>
                                  <button
                                    onClick={() => setDraft({})}
                                    disabled={busy}
                                    className="btn btn-outline-gray"
                                  >
                                    Descartar
                                  </button>
                                  <button
                                    onClick={save}
                                    disabled={busy}
                                    className="btn btn-blue"
                                  >
                                    {working
                                      ? "Guardando…"
                                      : "Guardar corrección"}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      openConfirm([active], "RECHAZAR")
                                    }
                                    disabled={
                                      busy ||
                                      reviewing ||
                                      !areas.revisadas.includes(active)
                                    }
                                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                                  >
                                    Desaprobar
                                  </button>
                                  <button
                                    onClick={() => choose(active)}
                                    disabled={
                                      busy ||
                                      reviewing ||
                                      !areas.revisadas.includes(active)
                                    }
                                    aria-pressed={selected.includes(active)}
                                    className="btn btn-blue disabled:opacity-40"
                                  >
                                    {selected.includes(active)
                                      ? "Preaprobado ✓"
                                      : "Preaprobado"}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                        {dirty && (
                          <p className="mt-3 text-xs text-amber-700">
                            Guarda o descarta la corrección antes de cambiar de
                            pestaña o aprobar.
                          </p>
                        )}
                      </>
                    )}
                  </section>
                )}
                {flow && (
                  <details className="mt-6 border-t border-slate-100 pt-4">
                    <summary className="cursor-pointer text-sm font-medium text-slate-500">
                      Actividad de la solicitud ({flow.historial.length})
                    </summary>
                    <ol className="mt-4 space-y-3">
                      {flow.historial.map((event) => (
                        <li
                          key={event.idHistorial}
                          className="border-l-2 border-slate-200 pl-3"
                        >
                          <p className="text-sm text-slate-600">
                            {event.accion.startsWith("CORREO_")
                              ? event.accion === "CORREO_ENVIADO"
                                ? "Notificación enviada"
                                : event.accion === "CORREO_OMITIDO"
                                  ? "Notificación omitida"
                                  : "No se pudo enviar la notificación"
                              : event.detalle ||
                                event.accion.replaceAll("_", " ").toLowerCase()}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatApprovalDate(event.fecha)} · {event.usuario}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </div>
            </>
          )}
        </div>
        {areas && canManage && (
          <footer className="border-t border-slate-100 bg-slate-50/80 px-6 py-4">
            <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
              <Clock3 size={14} />
              {reviewedCount === visibleTabs.length
                ? "Todas las áreas están revisadas."
                : `Áreas revisadas: ${reviewedCount}/${visibleTabs.length}.`}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="mr-auto text-sm text-slate-600">
                {selected.length} área(s) preaprobada(s)
              </span>
              <button
                disabled={busy || reviewing || dirty || selected.length === 0}
                onClick={() => openConfirm(selected, "APROBAR")}
                className="btn btn-blue disabled:opacity-40"
              >
                Confirmar PreAprobacion
              </button>
            </div>
          </footer>
        )}
      </div>
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h4
              id="confirm-title"
              className="text-lg font-semibold text-slate-900"
            >
              {confirm.action === "RECHAZAR"
                ? "Desaprobar área"
                : "Confirmar PreAprobacion"}
            </h4>
            <p className="mt-2 text-sm text-slate-500">
              {confirm.areas
                .map((a) => TABS.find((t) => t.area === a)?.label)
                .join(", ")}
              .{" "}
              {confirm.action === "RECHAZAR"
                ? "Se notificará únicamente al solicitante."
                : "Se guardarán las áreas preaprobadas y se notificará a las áreas involucradas."}
            </p>
            {confirm.action === "RECHAZAR" && (
              <label className="mt-4 block text-sm text-slate-600">
                Motivo
                <textarea
                  autoFocus
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input mt-2 min-h-[100px] w-full"
                />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                disabled={working}
                onClick={() => setConfirm(null)}
                className="btn btn-outline-gray"
              >
                Cancelar
              </button>
              <button
                disabled={
                  working || (confirm.action === "RECHAZAR" && !reason.trim())
                }
                onClick={decide}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40 ${confirm.action === "RECHAZAR" ? "bg-red-600" : "bg-blue-600"}`}
              >
                {working
                  ? "Confirmando…"
                  : confirm.action === "RECHAZAR"
                    ? "Desaprobar"
                    : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const Input = ({
  field,
  value,
  disabled,
  onChange,
}: {
  field: ApprovalEditableField;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) => (
  <label
    className="block text-xs font-medium text-slate-500"
    htmlFor={`area-${field.campo}`}
  >
    {field.etiqueta}
    {field.tipo === "SI_NO" ? (
      <select
        id={`area-${field.campo}`}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-1.5 w-full !rounded-lg"
      >
        <option value="">Seleccione</option>
        <option value="1">Sí</option>
        <option value="0">No</option>
      </select>
    ) : (
      <input
        id={`area-${field.campo}`}
        type={
          field.tipo === "FECHA"
            ? "date"
            : field.tipo === "NUMERO"
              ? "number"
              : "text"
        }
        min={field.tipo === "NUMERO" ? 0 : undefined}
        step={field.tipo === "NUMERO" ? "0.01" : undefined}
        maxLength={500}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-1.5 w-full !rounded-lg"
      />
    )}
  </label>
);
