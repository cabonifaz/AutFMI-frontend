import { AxiosResponse } from "axios";
import { apiClientWithToken } from "../utils/apiClient";

/** Opción de un filtro de Requerimientos que se busca en el servidor. */
export interface FilterOption {
  id: number;
  nombre: string;
  /** Cargo del contacto o documento del talento; vacío en perfiles. */
  detalle: string;
  /** RQ vigentes relacionados con la opción. */
  cantidad: number;
}

export interface FilterOptions {
  opciones: FilterOption[];
  /** Opciones que coinciden, antes del límite. */
  total: number;
}

export interface FilterOptionsResult {
  baseResponse: { idTipoMensaje: number; mensaje: string };
  data: FilterOptions | null;
}

export type FilterOptionsResponse = Promise<AxiosResponse<FilterOptionsResult>>;

/** Filtro Contacto: contactos de un cliente. */
export const getContactFilterOptions = (idCliente: number): FilterOptionsResponse =>
  apiClientWithToken.get("/fmi/requirement/filters/contacts", { params: { idCliente } });

/** Filtro Perfil: perfiles usados en RQ vigentes; sin búsqueda, los más usados. */
export const getProfileFilterOptions = (buscar: string, top = 8): FilterOptionsResponse =>
  apiClientWithToken.get("/fmi/requirement/filters/profiles", {
    params: { buscar: buscar || undefined, top },
  });

/** Filtro Postulante: talentos asignados a algún RQ; exige búsqueda. */
export const getTalentFilterOptions = (buscar: string, top = 8): FilterOptionsResponse =>
  apiClientWithToken.get("/fmi/requirement/filters/talents", {
    params: { buscar: buscar || undefined, top },
  });
