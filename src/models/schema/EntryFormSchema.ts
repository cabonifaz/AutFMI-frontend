import { z } from "zod";
import { validDropdown } from "./Validations";

export const EntryFormSchema = z.object({
    idModalidad: validDropdown,
    nombres: z.string().min(1, "Campo obligatorio"),
    apellidos: z.string().min(1, "Campo obligatorio"),
    idUnidad: validDropdown,
    empresa: z.string().min(1, "Campo obligatorio"),
    idMotivo: validDropdown,
    cargo: z.number().min(1, "Campo obligatorio"),
    montoBase: z.number().min(1, "Campo obligatorio"),
    montoMovilidad: z.number().min(1, "Campo obligatorio"),
    montoTrimestral: z.number().min(1, "Campo obligatorio"),
    montoSemestral: z.number().min(1, "Campo obligatorio"),
    fchInicioContrato: z.string().date("Campo obligatorio"),
    fchTerminoContrato: z.string().date("Campo obligatorio"),
    proyectoServicio: z.number().min(1, "Campo obligatorio"),
    objetoContrato: z.string().min(1, "Campo obligatorio"),
    declararSunat: validDropdown,
    sedeDeclarar: validDropdown,
});

export type EntryFormType = z.infer<typeof EntryFormSchema>;