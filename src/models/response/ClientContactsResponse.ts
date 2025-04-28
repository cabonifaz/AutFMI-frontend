import { ReqContacto } from "../type/ReqContacto";

export interface ClientContactResponse {
    idTipoMensaje: number;
    mensaje: string;
    lstClientContacts: ReqContacto[]
}