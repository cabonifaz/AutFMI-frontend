import { z } from "zod";
import { validDropdown } from "./Validations";

export const OutFormSchema = z.object({
    nombres: z.string().min(1, "Campo obligatorio").default(""),
    apellidos: z.string().min(1, "Campo obligatorio").default(""),
    idUnidad: validDropdown,
    empresa: z.string().optional().default(""),
    idMotivo: validDropdown,
    fchCese: z.string().date("Campo obligatorio").default(""),
});

export type OutFormType = z.infer<typeof OutFormSchema>;