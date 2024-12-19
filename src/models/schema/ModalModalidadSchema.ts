import { z } from "zod";
import { validDropdown } from "./Validations";

export const ModalModalidadSchema = z.object({
    idModalidad: validDropdown
});

export type ModalModalidadType = z.infer<typeof ModalModalidadSchema>;