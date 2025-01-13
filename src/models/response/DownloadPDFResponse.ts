import { BaseResponse } from "./BaseResponse";

export type DownloadPDFResponse = {
    result: BaseResponse;
    nombreArchivo: string;
    archivoB64: string;
}