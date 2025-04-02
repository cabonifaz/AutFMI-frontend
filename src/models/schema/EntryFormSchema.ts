import { z } from "zod";
import { validDropdown } from "./Validations";

export const EntryFormSchema = z.object({
    idModalidad: validDropdown,
    nombres: z.string().min(1, "Campo obligatorio"),
    apellidoPaterno: z.string().min(1, "Campo obligatorio"),
    apellidoMaterno: z.string().min(1, "Campo obligatorio"),
    idArea: validDropdown,
    idCliente: validDropdown.optional(),
    idMotivo: validDropdown,
    cargo: z.string().min(1, "Campo obligatorio"),
    horarioTrabajo: z.string().min(1, "Campo obligatorio"),
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
    fchInicioContrato: z.string().date("Campo obligatorio"),
    fchTerminoContrato: z.string().date("Campo obligatorio"),
    proyectoServicio: z.string().min(1, "Campo obligatorio"),
    objetoContrato: z.string().min(1, "Campo obligatorio"),
    declararSunat: validDropdown,
    idSedeDeclarar: validDropdown,
}).refine(
    (data) => {
        if (!data.fchInicioContrato || !data.fchTerminoContrato) {
            return true;
        }
        const inicio = new Date(data.fchInicioContrato);
        const fin = new Date(data.fchTerminoContrato);
        return inicio <= fin;
    },
    {
        message: "La fecha de inicio no puede ser mayor que la fecha de fin",
        path: ["fchInicioContrato"],
    }
).refine(
    (data) => {
        if (!data.fchInicioContrato || !data.fchTerminoContrato) {
            return true;
        }
        const inicio = new Date(data.fchInicioContrato);
        const fin = new Date(data.fchTerminoContrato);
        return fin >= inicio;
    },
    {
        message: "La fecha de fin no puede ser menor que la fecha de inicio",
        path: ["fchTerminoContrato"],
    }
).refine((data) => data.montoBase > 0, { message: "El monto base debe ser mayor a 0.", path: ["montoBase"] });

export type EntryFormType = z.infer<typeof EntryFormSchema>;