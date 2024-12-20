import { z } from "zod";
import { validDropdown } from "./Validations";

export const EntryFormSchema = z.object({
    idModalidad: validDropdown,
    nombres: z.string().min(1, "Campo obligatorio").default(""),
    apellidos: z.string().min(1, "Campo obligatorio").default(""),
    idUnidad: validDropdown,
    empresa: z.string().optional().default(""),
    idMotivo: validDropdown,
    cargo: z.string().min(1, "Campo obligatorio").default(""),
    montoBase: z.number().min(1, "Campo obligatorio").default(0),
    montoMovilidad: z.number().default(0),
    montoTrimestral: z.number().default(0),
    montoSemestral: z.number().default(0),
    fchInicioContrato: z.string().date("Campo obligatorio").default(""),
    fchTerminoContrato: z.string().date("Campo obligatorio").default(""),
    proyectoServicio: z.string().min(1, "Campo obligatorio").default(""),
    objetoContrato: z.string().min(1, "Campo obligatorio").default(""),
    declararSunat: validDropdown,
    idSedeDeclarar: validDropdown,
});

export type EntryFormType = z.infer<typeof EntryFormSchema>;