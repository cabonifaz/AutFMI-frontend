import { TalentoType } from "../type/TalentoType";

export type TalentosResponse = {
    idTipoMensaje: number;
    mensaje: string;
    talentos: TalentoType[];
    totalElementos: number;
    totalPaginas: number;
}