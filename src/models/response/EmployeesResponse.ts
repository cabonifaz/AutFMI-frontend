import { EmployeeType, TalentoType } from "../type/TalentoType";

export type EmployeesResponse = {
  idTipoMensaje: number;
  mensaje: string;
  talentos: EmployeeType[];
  totalElementos: number;
  totalPaginas: number;
};
