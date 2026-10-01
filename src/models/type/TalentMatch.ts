import { BaseResponse } from "../response/BaseResponse";

/**
 * Un posible "esta persona ya existe" al cargar un FMI.
 *
 * Trae documento, correo y situación porque el formulario solo da el nombre y
 * con el nombre no se distinguen dos homónimos: decide el operador.
 */
export type TalentMatch = {
  idTalento: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  dni: string | null;
  email: string | null;
  celular: string | null;
  /** LIBRE u OCUPADO (maestro 26). */
  situacion: string | null;
  /** dd/MM/yyyy */
  fchAlta: string | null;
  /** En cuántos requerimientos vigentes está. */
  rqs: number | null;
  /** 100 mismo documento, 95 mismo correo, o el % de palabras del nombre. */
  score: number | null;
};

export type TalentMatchListResponse = BaseResponse & {
  talentos: TalentMatch[] | null;
};

/** Con este puntaje la coincidencia es por documento o por correo: es certeza. */
export const SCORE_CLAVE_FUERTE = 95;

/** Nombre completo para mostrar en la tabla de candidatos. */
export const nombreDeTalento = (talento: TalentMatch): string =>
  `${talento.nombres ?? ""} ${talento.apellidoPaterno ?? ""} ${
    talento.apellidoMaterno ?? ""
  }`
    .replace(/\s+/g, " ")
    .trim();
