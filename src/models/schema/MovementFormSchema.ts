import { z } from "zod";
import { validDropdown } from "./Validations";

export const MovementFormSchema = z.object({
    nombres: z.string({
        invalid_type_error: "Campo obligatorio",
    }).min(1, "Campo obligatorio"),
    apellidoPaterno: z.string({
        invalid_type_error: "Campo obligatorio",
    }).min(1, "Campo obligatorio"),
    apellidoMaterno: z.string().optional().nullable(),
    idArea: validDropdown,
    idCliente: z.number().optional(),
    montoBase: z.number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Monto base debe tener 2 decimales"
    }),
    montoMovilidad: z.number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Monto movilidad debe tener 2 decimales"
    }).optional(),
    montoTrimestral: z.number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Monto trimestral debe tener 2 decimales"
    }).optional(),
    montoSemestral: z.number({
        required_error: "Campo obligatorio",
        invalid_type_error: "Monto Semestral debe tener 2 decimales"
    }).optional(),
    puesto: z.string({
        invalid_type_error: "Campo obligatorio",
    }).min(1, "Campo obligatorio"),
    idMovArea: validDropdown,
    jornada: z.string({
        invalid_type_error: "Campo obligatorio",
    }).min(1, "Campo obligatorio"),
    fchMovimiento: z.string({
        invalid_type_error: "Campo obligatorio",
    }).date("Campo obligatorio"),
}).refine((value) => value.montoBase > 0, { message: "El monto base debe ser mayor a 0.", path: ["montoBase"] });

export type MovementFormType = z.infer<typeof MovementFormSchema>;