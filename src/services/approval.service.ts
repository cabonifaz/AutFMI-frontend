import { AxiosResponse } from "axios";
import { apiClientWithToken } from "../utils/apiClient";
import {
  ApprovalDecision,
  ApprovalDetail,
  ApprovalFilters,
  ApprovalFlow,
  ApprovalInbox,
  ApprovalResult,
} from "../models/type/ApprovalRequest";


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



export const getApprovalFlow = (
  idSolicitud: number
): Promise<AxiosResponse<ApprovalResult<ApprovalFlow>>> =>
  apiClientWithToken.get(`/fmi/approval/${idSolicitud}/flow`);

export const updateApprovalForm = (
  idSolicitud: number,
  version: number,
  cambios: Record<string, string | number | null>
): Promise<AxiosResponse<ApprovalResult<ApprovalDecision>>> =>
  apiClientWithToken.put(`/fmi/approval/${idSolicitud}/form`, { version, cambios });

export const approveApprovalRequest = (
  idSolicitud: number,
  version: number
): Promise<AxiosResponse<ApprovalResult<ApprovalDecision>>> =>
  apiClientWithToken.post(`/fmi/approval/${idSolicitud}/approve`, { version });
