import { BaseResponseBDT } from "./BaseResponse";
import { ParamItem, ParamMaster } from "../type/ParamAdmin";

export interface ParamMasterListResponse {
  result: BaseResponseBDT;
  registros: ParamMaster[];
  /** Número de maestros (la paginación es por maestro, no por parámetro). */
  total: number;
}

export interface ParamItemListResponse {
  result: BaseResponseBDT;
  registros: ParamItem[];
  total: number;
}
