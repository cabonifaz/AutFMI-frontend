import { AxiosResponse } from "axios";
import { apiClientWithToken, axiosInstanceBDT } from "../utils/apiClient";
import { FMIExtractionResponse } from "../models/type/FMIExtraction";
import { TalentMatchListResponse } from "../models/type/TalentMatch";
import { IACVResponse } from "../models/response/IACVResponse";
import {
  AddTalentParams,
  AddTalentResponse,
} from "../models/params/AddTalentParams";
import { BaseResponse } from "../models/response/BaseResponse";

// ─── Carga de un colaborador desde su FMI ────────────────────────────────────
// El flujo cruza los dos backends: la lectura del PDF y el alta del talento
// viven en BDT (axiosInstanceBDT), la búsqueda de candidatos y el alta en el
// requerimiento en FMI (apiClientWithToken). El token es el mismo en ambos.

/** Análisis de un CV o un FMI puede tardar; el backend espera hasta 180 s. */
const TIMEOUT_ANALISIS = 180000;

/** Lee el Formulario de Ingreso. No persiste nada. */
export const analizarFmi = (
  archivo: File
): Promise<AxiosResponse<FMIExtractionResponse>> => {
  const formData = new FormData();
  formData.append("file", archivo);

  // El Content-Type lo pone axios con su boundary: fijarlo a mano rompe el
  // multipart.
  return axiosInstanceBDT.post("/bdt/ia/analyze-fmi", formData, {
    timeout: TIMEOUT_ANALISIS,
  });
};

/**
 * Candidatos a que la persona ya exista. Por nombre en la primera pasada; por
 * documento o correo en la segunda, cuando el CV ya los aportó.
 */
export const buscarCandidatos = (params: {
  busqueda?: string;
  dni?: string;
  email?: string;
}): Promise<AxiosResponse<TalentMatchListResponse>> => {
  return apiClientWithToken.get("/fmi/talent/search-identity", {
    params: {
      busqueda: params.busqueda || undefined,
      dni: params.dni || undefined,
      email: params.email || undefined,
    },
  });
};

/** Análisis completo del CV, el mismo que usa la carga rápida de BDT. */
export const analizarCv = (
  archivo: File
): Promise<AxiosResponse<IACVResponse>> => {
  const formData = new FormData();
  formData.append("file", archivo);

  return axiosInstanceBDT.post("/bdt/ia/analyze-cv", formData, {
    timeout: TIMEOUT_ANALISIS,
  });
};

/** Alta del talento en el banco. Exige la funcionalidad 12 en BDT. */
export const crearTalento = (
  params: AddTalentParams
): Promise<AxiosResponse<AddTalentResponse>> => {
  return axiosInstanceBDT.post("/bdt/talent/addOrUpdateTalent", params);
};

/** Datos del talento en el contexto de un RQ: estado, situación y tooltip. */
export const obtenerTalentoDeRq = (
  idTalento: number,
  idRequerimiento: number
): Promise<AxiosResponse<any>> => {
  return apiClientWithToken.get(
    `/fmi/requirement/talents/data?idTalento=${idTalento}&idRequerimiento=${idRequerimiento}`
  );
};

export type TalentoDeRqPayload = {
  idTalento: number;
  nombres: string;
  apellidos: string;
  dni: string;
  celular: string;
  email: string;
  idSituacion: number;
  idEstado: number;
  idPerfil: number;
  confirmado: boolean;
  ingreso: number;
  idCliente?: number;
  cliente?: string;
  idEstadoRegistro: number;
};

/**
 * Agrega a la persona al requerimiento, sin confirmar.
 *
 * Se manda una sola fila: el MERGE de SP_REQUERIMIENTO_TALENTO_INS no tiene
 * `WHEN NOT MATCHED BY SOURCE`, así que los talentos que ya estaban en el RQ no
 * se tocan. Con `finalizar` y `flagCorreo` en false el SP solo registra la
 * marca: no genera contrato, ni solicitud de equipo, ni correos.
 */
export const agregarAlRequerimiento = (
  idRequerimiento: number,
  talento: TalentoDeRqPayload
): Promise<AxiosResponse<BaseResponse>> => {
  return apiClientWithToken.post("/fmi/requirement/talents/save", {
    idRequerimiento,
    flagCorreo: false,
    finalizar: false,
    lstTalentos: [talento],
  });
};
