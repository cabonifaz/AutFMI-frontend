import { z } from "zod";
import { validDropdown } from "./Validations";

export const MovementFormSchema = z.object({
    nombres: z.string().min(1, "Campo obligatorio").default(""),
    apellidos: z.string().min(1, "Campo obligatorio").default(""),
    idUnidad: validDropdown,
    empresa: z.string().optional().default(""),
    montoBase: z.number().min(1, "Campo obligatorio").default(0),
    montoMovilidad: z.number().default(0),
    montoTrimestral: z.number().default(0),
    montoSemestral: z.number().default(0),
    puesto: z.string().min(1, "Campo obligatorio").default(""),
    area: z.string().min(1, "Campo obligatorio").default(""),
    jornada: z.string().min(1, "Campo obligatorio").default(""),
    fchMovimiento: z.string().date("Campo obligatorio").default(""),
});

export type MovementFormType = z.infer<typeof MovementFormSchema>;