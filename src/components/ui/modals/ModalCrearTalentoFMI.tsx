import { useMemo, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { FileText, UserPlus, X } from "lucide-react";
import { useParams } from "../../../context/ParamsContext";
import { Utils } from "../../../utils/utils";
import {
  analizarCv,
  buscarCandidatos,
  crearTalento,
} from "../../../services/cargaFmi.service";
import { AddTalentParams } from "../../../models/params/AddTalentParams";
import {
  SCORE_CLAVE_FUERTE,
  TalentMatch,
} from "../../../models/type/TalentMatch";
import {
  datosDelCV,
  nombresSeParecen,
  resumenDelCV,
} from "../../../utils/quickCV";

/** Maestros que necesita el mapeo del CV: países, ciudades y habilidades. */
const MAESTROS_CV = "12,13,19,20";
const MAESTRO_PAISES = 12;
const MAESTRO_CIUDADES = 13;
const MAESTRO_HAB_TECNICAS = 19;
const MAESTRO_HAB_BLANDAS = 20;

/** Perú en el maestro 12: es el país de casi todas las altas. */
const PAIS_PERU = 1;

/** Tipos de archivo del repositorio de BDT. */
const ARCHIVO_PDF = 1;
const DOCUMENTO_CV = 1;

interface Props {
  /** Nombre tal como lo escribe el formulario; manda sobre el del CV. */
  nombreFmi: string;
  nombresSugeridos: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  onClose: () => void;
  /** Se encontró a alguien con el mismo documento o correo que el CV. */
  onDuplicado: (candidato: TalentMatch) => void;
  onCreado: (idTalento: number, nombreCompleto: string) => void;
}

type Formulario = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  email: string;
  idPais: number;
  celular: string;
};

type Errores = Partial<Record<keyof Formulario, string>>;

/** Largo del número local en Perú; lo que sobre por delante es el prefijo. */
const LARGO_NUMERO_LOCAL = 9;

const soloDigitos = (texto?: string | null) => (texto ?? "").replace(/\D/g, "");

const partirCelular = (celular?: string | null) => {
  const digitos = soloDigitos(celular);
  if (!digitos) return { prefijo: "", numero: "" };
  if (digitos.length <= LARGO_NUMERO_LOCAL)
    return { prefijo: "", numero: digitos };
  return {
    prefijo: digitos.slice(0, digitos.length - LARGO_NUMERO_LOCAL),
    numero: digitos.slice(-LARGO_NUMERO_LOCAL),
  };
};

/**
 * Alta de un talento que no está en el banco.
 *
 * Basta con los datos básicos: nombres, apellidos, documento, correo, país y
 * celular. El CV es opcional y actúa como acelerador: si se adjunta, la IA lo
 * lee y la ficha nace además con ubicación, habilidades, experiencia, educación
 * e idiomas, y el propio CV queda guardado como archivo.
 *
 * El reparto de fuentes es deliberado: el FMI manda en la identidad —es el
 * documento contractual— y el CV llena el resto. Antes de crear se vuelve a
 * buscar por documento y correo, que es lo único determinista: el nombre del CV
 * puede estar escrito de otra forma.
 */
export const ModalCrearTalentoFMI = ({
  nombreFmi,
  nombresSugeridos,
  onClose,
  onDuplicado,
  onCreado,
}: Props) => {
  const { paramsByMaestro } = useParams(MAESTROS_CV);
  const paises = paramsByMaestro[MAESTRO_PAISES] || [];
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [creando, setCreando] = useState(false);
  const [cvLeido, setCvLeido] = useState(false);

  const [form, setForm] = useState<Formulario>({
    nombres: nombresSugeridos.nombres,
    apellidoPaterno: nombresSugeridos.apellidoPaterno,
    apellidoMaterno: nombresSugeridos.apellidoMaterno,
    dni: "",
    email: "",
    idPais: PAIS_PERU,
    celular: "",
  });
  const [errores, setErrores] = useState<Errores>({});

  /** Todo lo que el CV aporta y no se muestra, ya listo para el alta. */
  const [extra, setExtra] = useState<Partial<AddTalentParams>>({});
  const [resumen, setResumen] = useState<string[]>([]);
  const [nombreCv, setNombreCv] = useState<string>("");

  const ocupado = analizando || creando;

  const prefijoDelPais = (idPais: number) =>
    paises.find((pais) => pais.num1 === idPais)?.string3 || "";

  const setCampo = (campo: keyof Formulario, valor: string | number) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  /** El CV y el formulario pueden nombrar distinto a la misma persona. */
  const discrepanciaDeNombre = useMemo(() => {
    if (!cvLeido || !nombreCv) return false;
    return !nombresSeParecen(nombreCv, nombreFmi);
  }, [cvLeido, nombreCv, nombreFmi]);

  const handleArchivo = (archivo: File | null) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith(".pdf")) {
      enqueueSnackbar({ message: "El CV debe ser un PDF", variant: "warning" });
      return;
    }
    setCvFile(archivo);
    setCvLeido(false);
    setExtra({});
    setResumen([]);
    setNombreCv("");
  };

  const analizar = async () => {
    if (!cvFile) return;

    setAnalizando(true);
    try {
      const { data: respuesta } = await analizarCv(cvFile);
      if (respuesta.idMensaje !== 2 || !respuesta.data) {
        enqueueSnackbar({
          message: respuesta.mensaje || "No se pudo leer el CV",
          variant: "error",
        });
        return;
      }

      const datos = respuesta.data;
      const partido = partirCelular(datos.contacto?.celularNum);
      const prefijo =
        soloDigitos(datos.contacto?.celularCod) || partido.prefijo;
      const paisDetectado = prefijo
        ? paises.find((pais) => soloDigitos(pais.string3) === prefijo)?.num1
        : undefined;

      const resto = datosDelCV(datos, {
        paises,
        ciudades: paramsByMaestro[MAESTRO_CIUDADES] || [],
        habilidadesTecnicas: paramsByMaestro[MAESTRO_HAB_TECNICAS] || [],
        habilidadesBlandas: paramsByMaestro[MAESTRO_HAB_BLANDAS] || [],
      });

      // El nombre NO se pisa: el del formulario es el que vale.
      setForm((prev) => ({
        ...prev,
        dni: resto.dni ?? "",
        email: datos.contacto?.email?.trim() ?? "",
        idPais: paisDetectado ?? prev.idPais,
        celular: partido.numero,
      }));
      setExtra(resto);
      setResumen(resumenDelCV(resto));
      setNombreCv(
        `${datos.nombres ?? ""} ${datos.apellidoPaterno ?? ""} ${
          datos.apellidoMaterno ?? ""
        }`.trim()
      );
      setCvLeido(true);
    } catch (error) {
      enqueueSnackbar({
        message: "No se pudo analizar el CV",
        variant: "error",
      });
    } finally {
      setAnalizando(false);
    }
  };

  const validar = (): boolean => {
    const nuevos: Errores = {};
    if (!form.nombres.trim()) nuevos.nombres = "Los nombres son requeridos";
    if (!form.apellidoPaterno.trim())
      nuevos.apellidoPaterno = "El apellido paterno es requerido";
    if (!form.idPais) nuevos.idPais = "Seleccione un país";
    if (!form.celular.trim()) nuevos.celular = "El celular es requerido";
    else if (!/^\d{6,15}$/.test(form.celular.trim()))
      nuevos.celular = "Sólo dígitos (6 a 15)";
    if (!form.email.trim()) nuevos.email = "El correo es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nuevos.email = "Correo inválido";

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  /**
   * Segunda pasada de deduplicación: con el documento y el correo del CV, que
   * son las claves que el formulario no tiene. Es lo que atrapa al homónimo mal
   * escrito antes de crear una ficha repetida.
   */
  const yaExiste = async (): Promise<TalentMatch | null> => {
    if (!form.dni.trim() && !form.email.trim()) return null;

    try {
      const { data } = await buscarCandidatos({
        dni: form.dni.trim(),
        email: form.email.trim(),
      });
      if (data.idTipoMensaje !== 2) return null;

      return (
        (data.talentos || []).find(
          (candidato) => (candidato.score ?? 0) >= SCORE_CLAVE_FUERTE
        ) || null
      );
    } catch (error) {
      // Si la comprobación falla no se bloquea el alta: se avisa y sigue.
      enqueueSnackbar({
        message: "No se pudo verificar si ya existía. Revísalo después.",
        variant: "warning",
      });
      return null;
    }
  };

  const crear = async () => {
    if (!validar()) return;

    setCreando(true);
    try {
      const duplicado = await yaExiste();
      if (duplicado) {
        onDuplicado(duplicado);
        return;
      }

      // El CV es opcional: sin él se crea con lo que hay en pantalla.
      const cvArchivo = cvFile
        ? {
            stringB64: await Utils.fileToBase64(cvFile),
            nombreArchivo: Utils.getFileNameWithoutExtension(cvFile.name),
            extensionArchivo: "pdf",
            idTipoArchivo: ARCHIVO_PDF,
            idTipoDocumento: DOCUMENTO_CV,
          }
        : undefined;

      const params: AddTalentParams = {
        ...extra,
        dni: form.dni.trim() || null,
        nombres: form.nombres.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim() || null,
        email: form.email.trim(),
        telefono: `${prefijoDelPais(form.idPais)} ${form.celular.trim()}`,
        idPais: extra.idPais ?? form.idPais,
        idMoneda: null,
        tieneEquipo: false,
        cvArchivo,
      };

      const { data } = await crearTalento(params);
      if (data.idMensaje !== 2) {
        enqueueSnackbar({
          message: data.mensaje || "No se pudo crear el talento",
          variant: "warning",
        });
        return;
      }

      const nombreCompleto = `${form.nombres.trim()} ${form.apellidoPaterno.trim()} ${form.apellidoMaterno.trim()}`
        .replace(/\s+/g, " ")
        .trim();

      enqueueSnackbar({
        message: data.mensaje || "Talento creado",
        variant: "success",
      });
      onCreado(data.idNuevo, nombreCompleto);
    } catch (error) {
      enqueueSnackbar({
        message: "No se pudo crear el talento",
        variant: "error",
      });
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-[840px] flex-col overflow-hidden rounded-xl bg-white">
        <div className="flex items-start gap-4 border-b border-gray-100 px-7 py-5">
          <div className="flex flex-grow flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-800">
              Crear el talento con su CV
            </h2>
            <p className="text-sm text-gray-500">
              El formulario da el nombre; el CV da todo lo demás: correo,
              celular, documento, habilidades y experiencia.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={ocupado}
            aria-label="Cerrar"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-7 py-5">
          <input
            ref={inputArchivoRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleArchivo(e.target.files?.[0] ?? null)}
          />

          {!cvLeido ? (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-white text-[var(--color-blue)]">
                  <FileText size={20} />
                </span>
                <div className="flex min-w-0 flex-grow flex-col">
                  <span className="truncate text-sm font-semibold text-gray-800">
                    {cvFile ? cvFile.name : "Adjuntar su CV (opcional)"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Si lo adjuntas, la ficha nace con habilidades, experiencia,
                    educación e idiomas. Si no, se crea con lo de abajo.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => inputArchivoRef.current?.click()}
                  disabled={ocupado}
                  className="h-9 flex-none rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {cvFile ? "Cambiar" : "Elegir CV"}
                </button>
              </div>

              {cvFile && (
                <button
                  type="button"
                  onClick={analizar}
                  disabled={ocupado}
                  className="h-11 rounded-lg bg-[var(--color-blue)] text-sm font-semibold text-white hover:bg-[var(--color-blue-hover)] disabled:opacity-60"
                >
                  {analizando ? "Analizando el CV…" : "Analizar CV"}
                </button>
              )}
            </div>
          ) : (
              <div className="flex items-center gap-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white text-[var(--color-blue-hover)]">
                  <FileText size={20} />
                </span>
                <span className="flex min-w-0 flex-grow flex-col">
                  <span className="truncate text-sm font-semibold text-gray-800">
                    {cvFile?.name}
                  </span>
                  <span className="text-xs text-sky-800">
                    Analizado
                    {resumen.length > 0
                      ? ` · se detectaron ${resumen.join(", ")}`
                      : ""}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => inputArchivoRef.current?.click()}
                  disabled={ocupado}
                  className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cambiar CV
                </button>
              </div>
          )}

          {discrepanciaDeNombre && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  El CV dice <strong>«{nombreCv}»</strong> y el formulario{" "}
                  <strong>«{nombreFmi}»</strong>. Se guardará el nombre del
                  formulario; revisa que el CV sea de la misma persona.
                </p>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="cf-nombres" className="dropdown-label">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cf-nombres"
                    type="text"
                    value={form.nombres}
                    onChange={(e) => setCampo("nombres", e.target.value)}
                    className="input"
                  />
                  {errores.nombres && (
                    <span className="text-xs text-red-500">
                      {errores.nombres}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cf-paterno" className="dropdown-label">
                    Apellido paterno <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cf-paterno"
                    type="text"
                    value={form.apellidoPaterno}
                    onChange={(e) => setCampo("apellidoPaterno", e.target.value)}
                    className="input"
                  />
                  {errores.apellidoPaterno && (
                    <span className="text-xs text-red-500">
                      {errores.apellidoPaterno}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cf-materno" className="dropdown-label">
                    Apellido materno
                  </label>
                  <input
                    id="cf-materno"
                    type="text"
                    value={form.apellidoMaterno}
                    onChange={(e) => setCampo("apellidoMaterno", e.target.value)}
                    className="input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="cf-dni" className="dropdown-label">
                    Documento
                  </label>
                  <input
                    id="cf-dni"
                    type="text"
                    value={form.dni}
                    onChange={(e) => setCampo("dni", e.target.value)}
                    className="input"
                  />
                  <span className="text-xs text-gray-500">
                    {extra.dni ? "Leído del CV" : "Opcional, pero ayuda a no duplicarlo"}
                  </span>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label htmlFor="cf-email" className="dropdown-label">
                    Correo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cf-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setCampo("email", e.target.value)}
                    className="input"
                  />
                  {errores.email && (
                    <span className="text-xs text-red-500">
                      {errores.email}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="cf-pais" className="dropdown-label">
                    País <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="cf-pais"
                    value={form.idPais}
                    onChange={(e) => setCampo("idPais", Number(e.target.value))}
                    className="dropdown"
                  >
                    <option value={0}>Seleccione un país</option>
                    {paises.map((pais) => (
                      <option key={pais.idParametro} value={pais.num1}>
                        {pais.string1}
                      </option>
                    ))}
                  </select>
                  {errores.idPais && (
                    <span className="text-xs text-red-500">
                      {errores.idPais}
                    </span>
                  )}
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label htmlFor="cf-celular" className="dropdown-label">
                    Celular <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="flex w-20 items-center justify-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-sm text-gray-600">
                      {prefijoDelPais(form.idPais) || "+00"}
                    </span>
                    <input
                      id="cf-celular"
                      type="tel"
                      value={form.celular}
                      onChange={(e) =>
                        setCampo("celular", e.target.value.replace(/\D/g, ""))
                      }
                      className="input !rounded-l-none"
                    />
                  </div>
                  {errores.celular && (
                    <span className="text-xs text-red-500">
                      {errores.celular}
                    </span>
                  )}
                </div>
              </div>

              {resumen.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                  <span className="text-sm font-semibold text-gray-700">
                    Del CV también se guardará, sin que tengas que revisarlo
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {resumen.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                      >
                        {item}
                      </span>
                    ))}
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                      El CV como archivo
                    </span>
                  </div>
                </div>
              )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-slate-50 px-7 py-4">
          <span className="text-xs text-gray-500">
            Antes de crearlo se comprueba que el documento y el correo no sean de
            alguien que ya está.
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={ocupado}
              className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={crear}
              disabled={ocupado}
              className="flex h-11 items-center gap-2 rounded-lg bg-[var(--color-blue)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-blue-hover)] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <UserPlus size={18} />
              {creando ? "Creando…" : "Crear talento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
