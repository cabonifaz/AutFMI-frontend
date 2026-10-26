import { AxiosResponse } from "axios";
import { apiClientWithToken } from "../utils/apiClient";
import {
  ApprovalDetail,
  ApprovalFilters,
  ApprovalInbox,
  ApprovalResult,
} from "../models/type/ApprovalRequest";

// Bandeja de aprobaciones (FTBO-1118). Solo se envían filtros: el usuario, la
// empresa y los roles los toma el backend del token.

export const getApprovalInbox = (
  filters: ApprovalFilters,
  nPag: number
): Promise<AxiosResponse<ApprovalResult<ApprovalInbox>>> => {
  const params: Record<string, string | number> = { nPag };
  if (filters.idCliente !== null) params.idCliente = filters.idCliente;
  if (filters.tipoSolicitud !== null) params.tipoSolicitud = filters.tipoSolicitud;
  if (filters.estado !== null) params.estado = filters.estado;
  if (filters.busqueda) params.busqueda = filters.busqueda;
  return apiClientWithToken.get("/fmi/approval/list", { params });
};

export const getApprovalDetail = (
  idSolicitud: number
): Promise<AxiosResponse<ApprovalResult<ApprovalDetail>>> =>
  apiClientWithToken.get(`/fmi/approval/detail/${idSolicitud}`);
