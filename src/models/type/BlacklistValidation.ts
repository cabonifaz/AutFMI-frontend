import { BaseResponseBDT } from "../response/BaseResponse";

// Validación contra la Lista Negra (BDT) al asignar un talento a un
// requerimiento. El módulo Lista Negra vive en BDT; aquí solo se consume.

/**
 * Si `bloqueado` es false, el resto de campos viene nulo.
 * `idCliente = 0` significa que la restricción es global (todos los clientes).
 */
export interface BlacklistValidation {
  idListaNegra: number | null;
  idTalento: number;
  idCliente: number | null;
  cliente: string | null;
  motivo: string | null;
  bloqueado: boolean;
}

export interface BlacklistValidateResponse {
  result: BaseResponseBDT;
  validacion: BlacklistValidation;
}
