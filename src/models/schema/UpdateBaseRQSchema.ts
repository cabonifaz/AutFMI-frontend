import { z } from "zod";

const vacanteSchema = z.object({
    idPerfil: z.number().min(1, "Debe seleccionar un perfil"),
    cantidad: z.number().min(1, "La cantidad debe ser al menos 1")
});

export const UpdateBaseRQSchema = z.object({
    idCliente: z.number().min(1, "El cliente es obligatorio"),
    codigoRQ: z.string().optional(),
    fechaSolicitud: z.string().min(1, "La fecha de solicitud es obligatoria"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    idEstado: z.number().min(1, "El estado es obligatorio"),
    autogenRQ: z.boolean().optional(),
    duracion: z.string()
        .refine((val) => val.trim() !== "", {
            message: "La duración es obligatoria"
        })
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: "La duración debe ser mayor a 0"
        }),
    idDuracion: z.number({
        required_error: "Elija una duración",
        invalid_type_error: "Elija una duración"
    }).min(1, "Elija una duración"),
    idModalidad: z.number({
        required_error: "Elija una modalidad",
        invalid_type_error: "Elija una modalidad"
    }).min(1, "Elija una modalidad"),
    fechaVencimiento: z.string().min(1, "La fecha de vencimiento es obligatoria"),
    lstVacantes: z.array(vacanteSchema).optional(),
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

export type UpdateBaseRQSchemaType = z.infer<typeof UpdateBaseRQSchema>;