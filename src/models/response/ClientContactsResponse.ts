import { ClientContact } from "../type/ClientContact";

export interface ClientContactResponse {
    idTipoMensaje: number;
    mensaje: string;
    lstClientContacts: ClientContact[]
}