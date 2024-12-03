import { TalentoType } from "./TalentoType";

export type TalentosResponse = {
    idTipoMensaje: number;
    mensaje: string;
    talentos: TalentoType[];
}