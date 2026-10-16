import { ClientGestor } from "../type/ClientGestor";
import { BaseResponseBDT } from "./BaseResponse";

export interface ClientGestorListResponse {
  result: BaseResponseBDT;
  registros: ClientGestor[];
}
