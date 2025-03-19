import { z } from "zod";
import { validDropdown } from "./Validations";

export const MovementFormSchema = z.object({
    nombres: z.string().min(1, "Campo obligatorio"),
    apellidoPaterno: z.string().min(1, "Campo obligatorio"),
    apellidoMaterno: z.string().min(1, "Campo obligatorio"),
    idUnidad: validDropdown,
    empresa: z.string().optional(),
    montoBase: z.number(),
    montoMovilidad: z.number().optional(),
    montoTrimestral: z.number().optional(),
    montoSemestral: z.number().optional(),
    puesto: z.string().min(1, "Campo obligatorio"),
    area: z.string().min(1, "Campo obligatorio"),
    jornada: z.string().min(1, "Campo obligatorio"),
    fchMovimiento: z.string().date("Campo obligatorio"),
}).refine((value) => value.montoBase > 0, { message: "El monto base debe ser mayor a 0.", path: ["montoBase"] });

export type MovementFormType = z.infer<typeof MovementFormSchema>;