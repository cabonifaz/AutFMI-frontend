import { BaseResponseBDT } from "./BaseResponse";
import { ClientAdmin } from "../type/ClientAdmin";

export interface ClientAdminListResponse {
  result: BaseResponseBDT;
  registros: ClientAdmin[];
  total: number;
}
