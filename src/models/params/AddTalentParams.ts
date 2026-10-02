/**
 * Alta de un talento en BDT (`POST /bdt/talent/addOrUpdateTalent`).
 *
 * Es el subconjunto que manda la carga rápida con CV: identidad, contacto y lo
 * que la IA saca del CV. El contrato completo vive en el frontend de BDT
 * (`core/models/params/AddTalentParams.ts`); aquí solo está lo que este flujo
 * envía, porque los dos proyectos no comparten paquete.
 */
export type AddTalentParams = {
  dni: string | null;
  telefono?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
  email?: string;
  linkedin?: string;
  github?: string;
  descripcion?: string;
  idPais?: number;
  idCiudad?: number;
  /** El SP lo escribe siempre; esta carga lo manda en false. */
  tieneEquipo?: boolean;
  idMoneda?: number | null;
  habilidadesTecnicas?: {
    idHabilidad: number;
    /** Con `idHabilidad` en 0, el SP da de alta la habilidad con este nombre. */
    habilidad?: string;
    anios?: number | null;
  }[];
  habilidadesBlandas?: {
    idHabilidad: number;
    habilidad?: string;
  }[];
  experiencias?: {
    empresa: string;
    puesto: string;
    funciones?: string;
    fechaInicio: string;
    fechaFin?: string | null;
    flActualidad: number;
  }[];
  educaciones?: {
    institucion: string;
    carrera: string;
    grado: string;
    fechaInicio: string;
    fechaFin?: string | null;
    flActualidad: number;
    tipoFechaEducaciones?: number;
  }[];
  idiomas?: {
    idIdioma: number;
    idNivel: number;
    estrellas: number;
  }[];
  cvArchivo?: {
    stringB64: string;
    nombreArchivo: string;
    extensionArchivo: string;
    idTipoArchivo: number;
    idTipoDocumento: number;
  };
};

/** Respuesta del alta: `idNuevo` es el talento recién creado. */
export type AddTalentResponse = {
  idMensaje: number;
  mensaje: string;
  idNuevo: number;
};
