import { ClientType } from "../type/ClientType";

export type ClientListResponse = {
    idTipoMensaje: number;
    mensaje: string;
    clientes: ClientType[];
}