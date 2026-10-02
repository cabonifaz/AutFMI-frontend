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
  CargaFmiParams,
  analizarFmi,
  buscarCandidatos,
  cargarDesdeFmi,
} from "../services/cargaFmi.service";
import { FMIExtraction } from "../models/type/FMIExtraction";
import {
  SCORE_CLAVE_FUERTE,
  TalentMatch,
  nombreDeTalento,
} from "../models/type/TalentMatch";
import { RequirementItem } from "../models/type/RequirementItemType";
import {
  MOTIVO_INGRESO,
  TIPO_MODALIDAD,
  TIPO_MONEDA,
  UNIDAD,
} from "../utils/config";
import { useParams } from "../context/ParamsContext";
import { normalizar } from "../utils/quickCV";
import { sedeSunatList } from "../models/type/SedeSunatType";

type Paso = 1 | 2 | 3 | 4;

/**
 * Siempre se registra el contrato. Lo que se elige es si queda referenciado a
 * un requerimiento (TALENTO_CONTRATO.ID_RQ) o suelto.
 */
type Destino = "ambos" | "contrato";

/** Lo que el usuario puede corregir antes de confirmar. */
type DatosContrato = {
  idArea: number;
  cargo: string;
  idModalidadContrato: number;
  idMotivo: number;
  horario: string;
  proyectoServicio: string;
  objetoContrato: string;
  declararSunat: number;
  sedeDeclarar: string;
  ubicacion: string;
  idMoneda: number;
  montoBase: string;
  montoMovilidad: string;
  montoMensual: string;
  montoTrimestral: string;
  montoSemestral: string;
  fchInicioContrato: string;
  fchTerminoContrato: string;
  activo: boolean;
};

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

/** Área del maestro 7 que usa el formulario cuando el servicio es outsourcing. */
const AREA_OUTSOURCING = "Outsourcing";

/** Los cinco importes de la estructura salarial, en el orden del formulario. */
const MONTOS: [
  (
    | "montoBase"
    | "montoMovilidad"
    | "montoMensual"
    | "montoTrimestral"
    | "montoSemestral"
  ),
  string
][] = [
  ["montoBase", "Monto base"],
  ["montoMovilidad", "Movilidad"],
  ["montoMensual", "Bono mensual"],
  ["montoTrimestral", "Bono trimestral"],
  ["montoSemestral", "Bono semestral"],
];

/** ¿La fecha ya pasó? Sin fecha se asume que el contrato sigue abierto. */
const esFechaPasada = (fecha?: string | null) => {
  if (!fecha) return false;
  const hoy = new Date().toISOString().slice(0, 10);
  return fecha < hoy;
};

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
  const { paramsByMaestro } = useParams(
    `${TIPO_MODALIDAD},${MOTIVO_INGRESO},${UNIDAD},${TIPO_MONEDA}`
  );

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
  const [destino, setDestino] = useState<Destino>("ambos");
  const [rq, setRq] = useState<RequirementItem | null>(null);
  const [filtroRq, setFiltroRq] = useState("");

  /** Lo que se va a escribir, editable en el paso 4. */
  const [datos, setDatos] = useState<DatosContrato | null>(null);

  /** "3500.00" -> 3500; vacío o no numérico -> null. */
  const aNumero = (valor: string) => {
    const limpio = valor.trim();
    if (limpio === "") return null;
    const numero = Number(limpio);
    return Number.isFinite(numero) ? numero : null;
  };
  const [erroresDatos, setErroresDatos] = useState<
    Partial<Record<keyof DatosContrato, string>>
  >({});

  const necesitaRq = destino === "ambos";

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
   * Todo lo que el FMI aporta, listo para que el usuario lo revise y corrija.
   *
   * El formulario es la fuente, pero nada se escribe sin pasar por pantalla: un
   * FMI antiguo puede traer un monto o un horario que ya no corresponde.
   */
  const datosDelFmi = (): DatosContrato => {
    const hoy = new Date().toISOString().slice(0, 10);
    const declara = normalizar(extraccion?.declaraSunat).startsWith("si");

    // El formulario rotula esa fila como "Cliente" en outsourcing y como
    // "Equipo" en el resto; solo en el segundo caso es un área del maestro 7.
    const idArea = extraccion?.esOutsourcing
      ? idPorNombre(AREA_OUTSOURCING, UNIDAD) ?? 0
      : idPorNombre(extraccion?.equipoOCliente, UNIDAD) ?? 0;

    return {
      idArea,
      cargo: extraccion?.cargo || "",
      idModalidadContrato:
        idPorNombre(extraccion?.modalidad, TIPO_MODALIDAD) ?? 0,
      idMotivo: idPorNombre(extraccion?.motivoIngreso, MOTIVO_INGRESO) ?? 0,
      horario: extraccion?.horario || "",
      proyectoServicio: extraccion?.proyectoServicio || "",
      objetoContrato: extraccion?.objetoContrato || "",
      // El PDF escribe "Sí" o "No"; en el contrato son 1 y 2.
      declararSunat: declara ? 1 : 2,
      sedeDeclarar: declara
        ? sedeSunatList.find(
            (sede) =>
              normalizar(sede.nombre) === normalizar(extraccion?.sedeDeclarar)
          )?.nombre || ""
        : "",
      ubicacion: "",
      // El importe viaja sin símbolo, así que la moneda no se puede deducir del
      // PDF: queda en la primera del maestro y se corrige si hace falta.
      idMoneda: (paramsByMaestro[Number(TIPO_MONEDA)] || [])[0]?.num1 ?? 1,
      montoBase: extraccion?.montoBase != null ? String(extraccion.montoBase) : "",
      montoMovilidad:
        extraccion?.montoMovilidad != null
          ? String(extraccion.montoMovilidad)
          : "",
      montoMensual: "",
      montoTrimestral: "",
      montoSemestral: "",
      fchInicioContrato: extraccion?.fechaInicioContrato || hoy,
      fchTerminoContrato: extraccion?.fechaFinContrato || "",
      // Un FMI cuyo contrato ya venció entra como terminado, pero es el usuario
      // quien lo decide.
      activo: !esFechaPasada(extraccion?.fechaFinContrato),
    };
  };

  const setDato = <C extends keyof DatosContrato>(
    campo: C,
    valor: DatosContrato[C]
  ) => {
    setDatos((prev) => (prev ? { ...prev, [campo]: valor } : prev));
    setErroresDatos((prev) => ({ ...prev, [campo]: undefined }));
  };

  /**
   * Las mismas reglas que exige el formulario de ingreso de Asignar Talento
   * (`EntryFormSchema`), porque lo que se escribe acaba en las mismas columnas.
   *
   * La única diferencia deliberada: la fecha de término es opcional. Un FMI
   * puede venir de un contrato sin plazo, y el SP lo registra con
   * TIENE_DURACION en 0.
   */
  const validarDatos = (valores: DatosContrato) => {
    const fallos: Partial<Record<keyof DatosContrato, string>> = {};
    const vacio = (texto: string) => texto.trim() === "";

    if (vacio(valores.cargo)) fallos.cargo = "Campo obligatorio";
    if (!valores.idArea) fallos.idArea = "Seleccione el equipo o área";
    if (!valores.idModalidadContrato)
      fallos.idModalidadContrato = "Seleccione la modalidad";
    if (!valores.idMotivo) fallos.idMotivo = "Seleccione el motivo de ingreso";
    if (vacio(valores.horario)) fallos.horario = "Campo obligatorio";
    if (vacio(valores.proyectoServicio))
      fallos.proyectoServicio = "Campo obligatorio";
    if (vacio(valores.objetoContrato))
      fallos.objetoContrato = "Campo obligatorio";
    if (vacio(valores.ubicacion)) fallos.ubicacion = "Campo obligatorio";
    if (!valores.idMoneda) fallos.idMoneda = "Seleccione la moneda";

    if (!valores.declararSunat)
      fallos.declararSunat = "Indique si se declara en SUNAT";
    // Igual que en el formulario de ingreso: la sede sólo se exige cuando sí
    // se declara.
    else if (valores.declararSunat !== 2 && vacio(valores.sedeDeclarar))
      fallos.sedeDeclarar = "Indique la sede a declarar";

    if (!valores.fchInicioContrato)
      fallos.fchInicioContrato = "Campo obligatorio";
    else if (
      valores.fchTerminoContrato &&
      valores.fchTerminoContrato < valores.fchInicioContrato
    )
      fallos.fchTerminoContrato =
        "La fecha de fin no puede ser menor que la de inicio";

    const base = aNumero(valores.montoBase);
    if (base === null) fallos.montoBase = "Campo obligatorio";
    else if (base <= 0) fallos.montoBase = "El monto base debe ser mayor a 0";

    // Los bonos y la movilidad son opcionales, pero si se escriben tienen que
    // ser un número válido.
    (
      [
        "montoMovilidad",
        "montoMensual",
        "montoTrimestral",
        "montoSemestral",
      ] as const
    ).forEach((campo) => {
      const valor = valores[campo];
      if (valor.trim() !== "" && aNumero(valor) === null)
        fallos[campo] = "Monto inválido";
    });

    return fallos;
  };

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

  /**
   * Abre el alta de un talento nuevo. Deselecciona al candidato que estuviera
   * marcado: dejar una fila resaltada mientras se crea a otra persona se lee
   * como que se va a usar esa.
   */
  const abrirCrearTalento = () => {
    setPersona(null);
    setMostrarCrear(true);
  };

  // Al llegar al paso 2 se busca sola la primera vez, con el nombre del
  // formulario: el operador solo reescribe si no sale quien esperaba.
  useEffect(() => {
    if (paso === 2 && candidatos === null && busqueda.trim()) {
      buscarPersona();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

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
    // Sin filtro por estado: el requerimiento solo se referencia, así que uno
    // ya atendido o cerrado es un destino válido para un FMI antiguo.
    return (requerimientos || []).filter(
      (item) =>
        !termino ||
        normalizar(item.codigoRQ).includes(termino) ||
        normalizar(item.titulo).includes(termino) ||
        normalizar(item.cliente).includes(termino)
    );
  }, [requerimientos, filtroRq]);

  const irAConfirmar = async () => {
    if (!persona) return;
    if (necesitaRq && !rq) return;

    // Los datos se siembran al entrar, no antes: así el usuario puede volver al
    // paso 3, cambiar de destino y seguir viendo lo mismo del formulario.
    setDatos(datosDelFmi());
    setErroresDatos({});
    setCargando(true);
    setBloqueoListaNegra(null);
    try {
      // Sin requerimiento no hay cliente contra el que validar la restricción.
      if (necesitaRq && rq) {
        const { data } = await validateBlacklist({
          idTalento: persona.idTalento,
          idRequerimiento: rq.idRequerimiento,
        });
        if (data.result?.idMensaje === 2 && data.validacion?.bloqueado) {
          setBloqueoListaNegra({ motivo: data.validacion.motivo });
        }
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

  const registrar = async () => {
    if (!persona || !datos) return;
    if (necesitaRq && !rq) return;

    const fallos = validarDatos(datos);
    if (Object.keys(fallos).length > 0) {
      setErroresDatos(fallos);
      enqueueSnackbar({
        message: "Revisa los datos del contrato antes de registrarlo",
        variant: "warning",
      });
      return;
    }

    setCargando(true);
    try {
      const params: CargaFmiParams = {
        idTalento: persona.idTalento,
        idRequerimiento: necesitaRq ? rq?.idRequerimiento ?? null : null,
        activo: datos.activo,

        idArea: datos.idArea || null,
        cargo: datos.cargo.trim() || null,
        idModalidadContrato: datos.idModalidadContrato || null,
        idMotivo: datos.idMotivo || null,
        horario: datos.horario.trim() || null,
        proyectoServicio: datos.proyectoServicio.trim() || null,
        objetoContrato: datos.objetoContrato.trim() || null,
        declararSunat: datos.declararSunat,
        sedeDeclarar: datos.sedeDeclarar.trim() || null,
        ubicacion: datos.ubicacion.trim() || null,
        // El contrato guarda la razón social, y el cliente del RQ manda sobre lo
        // que diga el formulario.
        cliente:
          (necesitaRq ? rq?.cliente : null) ||
          extraccion?.equipoOCliente ||
          null,

        idMoneda: datos.idMoneda || null,
        montoBase: aNumero(datos.montoBase),
        montoMovilidad: aNumero(datos.montoMovilidad),
        montoMensual: aNumero(datos.montoMensual),
        montoTrimestral: aNumero(datos.montoTrimestral),
        montoSemestral: aNumero(datos.montoSemestral),

        fchInicioContrato: datos.fchInicioContrato,
        fchTerminoContrato: datos.fchTerminoContrato || null,
      };

      const { data } = await cargarDesdeFmi(params);
      if (data.idTipoMensaje !== 2) {
        enqueueSnackbar({
          message: data.mensaje || "No se pudo registrar al colaborador",
          variant: "error",
        });
        return;
      }

      enqueueSnackbar({ message: data.mensaje, variant: "success" });

      // Siempre al inicio: la carga no toca el requerimiento, así que abrir
      // Asignar Talento no mostraría nada nuevo y se leería como un error.
      navigate("/listaTalentos");
    } catch (error) {
      enqueueSnackbar({
        message: "No se pudo registrar al colaborador",
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
                    onClick={abrirCrearTalento}
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
              <div className="card flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    ¿Qué se va a registrar?
                  </span>
                  <span className="text-sm text-gray-500">
                    En los dos casos se registra su contrato y su movimiento de
                    ingreso. Lo que eliges es si queda anotado de qué
                    requerimiento salió.
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    {
                      id: "ambos" as Destino,
                      titulo: "Requerimiento y contrato",
                      detalle:
                        "El contrato queda referenciado a ese RQ. El requerimiento no cambia: ni su cobertura ni su lista de postulantes.",
                    },
                    {
                      id: "contrato" as Destino,
                      titulo: "Solo el contrato",
                      detalle:
                        "Contrato suelto, para colaboradores cuyo requerimiento ya no existe o que nunca pasaron por uno.",
                    },
                  ].map((opcion) => (
                    <label
                      key={opcion.id}
                      className={`flex cursor-pointer gap-3 rounded-lg border p-3.5 ${
                        destino === opcion.id
                          ? "border-[var(--color-blue)] bg-sky-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="destino"
                        checked={destino === opcion.id}
                        onChange={() => setDestino(opcion.id)}
                        className="mt-0.5 h-4 w-4 flex-none accent-[var(--color-blue)]"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                          {opcion.titulo}
                        </span>
                        <span className="text-xs text-gray-500">
                          {opcion.detalle}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {necesitaRq && (
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
                      Ningún requerimiento coincide con la búsqueda.
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

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              )}

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
                  disabled={(necesitaRq && !rq) || ocupado}
                  className={`btn mx-0 flex h-11 items-center gap-2 px-5 text-sm font-semibold ${
                    (necesitaRq && !rq) || ocupado
                      ? "cursor-not-allowed bg-gray-300 text-white"
                      : "btn-blue"
                  }`}
                >
                  Revisar lo que se va a registrar
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Paso 4 · revisar y registrar */}
          {paso === 4 && persona && datos && (
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
                      : "Talento existente"}
                  </span>
                </div>

                <div className="card flex flex-col gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Se registrará
                  </span>
                  {necesitaRq && rq ? (
                    <>
                      <span className="text-base font-semibold text-gray-800">
                        {rq.codigoRQ}
                      </span>
                      <span className="text-sm text-gray-500">
                        {rq.titulo} · {rq.cliente}
                      </span>
                      <span className="badge self-start bg-sky-100 text-sky-800">
                        Solo como referencia del contrato
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Contrato suelto, sin requerimiento asociado.
                    </span>
                  )}
                  <span className="badge self-start bg-emerald-100 text-emerald-800">
                    Contrato y movimiento de ingreso
                  </span>
                </div>
              </div>

              <div className="card flex flex-col gap-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">
                        Datos del contrato
                      </span>
                      <span className="text-sm text-gray-500">
                        Vienen del FMI. Corrige lo que haga falta: esto es lo que
                        queda guardado.
                      </span>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={datos.activo}
                        onChange={(e) => setDato("activo", e.target.checked)}
                        className="input-checkbox"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                          Contrato vigente
                        </span>
                        <span className="text-xs text-gray-500">
                          Desmárcalo si el contrato ya terminó
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="d-cargo" className="dropdown-label">
                        Cargo
                      </label>
                      <input
                        id="d-cargo"
                        type="text"
                        value={datos.cargo}
                        onChange={(e) => setDato("cargo", e.target.value)}
                        className="input"
                      />
                      {erroresDatos.cargo && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.cargo}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="d-area" className="dropdown-label">
                        Equipo / área
                      </label>
                      <select
                        id="d-area"
                        value={datos.idArea}
                        onChange={(e) => setDato("idArea", Number(e.target.value))}
                        className="dropdown"
                      >
                        <option value={0}>Sin definir</option>
                        {(paramsByMaestro[Number(UNIDAD)] || []).map((item) => (
                          <option key={item.idParametro} value={item.num1}>
                            {item.string1}
                          </option>
                        ))}
                      </select>
                      {erroresDatos.idArea && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.idArea}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="d-modalidad" className="dropdown-label">
                        Modalidad
                      </label>
                      <select
                        id="d-modalidad"
                        value={datos.idModalidadContrato}
                        onChange={(e) =>
                          setDato("idModalidadContrato", Number(e.target.value))
                        }
                        className="dropdown"
                      >
                        <option value={0}>Sin definir</option>
                        {(paramsByMaestro[Number(TIPO_MODALIDAD)] || []).map(
                          (item) => (
                            <option key={item.idParametro} value={item.num1}>
                              {item.string1}
                            </option>
                          )
                        )}
                      </select>
                      {erroresDatos.idModalidadContrato && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.idModalidadContrato}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="d-motivo" className="dropdown-label">
                        Motivo de ingreso
                      </label>
                      <select
                        id="d-motivo"
                        value={datos.idMotivo}
                        onChange={(e) => setDato("idMotivo", Number(e.target.value))}
                        className="dropdown"
                      >
                        <option value={0}>Sin definir</option>
                        {(paramsByMaestro[Number(MOTIVO_INGRESO)] || []).map(
                          (item) => (
                            <option key={item.idParametro} value={item.num1}>
                              {item.string1}
                            </option>
                          )
                        )}
                      </select>
                      {erroresDatos.idMotivo && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.idMotivo}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label htmlFor="d-horario" className="dropdown-label">
                        Horario de trabajo
                      </label>
                      <input
                        id="d-horario"
                        type="text"
                        value={datos.horario}
                        onChange={(e) => setDato("horario", e.target.value)}
                        className="input"
                      />
                      {erroresDatos.horario && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.horario}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="d-inicio" className="dropdown-label">
                        Inicio de contrato <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="d-inicio"
                        type="date"
                        value={datos.fchInicioContrato}
                        onChange={(e) =>
                          setDato("fchInicioContrato", e.target.value)
                        }
                        className="input"
                      />
                      {erroresDatos.fchInicioContrato && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.fchInicioContrato}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="d-fin" className="dropdown-label">
                        Término de contrato
                      </label>
                      <input
                        id="d-fin"
                        type="date"
                        value={datos.fchTerminoContrato}
                        onChange={(e) =>
                          setDato("fchTerminoContrato", e.target.value)
                        }
                        className="input"
                      />
                      {erroresDatos.fchTerminoContrato && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.fchTerminoContrato}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="d-ubicacion" className="dropdown-label">
                        Ubicación
                      </label>
                      <input
                        id="d-ubicacion"
                        type="text"
                        value={datos.ubicacion}
                        onChange={(e) => setDato("ubicacion", e.target.value)}
                        className="input"
                      />
                      {erroresDatos.ubicacion && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.ubicacion}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label htmlFor="d-proyecto" className="dropdown-label">
                        Proyecto / servicio
                      </label>
                      <input
                        id="d-proyecto"
                        type="text"
                        value={datos.proyectoServicio}
                        onChange={(e) =>
                          setDato("proyectoServicio", e.target.value)
                        }
                        className="input"
                      />
                      {erroresDatos.proyectoServicio && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.proyectoServicio}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-3">
                      <label htmlFor="d-objeto" className="dropdown-label">
                        Objeto del contrato
                      </label>
                      <input
                        id="d-objeto"
                        type="text"
                        value={datos.objetoContrato}
                        onChange={(e) => setDato("objetoContrato", e.target.value)}
                        className="input"
                      />
                      {erroresDatos.objetoContrato && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.objetoContrato}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="d-sunat" className="dropdown-label">
                        Declarado en SUNAT
                      </label>
                      <select
                        id="d-sunat"
                        value={datos.declararSunat}
                        onChange={(e) => {
                          const valor = Number(e.target.value);
                          setDato("declararSunat", valor);
                          // Sin declaración no hay sede que elegir.
                          if (valor === 2) setDato("sedeDeclarar", "");
                        }}
                        className="dropdown"
                      >
                        <option value={1}>Sí</option>
                        <option value={2}>No</option>
                      </select>
                      {erroresDatos.declararSunat && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.declararSunat}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label htmlFor="d-sede" className="dropdown-label">
                        Sede a declarar
                      </label>
                      <select
                        id="d-sede"
                        value={datos.sedeDeclarar}
                        disabled={datos.declararSunat === 2}
                        onChange={(e) => setDato("sedeDeclarar", e.target.value)}
                        className="dropdown disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <option value="">
                          {datos.declararSunat === 2
                            ? "No aplica"
                            : "Seleccione la sede"}
                        </option>
                        {sedeSunatList.map((sede) => (
                          <option key={sede.idSede} value={sede.nombre}>
                            {sede.nombre}
                          </option>
                        ))}
                      </select>
                      {erroresDatos.sedeDeclarar && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.sedeDeclarar}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">
                        Estructura salarial
                      </span>
                      <span className="text-xs text-gray-500">
                        El formulario no imprime la moneda, así que revísala.
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="d-moneda" className="dropdown-label">
                          Moneda
                        </label>
                        <select
                          id="d-moneda"
                          value={datos.idMoneda}
                          onChange={(e) =>
                            setDato("idMoneda", Number(e.target.value))
                          }
                          className="dropdown"
                        >
                          {(paramsByMaestro[Number(TIPO_MONEDA)] || []).map(
                            (item) => (
                              <option key={item.idParametro} value={item.num1}>
                                {item.string1}
                              </option>
                            )
                          )}
                        </select>
                      {erroresDatos.idMoneda && (
                        <span className="text-xs text-red-500">
                          {erroresDatos.idMoneda}
                        </span>
                      )}
                      </div>
                      {MONTOS.map(([campo, etiqueta]) => (
                        <div key={campo} className="flex flex-col gap-1">
                          <label htmlFor={"d-" + campo} className="dropdown-label">
                            {etiqueta}
                          </label>
                          <input
                            id={"d-" + campo}
                            type="number"
                            step="0.01"
                            min="0"
                            value={datos[campo]}
                            onChange={(e) => setDato(campo, e.target.value)}
                            className="input"
                          />
                          {erroresDatos[campo] && (
                            <span className="text-xs text-red-500">
                              {erroresDatos[campo]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              <div className="card flex flex-col gap-6 md:flex-row">
                <div className="flex flex-grow flex-col gap-2.5">
                  <span className="text-sm font-semibold text-emerald-700">
                    Qué va a pasar
                  </span>
                  <ul className="flex list-none flex-col gap-2 p-0 text-sm text-gray-700">
                    {necesitaRq && rq && (
                      <li className="flex items-start gap-2">
                        <Check
                          size={15}
                          strokeWidth={3}
                          className="mt-1 flex-none text-emerald-600"
                        />
                        <span>
                          El contrato queda anotado como procedente del{" "}
                          {rq.codigoRQ}, y así se ve en su expediente.
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Check
                        size={15}
                        strokeWidth={3}
                        className="mt-1 flex-none text-emerald-600"
                      />
                      <span>
                        Se crea su contrato{" "}
                        {datos.activo ? "vigente" : "terminado"} y su movimiento
                        de ingreso en el expediente.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check
                        size={15}
                        strokeWidth={3}
                        className="mt-1 flex-none text-emerald-600"
                      />
                      <span>
                        Si no tiene correo corporativo se le genera; si ya tiene,
                        se conserva.
                      </span>
                    </li>
                  </ul>
                </div>
                <span className="hidden w-px bg-gray-100 md:block" />
                <div className="flex flex-grow flex-col gap-2.5">
                  <span className="text-sm font-semibold text-amber-700">
                    Qué NO va a pasar
                  </span>
                  <ul className="flex list-none flex-col gap-2 p-0 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <X size={15} className="mt-1 flex-none text-gray-400" />
                      <span>
                        No se envía ningún correo ni se generan los formularios en
                        PDF.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={15} className="mt-1 flex-none text-gray-400" />
                      <span>
                        No se toca el requerimiento: no aparece entre sus
                        postulantes ni cuenta en sus vacantes cubiertas.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={15} className="mt-1 flex-none text-gray-400" />
                      <span>No se crea solicitud de equipo: el FMI no la trae.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X size={15} className="mt-1 flex-none text-gray-400" />
                      <span>
                        No se avisa del inicio de labores, aunque la fecha sea
                        futura.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {bloqueoListaNegra && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="mt-0.5 flex-none text-amber-600">
                    <AlertTriangle size={18} />
                  </span>
                  <p className="text-sm text-amber-800">
                    {bloqueoListaNegra.motivo
                      ? "El talento se encuentra en la lista negra de este cliente por el motivo: " +
                        bloqueoListaNegra.motivo +
                        "."
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
                  onClick={registrar}
                  disabled={ocupado}
                  className="btn btn-primary mx-0 flex h-11 items-center gap-2 px-6 text-sm font-semibold"
                >
                  <Check size={18} />
                  Registrar colaborador
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
                  abrirCrearTalento();
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
