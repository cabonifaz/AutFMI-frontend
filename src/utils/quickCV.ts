/**
 * Lo que la carga rápida guarda por detrás.
 *
 * El modal solo enseña identidad y contacto, pero el CV se analiza completo:
 * aquí se traduce la respuesta de la IA al payload del alta.
 *
 * Es una copia adaptada de `core/utilities/quickCV.ts` del frontend de BDT: los
 * dos proyectos no comparten paquete. Si allá cambia el mapeo, aquí también.
 */
import { AddTalentParams } from "../models/params/AddTalentParams";
import { IACVResponse } from "../models/response/IACVResponse";
import { ParamType } from "../models/type/ParamType";

export type DatosCV = IACVResponse["data"];

/** Maestros necesarios para traducir nombres a ids. */
export type MaestrosCV = {
  /** Maestro 12 */
  paises: ParamType[];
  /** Maestro 13 (num2 = país al que pertenece) */
  ciudades: ParamType[];
  /** Maestro 19 */
  habilidadesTecnicas: ParamType[];
  /** Maestro 20 */
  habilidadesBlandas: ParamType[];
};

/** Educaciones con fecha completa: el alta manda siempre yyyy-MM-dd. */
const TIPO_FECHA_ANIOS = 1;

export const normalizar = (texto?: string | null): string =>
  (texto ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** id del maestro cuyo `string1` coincide con el nombre, o 0 si no hay. */
const idPorNombre = (nombre: string | null | undefined, lista: ParamType[]) => {
  const buscado = normalizar(nombre);
  if (!buscado) return 0;
  return lista?.find((item) => normalizar(item.string1) === buscado)?.num1 || 0;
};

const texto = (valor?: string | null) => {
  const limpio = (valor ?? "").trim();
  return limpio === "" ? undefined : limpio;
};

/**
 * La IA devuelve las fechas en yyyy-MM-dd, que es justo lo que espera el TVP.
 * Cuando no trae fecha de inicio no hay nada que guardar: la fila se descarta
 * en vez de arriesgar el alta entera con una fecha vacía.
 */
const fecha = (valor?: string | null) => {
  const limpio = (valor ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(limpio) ? limpio : null;
};

/**
 * Traduce el análisis completo del CV a los campos del alta que el modal no
 * muestra. Identidad y contacto los pone el modal con lo que el usuario revisó.
 */
export const datosDelCV = (
  datos: DatosCV,
  maestros: MaestrosCV
): Partial<AddTalentParams> => {
  const idPais = idPorNombre(datos.location?.pais, maestros.paises);
  // La ciudad solo vale si es del país detectado: el maestro 13 repite nombres
  // entre países.
  const idCiudadDetectada = idPorNombre(
    datos.location?.ciudad,
    maestros.ciudades
  );
  const ciudad = maestros.ciudades?.find(
    (item) => item.num1 === idCiudadDetectada
  );
  const idCiudad =
    idPais && idCiudadDetectada && ciudad?.num2 === idPais
      ? idCiudadDetectada
      : 0;

  // Habilidad sin id: el SP crea el parámetro con el nombre (ID_HABILIDAD = 0
  // y HABILIDAD <> '').
  const habilidadesTecnicas = (datos.tecSkills ?? [])
    .filter((skill) => !!texto(skill.nombreHabilidad))
    .map((skill) => ({
      idHabilidad: idPorNombre(
        skill.nombreHabilidad,
        maestros.habilidadesTecnicas
      ),
      habilidad: (skill.nombreHabilidad as string).trim().toUpperCase(),
      anios: skill.aniosExperiencia || 0,
    }));

  const habilidadesBlandas = (datos.softSkills ?? [])
    .filter((skill) => !!texto(skill.nombreHabilidad))
    .map((skill) => ({
      idHabilidad: idPorNombre(
        skill.nombreHabilidad,
        maestros.habilidadesBlandas
      ),
      habilidad: (skill.nombreHabilidad as string).trim().toUpperCase(),
    }));

  const experiencias = (datos.workExps ?? [])
    .filter((exp) => !!texto(exp.nombreEmpresa) && !!fecha(exp.fechaInicio))
    .map((exp) => ({
      empresa: (exp.nombreEmpresa as string).trim(),
      puesto: texto(exp.puesto) ?? "",
      funciones: texto(exp.funciones) ?? "",
      fechaInicio: fecha(exp.fechaInicio) as string,
      fechaFin: exp.flActualidad === 1 ? null : fecha(exp.fechaFin),
      flActualidad: exp.flActualidad === 1 ? 1 : 0,
    }));

  const educaciones = (datos.edExps ?? [])
    .filter((edu) => !!texto(edu.nombreInstitucion) && !!fecha(edu.fechaInicio))
    .map((edu) => ({
      institucion: (edu.nombreInstitucion as string).trim(),
      carrera: texto(edu.carrera) ?? "",
      grado: texto(edu.grado) ?? "",
      fechaInicio: fecha(edu.fechaInicio) as string,
      fechaFin: edu.flActualidad === 1 ? null : fecha(edu.fechaFin),
      flActualidad: edu.flActualidad === 1 ? 1 : 0,
      tipoFechaEducaciones: TIPO_FECHA_ANIOS,
    }));

  // El idioma se guarda solo por id: si la IA no lo reconoció no hay forma de
  // registrarlo y se deja para el detalle del talento.
  const idiomas = (datos.langs ?? [])
    .filter((lang) => !!lang.idIdioma && !!lang.idNivel)
    .map((lang) => ({
      idIdioma: lang.idIdioma as number,
      idNivel: lang.idNivel,
      estrellas: lang.estrellas || 0,
    }));

  return {
    dni: texto(datos.docIdentidad) ?? null,
    descripcion: texto(datos.presentacion),
    linkedin: texto(datos.social?.linkedin),
    github: texto(datos.social?.github),
    idPais: idPais || undefined,
    idCiudad: idCiudad || undefined,
    habilidadesTecnicas,
    habilidadesBlandas,
    experiencias,
    educaciones,
    idiomas,
  };
};

/** Resumen de lo que se guardará sin que el usuario lo vea. */
export const resumenDelCV = (extra: Partial<AddTalentParams>): string[] =>
  [
    extra.experiencias?.length
      ? `${extra.experiencias.length} experiencia${
          extra.experiencias.length === 1 ? "" : "s"
        }`
      : null,
    extra.educaciones?.length
      ? `${extra.educaciones.length} estudio${
          extra.educaciones.length === 1 ? "" : "s"
        }`
      : null,
    extra.habilidadesTecnicas?.length
      ? `${extra.habilidadesTecnicas.length} habilidad${
          extra.habilidadesTecnicas.length === 1 ? "" : "es"
        }`
      : null,
    extra.idiomas?.length
      ? `${extra.idiomas.length} idioma${extra.idiomas.length === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean) as string[];

/**
 * ¿El nombre del CV se parece al del formulario? Se comparan palabras
 * normalizadas: si no comparten ninguna, probablemente es el CV equivocado.
 */
export const nombresSeParecen = (unNombre: string, otro: string): boolean => {
  const palabras = (valor: string) =>
    normalizar(valor)
      .split(/\s+/)
      .filter((palabra) => palabra.length > 1);

  const unas = palabras(unNombre);
  const otras = palabras(otro);
  if (unas.length === 0 || otras.length === 0) return true;

  return unas.some((palabra) => otras.includes(palabra));
};
