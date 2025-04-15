import { z } from "zod";

const vacanteSchema = z.object({
    idPerfil: z.number().min(1, "Debe seleccionar un perfil"),
    cantidad: z.number({
        invalid_type_error: "La cantidad debe ser al menos 1"
    }).min(1, "La cantidad debe ser al menos 1")
});

export const newRQSchema = z.object({
    idCliente: z.number().min(1, "El cliente es obligatorio"),
    codigoRQ: z.string().optional(),
    fechaSolicitud: z.string().min(1, "La fecha de solicitud es obligatoria"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    idEstado: z.number().min(1, "El estado es obligatorio"),
    autogenRQ: z.boolean(),
    lstVacantes: z.array(vacanteSchema).min(1, "Debe agregar al menos una vacante"),
    lstArchivos: z
        .array(
            z.object({
                name: z.string(),
                size: z.number(),
                file: z.instanceof(File),
            })
        )
        .optional(),
}).refine(
    (data) => !data.autogenRQ ? !!data.codigoRQ : true,
    {
        message: "El RQ es obligatorio",
        path: ["codigoRQ"]
    }
);

export type newRQSchemaType = z.infer<typeof newRQSchema>;