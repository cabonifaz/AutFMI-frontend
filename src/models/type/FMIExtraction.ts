/**
 * Lo que devuelve /bdt/ia/analyze-fmi al leer un Formulario de Ingreso.
 *
 * El FMI no identifica a nadie: trae el nombre y los datos del puesto, pero ni
 * documento, ni correo, ni celular. Nada de esto se guarda; sirve para buscar a
 * la persona y para que el operador confirme que es el RQ correcto.
 */
export type FMIExtraction = {
  /** Falso si el PDF no es un FT-GTH-12 o es de movimiento/cese. */
  esFormularioIngreso: boolean;
  motivoDescarte: string | null;

  /** ALTA, MEDIA o BAJA. */
  confianza: string | null;
  /** PARSER (etiquetas), IA (respaldo) o MIXTO. */
  origen: string | null;

  nombreCompleto: string | null;
  /** Partición sugerida del nombre: siempre editable, nunca se da por buena. */
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;

  /** "Cliente" en outsourcing, "Equipo" en el resto. */
  etiquetaEquipo: string | null;
  equipoOCliente: string | null;
  esOutsourcing: boolean;

  modalidad: string | null;
  motivoIngreso: string | null;
  cargo: string | null;
  horario: string | null;

  montoBase: number | null;
  montoMovilidad: number | null;

  /** yyyy-MM-dd */
  fechaInicioContrato: string | null;
  fechaFinContrato: string | null;

  proyectoServicio: string | null;
  objetoContrato: string | null;
  declaraSunat: string | null;
  sedeDeclarar: string | null;

  gestor: string | null;
  fechaEmision: string | null;

  camposFaltantes: string[];
};

/** Envoltorio GeneralResponse del backend de BDT. */
export type FMIExtractionResponse = {
  idMensaje: number;
  mensaje: string;
  data: FMIExtraction | null;
};
