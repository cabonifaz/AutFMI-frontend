import { ReqArchivo } from "../type/ReqArchivo";
import { ReqTalento } from "../type/ReqTalento";
import { ReqVacante } from "../type/ReqVacante";

export type RequirementResponse = {
    idTipoMensaje: number;
    mensaje: string;
    requerimiento: {
        idCliente: number;
        cliente: string;
        codigoRQ: string;
        fechaSolicitud: string;
        descripcion: string;
        idEstado: number;
        vacantes: number;
        lstRqTalento: ReqTalento[];
        lstRqArchivo: ReqArchivo[];
        lstRqVacantes: ReqVacante[];
    }
}