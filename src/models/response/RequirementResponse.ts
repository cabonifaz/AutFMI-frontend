import { ReqArchivo } from "../type/ReqArchivo";
import { ReqTalento } from "../type/ReqTalento";

export type RequirementResponse = {
    idTipoMensaje: number;
    mensaje: string;
    requerimiento: {
        idCliente: number;
        cliente: string;
        codigoRQ: string;
        fechaSolicitud: string;
        descripcion: string;
        estado: number;
        vacantes: number;
        lstRqTalento: ReqTalento[];
        lstRqArchivo: ReqArchivo[];
    }
}