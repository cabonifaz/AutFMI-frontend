import { AxiosResponse } from "axios";
import { apiClientWithToken } from "../utils/apiClient";
import { BaseResponse } from "../models/response/BaseResponse";
import { RqPresignedUrlResponse } from "../models/type/RqFilePresigned";
import {
  PostulantConfirmUploadRequest,
  PostulantDownloadUrlRequest,
  PostulantFileListResponse,
  PostulantUploadUrlRequest,
} from "../models/type/PostulantFilePresigned";

// ─── Archivos de postulante (REQUERIMIENTO_TALENTO) vía URL pre-firmada (S3 directo) ───
// Interfaces en models/type/PostulantFilePresigned.ts
// La subida directa a S3 reutiliza uploadFileToS3 de rqFile.service.ts.

/** Pide una URL PUT pre-firmada para subir un archivo del postulante. */
export const generatePostulantUploadUrl = (
  data: PostulantUploadUrlRequest
): Promise<AxiosResponse<RqPresignedUrlResponse>> => {
  return apiClientWithToken.post(
    "/fmi/requirement/postulant/file/upload-url",
    data
  );
};

/** Confirma en BD un archivo de postulante ya subido a S3. */
export const confirmPostulantUpload = (
  data: PostulantConfirmUploadRequest
): Promise<AxiosResponse<BaseResponse>> => {
  return apiClientWithToken.post(
    "/fmi/requirement/postulant/file/confirm-upload",
    data
  );
};

/** Lista los archivos de un postulante. */
export const listPostulantFiles = (
  idRequerimientoTalento: number
): Promise<AxiosResponse<PostulantFileListResponse>> => {
  return apiClientWithToken.get(
    `/fmi/requirement/postulant/file/list?idRequerimientoTalento=${idRequerimientoTalento}`
  );
};

/** URL GET pre-firmada (descarga forzada) para un archivo del postulante. */
export const generatePostulantDownloadUrl = (
  data: PostulantDownloadUrlRequest
): Promise<AxiosResponse<RqPresignedUrlResponse>> => {
  return apiClientWithToken.post(
    "/fmi/requirement/postulant/file/download-url",
    data
  );
};

/** Elimina un archivo del postulante (BD + S3). */
export const removePostulantFile = (
  idArchivo: number
): Promise<AxiosResponse<BaseResponse>> => {
  return apiClientWithToken.delete(
    `/fmi/requirement/postulant/file/remove?idArchivo=${idArchivo}`
  );
};
