import { AxiosResponse } from "axios";
import { axiosInstanceBDT } from "../utils/apiClient";
import { BlacklistValidateResponse } from "../models/type/BlacklistValidation";

// ─── Lista Negra ──────────────────────────────────────────────────────────────
// El módulo vive en BDT (Backend_BancoTalentos_v2.0), por eso usa
// axiosInstanceBDT y no apiClientWithToken.

/** Valida si el talento está restringido para el cliente del requerimiento. */
export const validateBlacklist = (params: {
  idTalento: number;
  idRequerimiento: number;
}): Promise<AxiosResponse<BlacklistValidateResponse>> => {
  return axiosInstanceBDT.get(
    `/bdt/blacklist/validate?idTalento=${params.idTalento}&idRequerimiento=${params.idRequerimiento}`
  );
};
