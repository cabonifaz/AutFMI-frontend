import { TalentoDetailType } from "./TalentoDetailType";

export type TalentoResponse = {
    idTipoMensaje: number;
    mensaje: string;
    talento: TalentoDetailType;
}