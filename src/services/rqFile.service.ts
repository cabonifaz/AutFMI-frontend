import { AxiosResponse } from "axios";
import { apiClientWithToken } from "../utils/apiClient";
import { BaseResponse } from "../models/response/BaseResponse";
import {
  RqConfirmUploadRequest,
  RqPresignedUrlResponse,
  RqUploadUrlRequest,
} from "../models/type/RqFilePresigned";

// ─── Archivos de requerimiento vía URL pre-firmada (S3 directo) ───────────────
// Interfaces en models/type/RqFilePresigned.ts

/** Detalle/actualizar RQ: pide una URL PUT pre-firmada para un archivo. */
export const generateRqUploadUrl = (
  data: RqUploadUrlRequest
): Promise<AxiosResponse<RqPresignedUrlResponse>> => {
  return apiClientWithToken.post("/fmi/requirement/file/upload-url", data);
};

/** Sube el archivo directamente a S3 con la URL pre-firmada (no pasa por el backend). */
export const uploadFileToS3 = (url: string, file: File): Promise<Response> => {
  return fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
};

/** Confirma en BD un archivo de RQ ya subido a S3. */
export const confirmRqUpload = (
  data: RqConfirmUploadRequest
): Promise<AxiosResponse<BaseResponse>> => {
  return apiClientWithToken.post("/fmi/requirement/file/confirm-upload", data);
};

/** URL GET pre-firmada para descargar un archivo de RQ. */
export const generateRqDownloadUrl = (
  data: { idArchivo: number }
): Promise<AxiosResponse<RqPresignedUrlResponse>> => {
  return apiClientWithToken.post("/fmi/requirement/file/download-url", data);
};
