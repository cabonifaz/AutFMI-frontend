import { BaseResponseBDT } from "./BaseResponse";
import { UserAdmin } from "../type/UserAdmin";

export interface UserAdminListResponse {
  result: BaseResponseBDT;
  registros: UserAdmin[];
  total: number;
}

export interface UserSignatureUrlResponse {
  result: BaseResponseBDT;
  url: string | null;
  path: string | null;
  /** Content-type firmado; debe ir tal cual en la cabecera del PUT. */
  contentType?: string | null;
}
