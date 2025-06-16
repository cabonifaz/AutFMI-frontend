import { RequirementItem } from "../type/RequirementItemType";

export type RequerimientosResponse = {
    idTipoMensaje: number;
    mensaje: string;
    requerimientos: RequirementItem[];
    totalElementos: number;
    totalPaginas: number;
};