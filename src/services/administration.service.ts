import { AxiosResponse } from "axios";
import { apiClientWithToken, axiosInstanceBDT } from "../utils/apiClient";
import { Utils } from "../utils/utils";
import { BaseResponse, BaseResponseBDT } from "../models/response/BaseResponse";
import { ClientListResponse } from "../models/response/ClientListResponse";
import { InsertUpdateResponse } from "../models/response/InsertUpdateResponse";
import {
  ParamItemListResponse,
  ParamMasterListResponse,
} from "../models/response/ParamAdminResponse";
import { ClientAdminListResponse } from "../models/response/ClientAdminResponse";
import { ClientGestorListResponse } from "../models/response/ClientGestorResponse";
import { TariffListResponse } from "../models/response/TariffResponse";
import {
  UserAdminListResponse,
  UserSignatureUrlResponse,
} from "../models/response/UserAdminResponse";
import {
  ParamItemListParams,
  ParamMasterListParams,
  ParamUpsertParams,
} from "../models/type/ParamAdmin";
import { ClientAdminListParams, ClientUpsertParams } from "../models/type/ClientAdmin";
import { AssignGestorParams, ChangeGestorParams } from "../models/type/ClientGestor";
import { TariffListParams, TariffUpsertParams } from "../models/type/Tariff";
import {
  UserAdminListParams,
  UserCreateParams,
  UserSignatureUrlParams,
  UserUpsertParams,
} from "../models/type/UserAdmin";
import {
  EmployeesListResponse,
  EmployeeUndoDetailResponse,
} from "../models/type/EmployeeUndo";

// ─── Administración (SUPERADMIN) ──────────────────────────────────────────────
// Parámetros, clientes, usuarios, gestores y tarifario viven en BDT
// (Backend_BancoTalentos_v2.0), por eso usan axiosInstanceBDT y responden con
// `idMensaje`. "Deshacer movimientos" es de FMI y usa apiClientWithToken.

const withQuery = (path: string, params: Record<string, any>): string => {
  const queryString = Utils.buildQueryString(params);
  return `${path}${queryString ? `?${queryString}` : ""}`;
};

// Clientes activos (combo de Gestores y Tarifario).

export const getClients = (): Promise<AxiosResponse<ClientListResponse>> => {
  return apiClientWithToken.get("/fmi/client/list");
};

// Deshacer movimientos (FMI)

/** Listado paginado / por búsqueda de empleados (SP_TALENTO_EMPLEADO_SEL). */
export const listEmployeesFMI = (
  page: number,
  search?: string
): Promise<AxiosResponse<EmployeesListResponse>> => {
  const query = search
    ? `busqueda=${encodeURIComponent(search)}`
    : `nPag=${page}`;
  return apiClientWithToken.get(`/fmi/employee/list?${query}`);
};

/** Historial completo del empleado (movimientos, equipos, ceses). */
export const getEmployeeDetailFMI = (
  talentId: number
): Promise<AxiosResponse<EmployeeUndoDetailResponse>> => {
  return apiClientWithToken.get(`/fmi/employee/detail?talentId=${talentId}`);
};

/** Deshacer el último ingreso (da de baja el contrato y reabre el cupo del RQ). */
export const undoIngresoFMI = (
  idHistorial: number,
  idTalento: number
): Promise<AxiosResponse<BaseResponse>> => {
  return apiClientWithToken.put(
    `/fmi/employee/ingreso/undo?idHistorial=${idHistorial}&idTalento=${idTalento}`
  );
};

/** Deshacer el último movimiento del historial. */
export const undoMovimientoFMI = (
  idHistorial: number,
  idTalento: number
): Promise<AxiosResponse<BaseResponse>> => {
  return apiClientWithToken.put(
    `/fmi/employee/movimiento/undo?idHistorial=${idHistorial}&idTalento=${idTalento}`
  );
};

/** Deshacer el último cese (reactiva el contrato del talento). */
export const undoCeseFMI = (
  idHistorial: number,
  idTalento: number
): Promise<AxiosResponse<BaseResponse>> => {
  return apiClientWithToken.put(
    `/fmi/employee/cese/undo?idHistorial=${idHistorial}&idTalento=${idTalento}`
  );
};

/** Deshacer (baja lógica) la última solicitud de equipo. */
export const deleteEquipmentRequestFMI = (
  idSolicitud: number,
  idTalento: number
): Promise<AxiosResponse<BaseResponse>> => {
  return apiClientWithToken.delete(
    `/fmi/employee/solicitud/equipo?idSolicitud=${idSolicitud}&idTalento=${idTalento}`
  );
};

// Manejo de parámetros

/** Modo 1: lista de maestros paginada por maestro. */
export const getParamMasters = (
  params: ParamMasterListParams
): Promise<AxiosResponse<ParamMasterListResponse>> => {
  return axiosInstanceBDT.get(withQuery("/bdt/param-admin/masters", params));
};

/** Modo 2: parámetros de un maestro, paginados. `pagina` omitido = todo. */
export const getParamsByMaster = (
  params: ParamItemListParams
): Promise<AxiosResponse<ParamItemListResponse>> => {
  return axiosInstanceBDT.get(withQuery("/bdt/param-admin/list", params));
};

export const createParam = (
  data: ParamUpsertParams
): Promise<AxiosResponse<InsertUpdateResponse>> => {
  return axiosInstanceBDT.post("/bdt/param-admin/create", data);
};

export const updateParam = (
  data: ParamUpsertParams
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.put("/bdt/param-admin/update", data);
};

export const deleteParam = (
  idParametro: number
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.delete(`/bdt/param-admin/delete?idParametro=${idParametro}`);
};

// Manejo de clientes

export const getClientsAdmin = (
  params: ClientAdminListParams
): Promise<AxiosResponse<ClientAdminListResponse>> => {
  return axiosInstanceBDT.get(withQuery("/bdt/client-admin/list", params));
};

export const createClient = (
  data: ClientUpsertParams
): Promise<AxiosResponse<InsertUpdateResponse>> => {
  return axiosInstanceBDT.post("/bdt/client-admin/create", data);
};

export const updateClient = (
  data: ClientUpsertParams
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.put("/bdt/client-admin/update", data);
};

export const deleteClient = (
  idCliente: number
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.delete(`/bdt/client-admin/delete?idCliente=${idCliente}`);
};

export const reactivateClient = (
  idCliente: number
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.put(`/bdt/client-admin/reactivate?idCliente=${idCliente}`);
};

// Manejo de usuarios

export const getUsersAdmin = (
  params: UserAdminListParams
): Promise<AxiosResponse<UserAdminListResponse>> => {
  return axiosInstanceBDT.get(withQuery("/bdt/user-admin/list", params));
};

export const createUserAdmin = (
  data: UserCreateParams
): Promise<AxiosResponse<InsertUpdateResponse>> => {
  return axiosInstanceBDT.post("/bdt/user-admin/create", data);
};

export const updateUserAdmin = (
  data: UserUpsertParams
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.put("/bdt/user-admin/update", data);
};

export const deleteUserAdmin = (
  idUsuario: number
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.delete(`/bdt/user-admin/delete?idUsuario=${idUsuario}`);
};

export const reactivateUserAdmin = (
  idUsuario: number
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.put(`/bdt/user-admin/reactivate?idUsuario=${idUsuario}`);
};

/** Pide la URL PUT pre-firmada para subir la firma del usuario a S3. */
export const generateUserSignatureUploadUrl = (
  data: UserSignatureUrlParams
): Promise<AxiosResponse<UserSignatureUrlResponse>> => {
  return axiosInstanceBDT.post("/bdt/user-admin/signature/upload-url", data);
};

// Manejo de gestores por cliente

export const getClientGestores = (
  idCliente: number
): Promise<AxiosResponse<ClientGestorListResponse>> => {
  return axiosInstanceBDT.get(`/bdt/client-admin/gestores?idCliente=${idCliente}`);
};

export const assignClientGestor = (
  data: AssignGestorParams
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.post("/bdt/client-admin/gestor", data);
};

export const changeClientGestor = (
  data: ChangeGestorParams
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.put("/bdt/client-admin/gestor", data);
};

export const removeClientGestor = (
  idClienteGestor: number
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.delete(
    `/bdt/client-admin/gestor?idClienteGestor=${idClienteGestor}`
  );
};

export const swapClientGestores = (
  idCliente: number
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.put(`/bdt/client-admin/gestores/swap?idCliente=${idCliente}`);
};

// Manejo de tarifario

export const getTariffs = (
  params: TariffListParams
): Promise<AxiosResponse<TariffListResponse>> => {
  return axiosInstanceBDT.get(withQuery("/bdt/tariff-admin/list", params));
};

export const createTariff = (
  data: TariffUpsertParams
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.post("/bdt/tariff-admin/create", data);
};

export const updateTariff = (
  data: TariffUpsertParams
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.put("/bdt/tariff-admin/update", data);
};

export const deleteTariff = (
  idTarifario: number
): Promise<AxiosResponse<BaseResponseBDT>> => {
  return axiosInstanceBDT.delete(`/bdt/tariff-admin/delete?idTarifario=${idTarifario}`);
};
