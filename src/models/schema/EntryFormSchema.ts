import { z } from "zod";
import { validDropdown } from "./Validations";

export const EntryFormSchema = z.object({
    idModalidad: validDropdown,
    nombres: z.string().min(1, "Campo obligatorio"),
    apellidos: z.string().min(1, "Campo obligatorio"),
    idUnidad: validDropdown,
    empresa: z.string().optional(),
    idMotivo: validDropdown,
    cargo: z.string().min(1, "Campo obligatorio"),
    montoBase: z.number().min(1, "Campo obligatorio"),
    montoMovilidad: z.number(),
    montoTrimestral: z.number(),
    montoSemestral: z.number(),
    fchInicioContrato: z.string().date("Campo obligatorio"),
    fchTerminoContrato: z.string().date("Campo obligatorio"),
    proyectoServicio: z.string().min(1, "Campo obligatorio"),
    objetoContrato: z.string().min(1, "Campo obligatorio"),
    declararSunat: validDropdown,
    idSedeDeclarar: validDropdown,
});

export type EntryFormType = z.infer<typeof EntryFormSchema>;