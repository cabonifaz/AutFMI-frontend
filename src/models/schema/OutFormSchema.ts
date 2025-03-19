import { z } from "zod";
import { validDropdown } from "./Validations";

export const OutFormSchema = z.object({
    nombres: z.string().min(1, "Campo obligatorio"),
    apellidoPaterno: z.string().min(1, "Campo obligatorio"),
    apellidoMaterno: z.string().min(1, "Campo obligatorio"),
    idUnidad: validDropdown,
    empresa: z.string().optional(),
    idMotivo: validDropdown,
    fchCese: z.string().date("Campo obligatorio"),
});

export type OutFormType = z.infer<typeof OutFormSchema>;