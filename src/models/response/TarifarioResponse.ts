import { Tarifa } from "../type/Tarifa";

export interface TarifarioResponse {
    idTipoMensaje: number;
    mensaje: string;
    lstTarifario: Tarifa[];
}