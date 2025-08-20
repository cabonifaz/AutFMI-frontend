import { z } from "zod";

const vacanteSchema = z.object({
  idPerfil: z
    .number({ invalid_type_error: "Debe seleccionar un perfil" })
    .min(1, "Debe seleccionar un perfil"),
  cantidad: z
    .string()
    .refine((val) => val.trim() !== "", {
      message: "La cantidad es obligatoria",
    })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La cantidad debe ser mayor a 0",
    }),
  tarifa: z.string().optional().nullable(),
});

export const newRQSchema = z
  .object({
    idCliente: z
      .number({
        invalid_type_error: "Debe elegir un cliente",
      })
      .min(1, "Debe elegir un cliente"),
    titulo: z.string().min(1, "El título es obligatorio"),
    codigoRQ: z.string().optional(),
    fechaSolicitud: z.string().min(1, "La fecha de solicitud es obligatoria"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    idEstado: z.number().min(1, "El estado es obligatorio"),
    autogenRQ: z.boolean(),
    fechaVencimiento: z
      .string()
      .min(1, "La fecha de vencimiento es obligatoria"),
    duracion: z
      .string()
      .refine((val) => val.trim() !== "", {
        message: "La duración es obligatoria",
      })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "La duración debe ser mayor a 0",
      }),
    idDuracion: z
      .number({
        required_error: "Elija una duración",
        invalid_type_error: "Elija una duración",
      })
      .min(1, "elige una duración"),
    idModalidad: z
      .number({
        required_error: "Elija una modalidad",
        invalid_type_error: "Elija una modalidad",
      })
      .min(1, "Elija una modalidad"),
    lstVacantes: z
      .array(vacanteSchema)
      .min(1, "Debe agregar 1 vacante como mínimo"),
    lstArchivos: z
      .array(
        z.object({
          name: z.string(),
          size: z.number(),
          file: z.instanceof(File),
        }),
      )
      .optional(),
  })
  .refine((data) => (!data.autogenRQ ? !!data.codigoRQ : true), {
    message: "El RQ es obligatorio",
    path: ["codigoRQ"],
  });

export type newRQSchemaType = z.infer<typeof newRQSchema>;
