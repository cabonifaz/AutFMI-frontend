import { ParamType } from "../type/ParamType";
import { BaseResponse } from "./BaseResponse";

export type ParamResponse = {
    result: BaseResponse;
    listParametros: ParamType[];
}