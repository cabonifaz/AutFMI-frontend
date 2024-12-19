import { TalentoDetailType } from "../type/TalentoDetailType";

export type TalentoResponse = {
    idTipoMensaje: number;
    mensaje: string;
    talento: TalentoDetailType;
}