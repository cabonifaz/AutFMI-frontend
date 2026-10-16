import { Tariff } from "../type/Tariff";
import { BaseResponseBDT } from "./BaseResponse";

export interface TariffListResponse {
  result: BaseResponseBDT;
  registros: Tariff[];
  total: number;
}
