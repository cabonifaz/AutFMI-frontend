import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileText,
  FileUp,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { PantallaWrapper } from "./PantallaWrapper";
import { Loading } from "../components/ui/Loading";
import { ModalCrearTalentoFMI } from "../components/ui/modals/ModalCrearTalentoFMI";
import { useRequerimientos } from "../hooks/useRequirements";
import { validateBlacklist } from "../services/blacklist.service";
import {
  agregarAlRequerimiento,
  analizarFmi,
  buscarCandidatos,
  obtenerTalentoDeRq,
} from "../services/cargaFmi.service";
import { FMIExtraction } from "../models/type/FMIExtraction";
import {
  SCORE_CLAVE_FUERTE,
  TalentMatch,
  nombreDeTalento,
} from "../models/type/TalentMatch";
import { RequirementItem } from "../models/type/RequirementItemType";
import { PerfilType } from "../models/type/PerfilType";
import {
  ESTADO_ATENDIDO,
  MOTIVO_INGRESO,
  TIPO_MODALIDAD,
} from "../utils/config";
import { useParams } from "../context/ParamsContext";
import { normalizar } from "../utils/quickCV";
import { AsignarTalentoType } from "../models/type/TalentoType";

type Paso = 1 | 2 | 3 | 4;

/** Talento elegido o recién creado: es lo único que hace falta llevar. */
type PersonaElegida = {
  idTalento: number;
  nombre: string;
  esNuevo: boolean;
  dni?: string | null;
  email?: string | null;
};

const PASOS: { numero: Paso; titulo: string }[] = [
  { numero: 1, titulo: "Formulario" },
  { numero: 2, titulo: "Persona" },
  { numero: 3, titulo: "Requerimiento" },
  { numero: 4, titulo: "Confirmar" },
];

const Stepper = ({ actual }: { actual: Paso }) => (
  <ol className="flex list-none items-center gap-3 p-0">
    {PASOS.map((paso, indice) => {
      const hecho = paso.numero < actual;
      const activo = paso.numero === actual;
      return (
        <li key={paso.numero} className="flex items-center gap-3">
          {indice > 0 && (
            <span
              className={`h-0.5 w-14 ${
                hecho || activo ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />
          )}
          <span className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                hecho
                  ? "bg-emerald-600 text-white"
                  : activo
                  ? "bg-[var(--color-blue)] text-white"
                  : "border border-gray-300 bg-white text-gray-400"
              }`}
            >
              {hecho ? <Check size={15} strokeWidth={3} /> : paso.numero}
            </span>
            <span
              className={`text-sm ${
                activo ? "font-semibold text-gray-800" : "text-gray-500"
              }`}
            >
              {paso.titulo}
            </span>
          </span>
        </li>
      );
    })}
  </ol>
);

const Dato = ({ label, valor }: { label: string; valor?: string | null }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </span>
    <span className="text-sm text-gray-800">{valor || "—"}</span>
  </div>
);

/**
 * Carga de un colaborador desde su FMI.
 *
 * Cuatro pasos: leer el formulario, resolver quién es, elegir el requerimiento
 * y confirmar. La persona entra al RQ **sin confirmar**: no se genera contrato,
 * ni solicitud de equipo, ni correos. Eso sigue saliendo de Asignar Talento.
 *
 * El punto delicado es la identidad: el FMI no trae documento ni correo, así
 * que la búsqueda por nombre solo propone, nunca decide, y cuando hay que crear
 * al talento se vuelve a buscar por el documento y el correo del CV, que es lo
 * único determinista.
 */
export default function PantallaCargarFMI() {
  const navigate = useNavigate();

  // Modalidad y motivo llegan del formulario como texto; hay que traducirlos a
  // sus maestros para que el ModalIngreso los reciba ya elegidos.
  const { paramsByMaestro } = useParams(`${TIPO_MODALIDAD},${MOTIVO_INGRESO}`);

  const [paso, setPaso] = useState<Paso>(1);
  const [cargando, setCargando] = useState(false);

  // Paso 1
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [fmiFile, setFmiFile] = useState<File | null>(null);
  const [extraccion, setExtraccion] = useState<FMIExtraction | null>(null);
  const [descarte, setDescarte] = useState<string | null>(null);

  // Paso 2
  const [busqueda, setBusqueda] = useState("");
  const [candidatos, setCandidatos] = useState<TalentMatch[] | null>(null);
  const [persona, setPersona] = useState<PersonaElegida | null>(null);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [duplicado, setDuplicado] = useState<TalentMatch | null>(null);

  // Paso 3
  const { requerimientos, loading: cargandoRqs, fetchRequerimientos } =
    useRequerimientos();
  const [rq, setRq] = useState<RequirementItem | null>(null);
  const [perfil, setPerfil] = useState<PerfilType | null>(null);
  const [filtroRq, setFiltroRq] = useState("");

  // Paso 4. El motivo puede venir vacío aunque esté bloqueado, así que el
  // aviso y el motivo se guardan por separado.
  const [bloqueoListaNegra, setBloqueoListaNegra] = useState<{
    motivo: string | null;
  } | null>(null);

  const ocupado = cargando || cargandoRqs;

  /** id del maestro cuyo nombre coincide con el texto del formulario. */
  const idPorNombre = (texto: string | null | undefined, maestro: string) => {
    const buscado = normalizar(texto);
    if (!buscado) return undefined;

    const opciones = paramsByMaestro[Number(maestro)] || [];
    return opciones.find((item) => normalizar(item.string1) === buscado)?.num1;
  };

  /**
   * Lo que el FMI aporta al formulario de ingreso, para que Asignar Talento no
   * lo pida otra vez. Viaja en el estado de la navegación y no se persiste
   * aquí: se guarda cuando el usuario confirme y finalice allí, que es el único
   * momento en que el sistema lo guarda.
   *
   * Quedan fuera a propósito el cargo y las fechas de contrato, aunque el paso 2
   * los muestre: el cargo sale del perfil de la vacante del RQ y las fechas se
   * proponen desde la duración de contrato del requerimiento. Traerlos de un
   * formulario anterior sería arrastrar datos de otro contrato.
   */
  const datosDeIngresoDelFmi = (): Partial<AsignarTalentoType> => {
    if (!extraccion) return {};

    return {
      idModalidadContrato: idPorNombre(extraccion.modalidad, TIPO_MODALIDAD),
      idMotivo: idPorNombre(extraccion.motivoIngreso, MOTIVO_INGRESO),
      horario: extraccion.horario || undefined,
      proyectoServicio: extraccion.proyectoServicio || undefined,
      objetoContrato: extraccion.objetoContrato || undefined,
      montoBase: extraccion.montoBase ?? undefined,
      montoMovilidad: extraccion.montoMovilidad ?? undefined,
    };
  };

  /** El cargo del formulario sugiere con qué perfil entra la persona. */
  const perfilSugerido = useMemo(() => {
    if (!rq?.lstPerfiles?.length) return null;
    const cargo = normalizar(extraccion?.cargo);
    if (!cargo) return null;

    return (
      rq.lstPerfiles.find((item) =>
        normalizar(item.perfil)
          .split(/\s+/)
          .some((palabra) => palabra.length > 3 && cargo.includes(palabra))
      ) || null
    );
  }, [rq, extraccion]);

  useEffect(() => {
    if (rq) setPerfil(perfilSugerido ?? null);
  }, [rq, perfilSugerido]);

  // Al llegar al paso 2 se busca sola la primera vez, con el nombre del
  // formulario: el operador solo reescribe si no sale quien esperaba.
  useEffect(() => {
    if (paso === 2 && candidatos === null && busqueda.trim()) {
      buscarPersona();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  // ─── Paso 1: leer el formulario ────────────────────────────────────────────

  const elegirArchivo = (archivo: File | null) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith(".pdf")) {
      enqueueSnackbar({
        message: "El formulario debe ser un PDF",
        variant: "warning",
      });
      return;
    }
    setFmiFile(archivo);
    setDescarte(null);
    setExtraccion(null);
  };

  const leerFormulario = async () => {
    if (!fmiFile) return;

    setCargando(true);
    try {
      const { data } = await analizarFmi(fmiFile);
      if (data.idMensaje !== 2 || !data.data) {
        enqueueSnackbar({
          message: data.mensaje || "No se pudo leer el formulario",
          variant: "error",
        });
        return;
      }

      if (!data.data.esFormularioIngreso) {
        setDescarte(
          data.data.motivoDescarte ||
            "El PDF no es un Formulario de Ingreso (FT-GTH-12)."
        );
        return;
      }

      setExtraccion(data.data);
      setBusqueda(data.data.nombreCompleto || "");
      setPaso(2);
    } catch (error) {
      enqueueSnackbar({
        message: "No se pudo leer el formulario",
        variant: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // ─── Paso 2: quién es ──────────────────────────────────────────────────────

  const buscarPersona = async () => {
    if (!busqueda.trim()) {
      enqueueSnackbar({
        message: "Escribe un nombre para buscar",
        variant: "warning",
      });
      return;
    }

    setCargando(true);
    try {
      const { data } = await buscarCandidatos({ busqueda: busqueda.trim() });
      if (data.idTipoMensaje !== 2) {
        enqueueSnackbar({ message: data.mensaje, variant: "warning" });
        setCandidatos([]);
        return;
      }
      setCandidatos(data.talentos || []);
    } catch (error) {
      enqueueSnackbar({
        message: "No se pudo buscar en el banco de talentos",
        variant: "error",
      });
      setCandidatos([]);
    } finally {
      setCargando(false);
    }
  };

  const elegirCandidato = (candidato: TalentMatch) => {
    setPersona({
      idTalento: candidato.idTalento,
      nombre: nombreDeTalento(candidato),
      esNuevo: false,
      dni: candidato.dni,
      email: candidato.email,
    });
  };

  /**
   * Recibe la persona por parámetro y no del estado: cuando se llama justo
   * después de crear el talento, `persona` todavía tiene el valor anterior.
   */
  const irAlRequerimiento = (elegida: PersonaElegida | null = persona) => {
    if (!elegida) return;
    // El cliente del formulario acota la lista de RQ; el filtro es editable.
    setFiltroRq(extraccion?.equipoOCliente || "");
    fetchRequerimientos({ nPag: 1, buscar: null, estado: null });
    setPaso(3);
  };

  // ─── Paso 3: a qué requerimiento ───────────────────────────────────────────

  const rqsVisibles = useMemo(() => {
    const termino = normalizar(filtroRq);
    return (requerimientos || [])
      .filter((item) => item.idEstado !== ESTADO_ATENDIDO)
      .filter(
        (item) =>
          !termino ||
          normalizar(item.codigoRQ).includes(termino) ||
          normalizar(item.titulo).includes(termino) ||
          normalizar(item.cliente).includes(termino)
      );
  }, [requerimientos, filtroRq]);

  const irAConfirmar = async () => {
    if (!persona || !rq || !perfil) return;

    setCargando(true);
    setBloqueoListaNegra(null);
    try {
      const { data } = await validateBlacklist({
        idTalento: persona.idTalento,
        idRequerimiento: rq.idRequerimiento,
      });
      if (data.result?.idMensaje === 2 && data.validacion?.bloqueado) {
        setBloqueoListaNegra({ motivo: data.validacion.motivo });
      }
    } catch (error) {
      enqueueSnackbar({
        message: "No se pudo verificar la lista negra. Continúa con cuidado.",
        variant: "warning",
      });
    } finally {
      setCargando(false);
      setPaso(4);
    }
  };

  // ─── Paso 4: agregar ───────────────────────────────────────────────────────

  const agregar = async () => {
    if (!persona || !rq || !perfil) return;

    setCargando(true);
    try {
      // Estado y situación salen del mismo endpoint que usa Asignar Talento,
      // para que la fila quede igual que si se hubiera agregado desde ahí.
      let idEstado = 1;
      let idSituacion = 1;
      let nombres = persona.nombre;
      let apellidos = "";
      let dni = persona.dni || "";
      let celular = "";
      let email = persona.email || "";

      try {
        const { data } = await obtenerTalentoDeRq(
          persona.idTalento,
          rq.idRequerimiento
        );
        if (data?.idTipoMensaje === 2 && data.talento) {
          const detalle = data.talento;
          idEstado = detalle.idEstado || 1;
          idSituacion = detalle.idSituacion || 1;
          nombres = detalle.nombres || nombres;
          apellidos = detalle.apellidos || "";
          dni = detalle.dni || dni;
          celular = detalle.celular || "";
          email = detalle.email || email;

          if (detalle.ingreso) {
            enqueueSnackbar({
              message: "Esta persona ya ingresó por este requerimiento.",
              variant: "warning",
            });
            return;
          }
        }
      } catch (error) {
        // Sin detalle se manda lo que ya se sabe: el SP no lo exige.
      }

      const { data } = await agregarAlRequerimiento(rq.idRequerimiento, {
        idTalento: persona.idTalento,
        nombres,
        apellidos,
        dni,
        celular,
        email,
        idSituacion,
        idEstado,
        idPerfil: perfil.idPerfil,
        confirmado: false,
        ingreso: 0,
        idEstadoRegistro: 1,
      });

      if (data.idTipoMensaje !== 2) {
        enqueueSnackbar({
          message: data.mensaje || "No se pudo agregar al requerimiento",
          variant: "error",
        });
        return;
      }

      enqueueSnackbar({
        message: `${persona.nombre} se agregó al ${rq.codigoRQ}`,
        variant: "success",
      });
      navigate("/tableAsignarTalento", {
        state: {
          idRequerimiento: rq.idRequerimiento,
          cargaFmi: {
            idTalento: persona.idTalento,
            datos: datosDeIngresoDelFmi(),
          },
        },
      });
    } catch (error) {
      enqueueSnackbar({
        message: "No se pudo agregar al requerimiento",
        variant: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {ocupado && <Loading overlayMode={true} />}
      <PantallaWrapper>
        <div className="flex h-screen flex-col gap-5 overflow-y-auto p-6">
          <div className="flex flex-none flex-col gap-1">
            <h2 className="text-2xl font-semibold">Cargar FMI</h2>
            <p className="text-sm text-gray-500">
              Registra a un colaborador y súmalo a un requerimiento a partir de
              su Formulario de Ingreso.
            </p>
          </div>

          <Stepper actual={paso} />

          {/* Paso 1 · el formulario */}
          {paso === 1 && (
            <div className="flex flex-col gap-4">
              <div className="card flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-gray-800">
                    Formulario de Ingreso (FT-GTH-12)
                  </h3>
                  <p className="text-sm text-gray-500">
                    Sirve el PDF que genera AutFMI y también uno redactado fuera
                    con el mismo formato.
                  </p>
                </div>

                <input
                  ref={inputArchivoRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => elegirArchivo(e.target.files?.[0] ?? null)}
                />

                <button
                  type="button"
                  onClick={() => inputArchivoRef.current?.click()}
                  disabled={ocupado}
                  className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-slate-50 p-10 transition-colors hover:border-[var(--color-blue)] disabled:opacity-60"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[var(--color-blue)]">
                    {fmiFile ? <FileText size={24} /> : <FileUp size={24} />}
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <span className="text-[15px] font-semibold text-gray-800">
                      {fmiFile
                        ? fmiFile.name
                        : "Selecciona el PDF del formulario"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {fmiFile
                        ? "Pulsa para cambiar el archivo"
                        : "Un solo archivo PDF"}
                    </span>
                  </span>
                </button>

                {descarte ? (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <span className="mt-0.5 flex-none text-red-600">
                      <X size={18} />
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-red-800">
                        Ese PDF no se puede usar
                      </span>
                      <p className="text-sm text-red-700">{descarte}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <span className="mt-0.5 flex-none text-amber-600">
                      <AlertTriangle size={18} />
                    </span>
                    <p className="text-sm text-amber-800">
                      Un PDF escaneado no se puede leer: el formulario tiene que
                      conservar su texto.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn mx-0 h-11 border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={leerFormulario}
                  disabled={!fmiFile || ocupado}
                  className={`btn mx-0 flex h-11 items-center gap-2 px-5 text-sm font-semibold ${
                    !fmiFile || ocupado
                      ? "cursor-not-allowed bg-gray-300 text-white"
                      : "btn-blue"
                  }`}
                >
                  Leer formulario
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Paso 2 · quién es */}
          {paso === 2 && extraccion && (
            <div className="flex flex-col gap-4">
              <div className="card flex flex-col gap-5">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Nombres y apellidos
                    </span>
                    <span className="text-2xl font-semibold text-gray-800">
                      {extraccion.nombreCompleto || "Sin nombre en el formulario"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {extraccion.etiquetaEquipo || "Equipo"}
                    </span>
                    <span className="text-base text-gray-800">
                      {extraccion.equipoOCliente || "—"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                  <Dato label="Cargo" valor={extraccion.cargo} />
                  <Dato label="Modalidad" valor={extraccion.modalidad} />
                  <Dato
                    label="Motivo de ingreso"
                    valor={extraccion.motivoIngreso}
                  />
                  <Dato label="Horario" valor={extraccion.horario} />
                  <Dato
                    label="Inicio de contrato"
                    valor={extraccion.fechaInicioContrato}
                  />
                  <Dato
                    label="Término de contrato"
                    valor={extraccion.fechaFinContrato}
                  />
                  <Dato
                    label="Proyecto / servicio"
                    valor={extraccion.proyectoServicio}
                  />
                  <Dato
                    label="Declarado en SUNAT"
                    valor={
                      extraccion.declaraSunat
                        ? `${extraccion.declaraSunat}${
                            extraccion.sedeDeclarar
                              ? ` · ${extraccion.sedeDeclarar}`
                              : ""
                          }`
                        : null
                    }
                  />
                  <Dato
                    label="Monto base"
                    valor={
                      extraccion.montoBase != null
                        ? `S/ ${extraccion.montoBase}`
                        : null
                    }
                  />
                  <Dato
                    label="Movilidad"
                    valor={
                      extraccion.montoMovilidad != null
                        ? `S/ ${extraccion.montoMovilidad}`
                        : null
                    }
                  />
                  <Dato label="Gestor que firma" valor={extraccion.gestor} />
                  <Dato label="Emitido" valor={extraccion.fechaEmision} />
                </div>

              </div>

              <div className="card flex flex-col gap-4">
                <div className="flex items-end gap-3">
                  <div className="flex flex-grow flex-col gap-1.5">
                    <label htmlFor="buscar" className="dropdown-label">
                      Buscar en el banco de talentos
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-gray-400">
                        <Search size={18} />
                      </span>
                      <input
                        id="buscar"
                        type="search"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && buscarPersona()}
                        className="input w-full !pl-10"
                      />
                    </div>
                    <span className="px-1 text-xs text-gray-400">
                      Viene del formulario. Puedes recortarlo, por ejemplo
                      dejando solo el apellido.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={buscarPersona}
                    disabled={ocupado}
                    className="btn btn-blue mx-0 h-11 px-5 text-sm font-semibold"
                  >
                    Buscar
                  </button>
                </div>

                {candidatos !== null && (
                  <div className="flex flex-col gap-2">
                    {candidatos.length === 0 ? (
                      <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-gray-500">
                        Nadie con ese nombre en el banco de talentos.
                      </p>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            {candidatos.length}{" "}
                            {candidatos.length === 1
                              ? "coincidencia"
                              : "coincidencias"}
                          </span>
                          <span className="text-xs text-gray-400">
                            Ordenadas por parecido
                          </span>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                          <table className="w-full">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-gray-500">
                              <tr>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Talento
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Documento
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Correo
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Situación
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  RQ
                                </th>
                                <th className="px-4 py-2.5 text-left font-semibold">
                                  Parecido
                                </th>
                                <th className="px-4 py-2.5" />
                              </tr>
                            </thead>
                            <tbody>
                              {candidatos.map((candidato) => {
                                const elegido =
                                  persona?.idTalento === candidato.idTalento;
                                return (
                                  <tr
                                    key={candidato.idTalento}
                                    className={`border-t border-gray-100 ${
                                      elegido ? "bg-sky-50" : ""
                                    }`}
                                  >
                                    <td className="px-4 py-3">
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-800">
                                          {nombreDeTalento(candidato)}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          Alta {candidato.fchAlta || "—"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {candidato.dni || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {candidato.email || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`badge ${
                                          candidato.situacion === "LIBRE"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-amber-100 text-amber-800"
                                        }`}
                                      >
                                        {candidato.situacion || "—"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {candidato.rqs ?? 0}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-600">
                                      {candidato.score ?? 0}%
                                      {(candidato.score ?? 0) >=
                                        SCORE_CLAVE_FUERTE && (
                                        <span className="ml-1 text-xs font-normal text-emerald-700">
                                          (documento o correo)
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          elegirCandidato(candidato)
                                        }
                                        className={`btn mx-0 h-9 px-4 text-xs font-semibold ${
                                          elegido
                                            ? "bg-emerald-600 text-white"
                                            : "btn-blue"
                                        }`}
                                      >
                                        {elegido ? "Elegido" : "Es este"}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Crear solo se ofrece después de haber buscado: evita el
                  duplicado por pereza. */}
              {candidatos !== null && (
                <div className="card flex items-center gap-4">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sky-50 text-[var(--color-blue-hover)]">
                    <UserPlus size={20} />
                  </span>
                  <div className="flex flex-grow flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      Ninguno de estos es
                    </span>
                    <span className="text-sm text-gray-500">
                      Se creará el talento con su CV, que es de donde salen su
                      correo, su celular y su documento.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarCrear(true)}
                    className="btn mx-0 h-10 border border-[var(--color-blue)] px-4 text-sm font-semibold text-[var(--color-blue-hover)]"
                  >
                    Crear con CV
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="btn mx-0 h-11 border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => irAlRequerimiento()}
                  disabled={!persona || ocupado}
                  className={`btn mx-0 flex h-11 items-center gap-2 px-5 text-sm font-semibold ${
                    !persona || ocupado
                      ? "cursor-not-allowed bg-gray-300 text-white"
                      : "btn-blue"
                  }`}
                >
                  {persona
                    ? `Continuar con ${persona.nombre}`
                    : "Elige o crea a la persona"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Paso 3 · a qué requerimiento */}
          {paso === 3 && persona && (
            <div className="flex flex-col gap-4">
              <div className="card flex flex-col gap-4">
                <div className="flex items-end gap-3">
                  <div className="flex flex-grow flex-col gap-1.5">
                    <label htmlFor="rq" className="dropdown-label">
                      Buscar requerimiento
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-gray-400">
                        <Search size={18} />
                      </span>
                      <input
                        id="rq"
                        type="search"
                        value={filtroRq}
                        onChange={(e) => setFiltroRq(e.target.value)}
                        placeholder="Código, título o cliente"
                        className="input w-full !pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {rqsVisibles.length === 0 ? (
                    <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-gray-500">
                      No hay requerimientos abiertos que coincidan.
                    </p>
                  ) : (
                    rqsVisibles.map((item) => {
                      const elegido = rq?.idRequerimiento === item.idRequerimiento;
                      return (
                        <div
                          key={item.idRequerimiento}
                          className={`rounded-lg border ${
                            elegido
                              ? "border-[var(--color-blue)] bg-sky-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <label className="flex cursor-pointer items-center gap-4 px-4 py-3.5">
                            <input
                              type="radio"
                              name="rq-sel"
                              checked={elegido}
                              onChange={() => setRq(item)}
                              className="input-checkbox"
                            />
                            <span className="flex flex-grow flex-col gap-1">
                              <span className="flex items-center gap-2.5">
                                <span className="text-[15px] font-semibold text-gray-800">
                                  {item.codigoRQ} · {item.titulo}
                                </span>
                                <span className="badge bg-emerald-100 text-emerald-800">
                                  {item.estado}
                                </span>
                              </span>
                              <span className="text-sm text-gray-500">
                                {item.cliente} · solicitado {item.fechaSolicitud}{" "}
                                · vence {item.fechaVencimiento}
                              </span>
                            </span>
                            <span className="flex flex-col items-end">
                              <span className="text-lg font-semibold text-gray-800">
                                {item.vacantesCubiertas} / {item.vacantes}
                              </span>
                              <span className="text-xs text-gray-400">
                                vacantes cubiertas
                              </span>
                            </span>
                          </label>

                          {/* Las vacantes se abren dentro del RQ elegido: la
                              pregunta de con qué vacante entra se responde aquí
                              mismo, no al final del paso. */}
                          {elegido && (
                            <div className="flex flex-col gap-3 border-t border-sky-200 px-4 py-4">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="text-sm font-semibold text-gray-800">
                                  ¿Con qué vacante entra?
                                </span>
                                {perfilSugerido && (
                                  <span className="text-xs text-gray-500">
                                    El cargo del formulario dice «
                                    {extraccion?.cargo}», por eso viene marcada
                                    esa.
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {(item.lstPerfiles || []).map((vacante) => {
                                  const libres =
                                    vacante.vacantesTotales -
                                    vacante.vacantesCubiertas;
                                  const llena = libres <= 0;
                                  const marcada =
                                    perfil?.idPerfil === vacante.idPerfil;
                                  return (
                                    <label
                                      key={vacante.idPerfil}
                                      className={`flex cursor-pointer flex-col gap-2.5 rounded-lg border bg-white p-3.5 ${
                                        marcada
                                          ? "border-[var(--color-blue)] ring-1 ring-[var(--color-blue)]"
                                          : "border-gray-200"
                                      }`}
                                    >
                                      <span className="flex items-start gap-2.5">
                                        <input
                                          type="radio"
                                          name="perfil"
                                          checked={marcada}
                                          onChange={() => setPerfil(vacante)}
                                          className="mt-0.5 h-4 w-4 flex-none accent-[var(--color-blue)]"
                                        />
                                        <span className="flex flex-grow flex-col">
                                          <span className="text-sm font-semibold text-gray-800">
                                            {vacante.perfil}
                                          </span>
                                          <span
                                            className={`text-xs ${
                                              llena
                                                ? "text-amber-700"
                                                : "text-gray-500"
                                            }`}
                                          >
                                            {llena
                                              ? "Vacantes ya cubiertas"
                                              : `${libres} ${
                                                  libres === 1
                                                    ? "vacante libre"
                                                    : "vacantes libres"
                                                }`}
                                          </span>
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700">
                                          {vacante.vacantesCubiertas}/
                                          {vacante.vacantesTotales}
                                        </span>
                                      </span>

                                      {/* Una casilla por vacante: se ve de un
                                          golpe cuántas quedan. */}
                                      <span className="flex gap-1">
                                        {Array.from({
                                          length: Math.max(
                                            vacante.vacantesTotales,
                                            1
                                          ),
                                        }).map((_, indice) => (
                                          <span
                                            key={indice}
                                            className={`h-2 flex-grow rounded-sm ${
                                              indice < vacante.vacantesCubiertas
                                                ? "bg-emerald-500"
                                                : "bg-gray-200"
                                            }`}
                                          />
                                        ))}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>

                              {(item.lstPerfiles || []).length === 0 && (
                                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                  Este requerimiento no tiene vacantes por
                                  perfil, así que no se puede agregar a nadie:
                                  la fila no aparecería en Asignar Talento.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPaso(2)}
                  className="btn mx-0 h-11 border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={irAConfirmar}
                  disabled={!rq || !perfil || ocupado}
                  className={`btn mx-0 flex h-11 items-center gap-2 px-5 text-sm font-semibold ${
                    !rq || !perfil || ocupado
                      ? "cursor-not-allowed bg-gray-300 text-white"
                      : "btn-blue"
                  }`}
                >
                  Revisar y agregar
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Paso 4 · confirmar */}
          {paso === 4 && persona && rq && perfil && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="card flex flex-col gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Persona
                  </span>
                  <span className="text-base font-semibold text-gray-800">
                    {persona.nombre}
                  </span>
                  <span className="text-sm text-gray-500">
                    {[persona.dni, persona.email].filter(Boolean).join(" · ") ||
                      "—"}
                  </span>
                  <span className="badge self-start bg-gray-100 text-gray-700">
                    {persona.esNuevo
                      ? "Talento creado ahora"
                      : "Talento que ya existía"}
                  </span>
                </div>

                <div className="card flex flex-col gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Requerimiento
                  </span>
                  <span className="text-base font-semibold text-gray-800">
                    {rq.codigoRQ}
                  </span>
                  <span className="text-sm text-gray-500">
                    {rq.titulo} · {rq.cliente}
                  </span>
                  <span className="badge self-start bg-sky-100 text-sky-800">
                    Perfil: {perfil.perfil}
                  </span>
                </div>
              </div>

              <div className="card flex flex-col gap-6 md:flex-row">
                <div className="flex flex-grow flex-col gap-2.5">
                  <span className="text-sm font-semibold text-emerald-700">
                    Qué va a pasar
                  </span>
                  <ul className="flex list-none flex-col gap-2 p-0 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check
                        size={15}
                        strokeWidth={3}
                        className="mt-1 flex-none text-emerald-600"
                      />
                      {persona.nombre} entra a la lista de postulantes del{" "}
                      {rq.codigoRQ}.
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        size={15}
                        strokeWidth={3}
                        className="mt-1 flex-none text-emerald-600"
                      />
                      Queda <strong>sin confirmar</strong>, con el perfil{" "}
                      {perfil.perfil}.
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        size={15}
                        strokeWidth={3}
                        className="mt-1 flex-none text-emerald-600"
                      />
                      Los demás postulantes del RQ no se tocan.
                    </li>
                  </ul>
                </div>
                <div className="flex flex-grow flex-col gap-2.5">
                  <span className="text-sm font-semibold text-amber-700">
                    Qué NO va a pasar
                  </span>
                  <ul className="flex list-none flex-col gap-2 p-0 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <X size={15} className="mt-1 flex-none text-gray-400" />
                      No se genera contrato ni formulario de ingreso.
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={15} className="mt-1 flex-none text-gray-400" />
                      No se crea solicitud de equipo ni correo corporativo.
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={15} className="mt-1 flex-none text-gray-400" />
                      No se envía ningún correo a nadie.
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Después de agregarlo se abre Asignar Talento. Cuando lo
                confirmes ahí, el formulario de ingreso llegará con lo que decía
                su FMI: modalidad, motivo de ingreso, horario, proyecto, objeto
                del contrato y estructura salarial. El cargo y las fechas de
                contrato siguen saliendo del requerimiento.
              </p>

              {bloqueoListaNegra && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="mt-0.5 flex-none text-amber-600">
                    <AlertTriangle size={18} />
                  </span>
                  <p className="text-sm text-amber-800">
                    {bloqueoListaNegra.motivo
                      ? `El talento se encuentra en la lista negra de este cliente por el motivo: ${bloqueoListaNegra.motivo}.`
                      : "El talento se encuentra en la lista negra de este cliente."}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPaso(3)}
                  className="btn mx-0 h-11 border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={agregar}
                  disabled={ocupado}
                  className="btn btn-primary mx-0 flex h-11 items-center gap-2 px-6 text-sm font-semibold"
                >
                  <Check size={18} />
                  Agregar al requerimiento
                </button>
              </div>
            </div>
          )}
        </div>
      </PantallaWrapper>

      {mostrarCrear && extraccion && (
        <ModalCrearTalentoFMI
          nombreFmi={extraccion.nombreCompleto || ""}
          nombresSugeridos={{
            nombres: extraccion.nombres || "",
            apellidoPaterno: extraccion.apellidoPaterno || "",
            apellidoMaterno: extraccion.apellidoMaterno || "",
          }}
          onClose={() => setMostrarCrear(false)}
          onDuplicado={(candidato) => {
            setMostrarCrear(false);
            setDuplicado(candidato);
          }}
          onCreado={(idTalento, nombre) => {
            const creada: PersonaElegida = {
              idTalento,
              nombre,
              esNuevo: true,
            };
            setMostrarCrear(false);
            setPersona(creada);
            irAlRequerimiento(creada);
          }}
        />
      )}

      {/* El CV trajo un documento o un correo que ya pertenece a alguien: por
          nombre no había salido porque está escrito distinto. */}
      {duplicado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="flex w-full max-w-[720px] flex-col overflow-hidden rounded-xl bg-white">
            <div className="flex items-start gap-4 px-7 pb-5 pt-6">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle size={22} />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold text-gray-800">
                  Ya hay un talento con ese documento o correo
                </h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  El CV trae datos que pertenecen a un talento registrado. Por el
                  nombre no había salido porque está escrito distinto.
                </p>
              </div>
            </div>

            <div className="mx-7 flex items-center gap-4 rounded-lg border border-gray-200 px-5 py-4">
              <div className="flex flex-grow flex-col gap-1">
                <span className="text-base font-semibold text-gray-800">
                  {nombreDeTalento(duplicado)}
                </span>
                <span className="text-sm text-gray-500">
                  {[duplicado.dni, duplicado.email, duplicado.celular]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                <span className="text-sm text-gray-500">
                  Alta {duplicado.fchAlta || "—"} · en {duplicado.rqs ?? 0}{" "}
                  requerimientos · {duplicado.situacion || "—"}
                </span>
              </div>
              <span className="badge bg-emerald-100 text-emerald-800">
                Coincidencia {duplicado.score ?? 0}%
              </span>
            </div>

            <div className="flex justify-end gap-3 px-7 py-5">
              <button
                type="button"
                onClick={() => {
                  setDuplicado(null);
                  setMostrarCrear(true);
                }}
                className="btn mx-0 h-11 border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700"
              >
                Volver al formulario
              </button>
              <button
                type="button"
                onClick={() => {
                  elegirCandidato(duplicado);
                  setDuplicado(null);
                  setCandidatos([duplicado]);
                }}
                className="btn btn-blue mx-0 flex h-11 items-center gap-2 px-5 text-sm font-semibold"
              >
                <Check size={18} />
                Usar este talento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
