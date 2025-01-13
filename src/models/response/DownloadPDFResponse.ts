import { PDFDataType } from "../type/PDFDataType";
import { BaseResponse } from "./BaseResponse";

export type DownloadPDFResponse = {
    result: BaseResponse;
    lstArchivos: PDFDataType[];
}