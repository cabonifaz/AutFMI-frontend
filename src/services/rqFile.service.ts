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

/**
 * Sube el archivo directamente a S3 con la URL pre-firmada (no pasa por el backend).
 *
 * `contentType`, si el backend lo devuelve al firmar, debe ir tal cual: la firma
 * incluye la cabecera Content-Type y `file.type` llega vacío cuando el navegador
 * no reconoce la extensión, lo que hace fallar el PUT con SignatureDoesNotMatch.
 */
export const uploadFileToS3 = (
  url: string,
  file: File,
  contentType?: string
): Promise<Response> => {
  return fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType || file.type },
    body: file,
  });
};

/** Traduce una respuesta no 2xx de S3 (XML con `<Code>`) a un mensaje legible. */
export const describeS3Error = async (response: Response): Promise<string> => {
  let code = "";
  try {
    const body = await response.text();
    code = body.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? "";
  } catch {
    // Cuerpo ilegible (respuesta opaca): nos quedamos con el status.
  }
  return code
    ? `Error subiendo el archivo a S3 (${response.status} ${code})`
    : `Error subiendo el archivo a S3 (código ${response.status})`;
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
