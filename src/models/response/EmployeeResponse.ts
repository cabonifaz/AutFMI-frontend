import { EmployeeType } from "../type/EmployeeType";

export type EmployeeResponse = {
    idTipoMensaje: number;
    mensaje: string;
    employee: EmployeeType;
}