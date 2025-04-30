import { z } from "zod";
import { validDropdown } from "./Validations";

export const OutFormSchema = z.object({
    nombres: z.string({
        invalid_type_error: "Campo obligatorio",
    }).min(1, "Campo obligatorio"),
    apellidoPaterno: z.string({
        invalid_type_error: "Campo obligatorio",
    }).min(1, "Campo obligatorio"),
    apellidoMaterno: z.string().optional().nullable(),
    idArea: validDropdown,
    idCliente: validDropdown.optional(),
    idMotivo: validDropdown,
    fchCese: z.string({
        invalid_type_error: "Campo obligatorio",
    }).date("Campo obligatorio"),
});

export type OutFormType = z.infer<typeof OutFormSchema>;