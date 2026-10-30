import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { enqueueSnackbar } from "notistack";
import { CloseModalButton } from "../CloseModalButton";
import {
  approveApprovalRequest,
  getApprovalDetail,
  getApprovalFlow,
  updateApprovalForm,
} from "../../../services/approval.service";
import {
  AccionHistorialAprobacion,
  ApprovalDetail,
  ApprovalEditableField,
  ApprovalFlow,
  ESTADOS_SOLICITUD_APROBACION,
  TIPOS_SOLICITUD_APROBACION,
} from "../../../models/type/ApprovalRequest";

interface Props {
  idSolicitud: number;
  onClose: () => void;
  onSessionExpired: () => void;
  /** Se llama tras guardar o aprobar, para refrescar la bandeja. */
  onChanged?: () => void;
}

const labelOf = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

// Mismas etiquetas que ApprovalFormPolicy del backend.
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

const ACCIONES: Record<AccionHistorialAprobacion, { label: string; color: string }> = {
  CREADA: { label: "Solicitud registrada", color: "bg-blue-500" },
  FORMULARIO_EDITADO: { label: "Formulario editado", color: "bg-yellow-500" },
  APROBADA: { label: "Flujo aprobado", color: "bg-green-600" },
  EJECUTADA: { label: "Operación registrada", color: "bg-green-600" },
  EJECUCION_FALLIDA: { label: "Error al registrar la operación", color: "bg-red-600" },
  EJECUCION_INCIERTA: { label: "Registro sin confirmar: verificar", color: "bg-orange-500" },
  CORREO_ENVIADO: { label: "Correo enviado (activado)", color: "bg-slate-500" },
  CORREO_OMITIDO: { label: "Correo no enviado (desactivado)", color: "bg-gray-400" },
  CORREO_FALLIDO: { label: "Correo con error", color: "bg-red-500" },
};

type FormValues = Record<string, unknown>;

/** Objeto del JSON del formulario; null si no es un objeto legible. */
const parseForm = (json: string): FormValues | null => {
  try {
    const parsed = JSON.parse(json);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as FormValues;
  } catch {
    return null;
  }
};

const asText = (value: unknown) =>
  value === null || value === undefined
    ? ""
    : typeof value === "object"
    ? JSON.stringify(value)
    : String(value);

const display = (campo: string, value: unknown) => {
  if (campo === "tieneEquipo") return value === 1 ? "Sí" : value === 0 ? "No" : asText(value);
  return asText(value);
};

/** Valor del borrador en el tipo que espera el backend. */
const toPayload = (field: ApprovalEditableField, value: string): string | number | null => {
  if (field.tipo === "NUMERO" || field.tipo === "SI_NO") return value.trim() === "" ? null : Number(value);
  return value.trim() === "" && field.tipo === "FECHA" ? null : value;
};

const errorInfo = (err: unknown) => ({
  status: isAxiosError(err) ? err.response?.status : undefined,
  mensaje: isAxiosError(err)
    ? (err.response?.data as { baseResponse?: { mensaje?: string } } | undefined)?.baseResponse?.mensaje
    : undefined,
});

export const ModalSolicitudAprobacion = ({ idSolicitud, onClose, onSessionExpired, onChanged }: Props) => {
  const [detail, setDetail] = useState<ApprovalDetail | null>(null);
  const [flow, setFlow] = useState<ApprovalFlow | null>(null);
  const [flowError, setFlowError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const onSessionExpiredRef = useRef(onSessionExpired);
  onSessionExpiredRef.current = onSessionExpired;
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    let vigente = true;
    setError(null);

    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      setDetail(null);
      setLoading(false);
      setError("La solicitud indicada no es válida.");
      return;
    }

    setLoading(true);
    // El flujo es complementario: si falla, el detalle se muestra igual.
    const flowRequest = getApprovalFlow(idSolicitud).then(
      (response) => ({ response, failed: false as const }),
      (err) => ({ err, failed: true as const })
    );

    Promise.all([getApprovalDetail(idSolicitud), flowRequest])
      .then(([response, flowResult]) => {
        if (!vigente) return;
        setLoading(false);
        if (response.data.baseResponse?.idTipoMensaje === 2 && response.data.data) {
          setDetail(response.data.data);
          setDraft({});
        } else {
          setDetail(null);
          setError(response.data.baseResponse?.mensaje || "No se pudo cargar la solicitud.");
          return;
        }
        if (!flowResult.failed && flowResult.response.data.baseResponse?.idTipoMensaje === 2) {
          setFlow(flowResult.response.data.data);
          setFlowError(false);
        } else {
          if (flowResult.failed && errorInfo(flowResult.err).status === 401) {
            onSessionExpiredRef.current();
            return;
          }
          setFlow(null);
          setFlowError(true);
        }
      })
      .catch((err) => {
        if (!vigente) return;
        setLoading(false);
        setDetail(null);
        const { status } = errorInfo(err);
        if (status === 401) {
          onSessionExpiredRef.current();
          return;
        }
        setError(
          status === 404
            ? "La solicitud no existe o no está asignada a tus clientes."
            : status === 403
            ? "No tienes permiso para ver la bandeja de aprobaciones."
            : "No se pudo cargar la solicitud."
        );
      });

    return () => {
      vigente = false;
    };
  }, [idSolicitud, reloadKey]);

  const busy = saving || approving;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || busy) return;
      if (confirmOpen) setConfirmOpen(false);
      else onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, confirmOpen, busy]);

  const form = detail ? parseForm(detail.datosFormulario) : null;
  const editable = useMemo(
    () => (flow?.puedeGestionar ? flow.camposEditables : []),
    [flow]
  );
  const editableByCampo = useMemo(
    () => Object.fromEntries(editable.map((f) => [f.campo, f])),
    [editable]
  );

  const original = (campo: string) => asText(campo === "notificarProntoInicio"
    ? form?.[campo] ?? flow?.notificarProntoInicio ?? 0 : form?.[campo]);
  const valueOf = (campo: string) => (campo in draft ? draft[campo] : original(campo));
  const changed = editable.filter((f) => f.campo in draft && draft[f.campo] !== original(f.campo));
  const hasChanges = changed.length > 0;

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const handleActionError = (err: unknown, fallback: string) => {
    const { status, mensaje } = errorInfo(err);
    if (status === 401) {
      onSessionExpiredRef.current();
      return;
    }
    setActionError(mensaje || fallback);
    // 409/422: la solicitud cambió (otro gestor aprobó o editó) o volvió a pendiente.
    if (status === 409 || status === 422) {
      reload();
      onChangedRef.current?.();
    }
  };

  const save = async () => {
    if (!flow || !hasChanges) return;
    setSaving(true);
    setActionError(null);
    const cambios = Object.fromEntries(changed.map((f) => [f.campo, toPayload(f, draft[f.campo])]));
    try {
      const response = await updateApprovalForm(idSolicitud, flow.version, cambios);
      if (response.data.baseResponse?.idTipoMensaje === 2) {
        enqueueSnackbar("Cambios guardados.", { variant: "success" });
        reload();
        onChangedRef.current?.();
      } else {
        setActionError(response.data.baseResponse?.mensaje || "No se pudieron guardar los cambios.");
      }
    } catch (err) {
      handleActionError(err, "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const approve = async () => {
    if (!flow) return;
    setApproving(true);
    setActionError(null);
    try {
      const response = await approveApprovalRequest(idSolicitud, flow.version);
      setConfirmOpen(false);
      if (response.data.baseResponse?.idTipoMensaje === 2) {
        enqueueSnackbar(response.data.baseResponse.mensaje || "Solicitud aprobada.", { variant: "success" });
        reload();
        onChangedRef.current?.();
      } else {
        // 202: aprobada con resultado incierto. Cambió el estado: se recarga.
        setActionError(response.data.baseResponse?.mensaje || "No se pudo aprobar la solicitud.");
        reload();
        onChangedRef.current?.();
      }
    } catch (err) {
      setConfirmOpen(false);
      handleActionError(err, "No se pudo aprobar la solicitud.");
    } finally {
      setApproving(false);
    }
  };

  const formKeys = form ? Object.keys(form).filter((key) => key !== "notificarProntoInicio" && key !== "seleccion") : [];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-solicitud-aprobacion"
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="titulo-solicitud-aprobacion" className="text-lg font-semibold">
            Solicitud N° {Number.isInteger(idSolicitud) ? idSolicitud : "-"}
          </h3>
          <CloseModalButton onClick={() => !busy && onClose()} />
        </div>

        {loading && !detail && (
          <p role="status" className="py-6 text-center text-sm text-gray-500">
            Cargando solicitud…
          </p>
        )}

        {!loading && error && (
          <p role="alert" className="py-6 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {detail && (
          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Field label="Tipo" value={labelOf(TIPOS_SOLICITUD_APROBACION, detail.tipoSolicitud)} />
              <Field label="Estado" value={labelOf(ESTADOS_SOLICITUD_APROBACION, detail.estado)} />
              <Field label="Cliente" value={detail.cliente} />
              <Field label="Talento" value={detail.nombreTalento} />
              <Field label="Solicitado por" value={detail.usuarioSolicitante} />
              <Field label="Fecha de solicitud" value={detail.fechaSolicitud} />
              {detail.fechaModificacion && (
                <Field
                  label="Última modificación"
                  value={`${detail.fechaModificacion} · ${detail.usuarioModificacion ?? ""}`}
                />
              )}
            </dl>
            {detail.resumen && <Field label="Resumen" value={detail.resumen} />}

            <section aria-labelledby="titulo-formulario">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 id="titulo-formulario" className="text-sm font-semibold text-gray-700">
                  Datos del formulario
                </h4>
                {editable.length > 0 && (
                  <span className="text-xs text-gray-500">Los campos con borde se pueden editar.</span>
                )}
              </div>
              {form ? (
                formKeys.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin datos.</p>
                ) : (
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-2">
                    {formKeys.map((key) => {
                      const field = editableByCampo[key];
                      const label = ETIQUETAS_CAMPO[key] ?? key;
                      if (!field) return <Field key={key} label={label} value={display(key, form[key])} />;
                      return (
                        <EditableInput
                          key={key}
                          field={field}
                          value={valueOf(key)}
                          disabled={busy}
                          onChange={(v) => setDraft((d) => ({ ...d, [key]: v }))}
                        />
                      );
                    })}
                  </dl>
                )
              ) : (
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs">{detail.datosFormulario}</pre>
              )}
            </section>

            {detail.tipoSolicitud === "INGRESO" && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flow?.prontoInicioDisponible === true && valueOf("notificarProntoInicio") === "1"}
                    disabled={busy || !flow?.puedeGestionar || !flow?.prontoInicioDisponible}
                    onChange={(event) => setDraft((d) => ({ ...d, notificarProntoInicio: event.target.checked ? "1" : "0" }))}
                  />
                  Enviar aviso de pronto inicio
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  {flow?.prontoInicioDisponible
                    ? "Desmarca y guarda los cambios antes de aprobar para omitir los avisos de este ingreso."
                    : "No disponible: requiere un único contrato activo de Outsourcing con avisos pendientes. Los contratos históricos o ya notificados conservan su estado."}
                </p>
              </div>
            )}

            {actionError && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </p>
            )}

            {flow && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {!flow.puedeGestionar && (
                  <span className="mr-auto text-xs text-gray-500">
                    {flow.estado !== "PENDIENTE"
                      ? "La solicitud ya no está pendiente."
                      : "Solo un gestor asignado al cliente puede editar y aprobar esta solicitud."}
                  </span>
                )}
                {flow.puedeGestionar && (
                  <>
                    {hasChanges && (
                      <button
                        type="button"
                        className="btn btn-outline-gray"
                        disabled={busy}
                        onClick={() => setDraft({})}
                      >
                        Descartar cambios
                      </button>
                    )}
                    <button
                      type="button"
                      className={`btn ${hasChanges && !busy ? "btn-blue" : "btn-disabled"}`}
                      disabled={!hasChanges || busy}
                      onClick={save}
                    >
                      {saving ? "Guardando…" : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      className={`btn ${!hasChanges && !busy ? "btn-primary" : "btn-disabled"}`}
                      disabled={hasChanges || busy}
                      title={hasChanges ? "Guarda o descarta los cambios antes de aprobar" : undefined}
                      onClick={() => {
                        setActionError(null);
                        setConfirmOpen(true);
                      }}
                    >
                      Aprobar flujo completo
                    </button>
                  </>
                )}
              </div>
            )}

            <section aria-labelledby="titulo-linea-tiempo">
              <h4 id="titulo-linea-tiempo" className="mb-3 text-sm font-semibold text-gray-700">
                Línea de tiempo
              </h4>
              {flowError && (
                <p className="text-sm text-gray-500">No se pudo cargar la línea de tiempo.</p>
              )}
              {flow && flow.historial.length === 0 && (
                <p className="text-sm text-gray-500">Sin eventos registrados.</p>
              )}
              {flow && flow.historial.length > 0 && (
                <ol className="relative ml-2 border-l border-gray-200">
                  {flow.historial.map((h) => {
                    const esCorreo = ["CORREO_ENVIADO", "CORREO_OMITIDO", "CORREO_FALLIDO"].includes(h.accion);
                    // Solo cambia la presentación; se conserva el detalle original de auditoría.
                    const sinReporte = h.accion === "CORREO_OMITIDO" && /sin reporte/i.test(h.detalle ?? "");
                    const accion = sinReporte
                      ? { label: "Correo no enviado (sin reporte)", color: "bg-gray-400" }
                      : ACCIONES[h.accion] ?? { label: h.accion, color: "bg-gray-400" };
                    return (
                      <li key={h.idHistorial} className="mb-4 ml-5">
                        <span
                          aria-hidden="true"
                          className={`absolute -left-[7px] mt-1 h-3 w-3 rounded-full ring-4 ring-white ${accion.color}`}
                        />
                        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                          <span className="font-medium text-gray-800">{accion.label}</span>
                          {h.estadoNuevo && h.estadoAnterior !== h.estadoNuevo && (
                            <span className="text-xs text-gray-500">
                              → {labelOf(ESTADOS_SOLICITUD_APROBACION, h.estadoNuevo)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {h.fecha} · {h.usuario}
                        </div>
                        {!esCorreo && h.detalle && <p className="mt-1 break-words text-sm text-gray-700">{h.detalle}</p>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          </div>
        )}
      </div>

      {confirmOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmar-aprobacion"
            aria-describedby="texto-confirmar-aprobacion"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
          >
            <h4 id="titulo-confirmar-aprobacion" className="mb-2 text-lg font-semibold">
              ¿Aprobar el flujo completo?
            </h4>
            <p id="texto-confirmar-aprobacion" className="mb-4 text-sm text-gray-700">
              Se registrará el {labelOf(TIPOS_SOLICITUD_APROBACION, detail.tipoSolicitud).toLowerCase()} de{" "}
              <strong>{detail.nombreTalento || "el talento"}</strong> en {detail.cliente} y se enviarán los
              formularios a Talento, Soporte y los gestores. Esta acción no se puede deshacer desde la bandeja.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-outline-gray"
                disabled={approving}
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`btn ${approving ? "btn-disabled" : "btn-primary"}`}
                disabled={approving}
                onClick={approve}
              >
                {approving ? "Aprobando…" : "Sí, aprobar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditableInput = ({
  field,
  value,
  disabled,
  onChange,
}: {
  field: ApprovalEditableField;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) => {
  const id = `campo-${field.campo}`;
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-gray-500">
        {field.etiqueta}
      </label>
      {field.tipo === "SI_NO" ? (
        <select
          id={id}
          className="input mt-1 w-full"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>
      ) : (
        <input
          id={id}
          className="input mt-1 w-full"
          type={field.tipo === "NUMERO" ? "number" : field.tipo === "FECHA" ? "date" : "text"}
          min={field.tipo === "NUMERO" ? 0 : undefined}
          step={field.tipo === "NUMERO" ? "0.01" : undefined}
          maxLength={field.tipo === "TEXTO" ? 500 : undefined}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div>
    <dt className="text-xs font-medium text-gray-500">{label}</dt>
    <dd className="break-words text-gray-800">{value || "-"}</dd>
  </div>
);
