import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { CloseModalButton } from "../CloseModalButton";
import { getApprovalDetail } from "../../../services/approval.service";
import {
  ApprovalDetail,
  ESTADOS_SOLICITUD_APROBACION,
  TIPOS_SOLICITUD_APROBACION,
} from "../../../models/type/ApprovalRequest";

interface Props {
  idSolicitud: number;
  onClose: () => void;
  onSessionExpired: () => void;
}

const labelOf = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

/** Entradas del JSON del formulario; null si no es un objeto legible. */
const formEntries = (json: string): [string, string][] | null => {
  try {
    const parsed = JSON.parse(json);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return Object.entries(parsed).map(([key, value]) => [
      key,
      value !== null && typeof value === "object" ? JSON.stringify(value) : String(value ?? ""),
    ]);
  } catch {
    return null;
  }
};


export const ModalSolicitudAprobacion = ({ idSolicitud, onClose, onSessionExpired }: Props) => {
  const [detail, setDetail] = useState<ApprovalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onSessionExpiredRef = useRef(onSessionExpired);
  onSessionExpiredRef.current = onSessionExpired;

  useEffect(() => {
    let vigente = true;
    setDetail(null);
    setError(null);

    if (!Number.isInteger(idSolicitud) || idSolicitud < 1) {
      setLoading(false);
      setError("La solicitud indicada no es válida.");
      return;
    }

    setLoading(true);
    getApprovalDetail(idSolicitud)
      .then((response) => {
        if (!vigente) return;
        setLoading(false);
        if (response.data.baseResponse?.idTipoMensaje === 2 && response.data.data) {
          setDetail(response.data.data);
        } else {
          setError(response.data.baseResponse?.mensaje || "No se pudo cargar la solicitud.");
        }
      })
      .catch((err) => {
        if (!vigente) return;
        setLoading(false);
        const status = isAxiosError(err) ? err.response?.status : undefined;
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
  }, [idSolicitud]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const entries = detail ? formEntries(detail.datosFormulario) : null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-solicitud-aprobacion"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="titulo-solicitud-aprobacion" className="text-lg font-semibold">
            Solicitud N° {Number.isInteger(idSolicitud) ? idSolicitud : "-"}
          </h3>
          <CloseModalButton onClick={onClose} />
        </div>

        {loading && (
          <p role="status" className="py-6 text-center text-sm text-gray-500">
            Cargando solicitud…
          </p>
        )}

        {!loading && error && (
          <p role="alert" className="py-6 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && detail && (
          <div className="flex flex-col gap-4">
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

            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">Datos del formulario</h4>
              {entries ? (
                entries.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin datos.</p>
                ) : (
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-2">
                    {entries.map(([key, value]) => (
                      <Field key={key} label={key} value={value} />
                    ))}
                  </dl>
                )
              ) : (
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs">{detail.datosFormulario}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div>
    <dt className="text-xs font-medium text-gray-500">{label}</dt>
    <dd className="break-words text-gray-800">{value || "-"}</dd>
  </div>
);
