import { ReqArchivo } from "../type/ReqArchivo";
import { ReqContacto } from "../type/ReqContacto";
import { ReqTalento } from "../type/ReqTalento";
import { ReqVacante } from "../type/ReqVacante";

export type RequirementResponse = {
    idTipoMensaje: number;
    mensaje: string;
    requerimiento: {
        idCliente: number;
        cliente: string;
        titulo: string;
        codigoRQ: string;
        fechaSolicitud: string;
        fechaVencimiento: string;
        descripcion: string;
        idEstado: number;
        vacantes: number;
        idDuracion: number;
        idModalidad: number;
        duracion: number;
        lstRqTalento: ReqTalento[];
        lstRqArchivo: ReqArchivo[];
        lstRqVacantes: ReqVacante[];
        lstRqContactos: ReqContacto[];
    }
}