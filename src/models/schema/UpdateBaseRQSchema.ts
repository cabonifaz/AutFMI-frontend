import { z } from "zod";

const vacanteSchema = z
  .object({
    idRequerimientoVacante: z.number(),
    idPerfil: z.number(),
    cantidad: z.coerce
      .number()
      .min(1, "La cantidad no puede ser menor a 1"),
    idEstado: z.number(),
    tarifa: z.string().optional().nullable(),
    tarifaFinal: z.coerce
      .number()
      .min(0, "La tarifa no puede ser negativa")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.idEstado !== 3) {
      if (data.idPerfil === undefined || data.idPerfil <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar un perfil",
          path: ["idPerfil"],
        });
      }
      if (isNaN(Number(data.cantidad)) && Number(data.cantidad) < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La cantidad debe ser mayor a 0",
        });
      }
    }
  });

export const UpdateBaseRQSchema = z
  .object({
    idCliente: z.number().min(1, "El cliente es obligatorio"),
    codigoRQ: z.string().optional(),
    fechaSolicitud: z
      .string()
      .min(1, "La fecha de solicitud es obligatoria"),
    descripcion: z.string().min(1, "La descripción es obligatoria"),
    titulo: z.string().min(1, "El título es obligatorio"),
    idEstadoRQ: z.number().min(1, "El estado es obligatorio"),
    autogenRQ: z.boolean().optional(),
    duracion: z.coerce.number().min(1, "La duración no puede ser 0"),
    idDuracion: z
      .number({
        required_error: "Elija una duración",
        invalid_type_error: "Elija una duración",
      })
      .min(1, "Elija una duración"),
    idModalidad: z
      .number({
        required_error: "Elija una modalidad",
        invalid_type_error: "Elija una modalidad",
      })
      .min(1, "Elija una modalidad"),
    idModalidadFact: z
      .array(
        z.coerce.number({
          required_error: "Elija una modalidad de pago",
          invalid_type_error: "Elija una modalidad de pago",
        })
      )
      .optional(),
    fechaVencimiento: z
      .string()
      .min(1, "La fecha de vencimiento es obligatoria"),
    lstVacantes: z
      .array(vacanteSchema)
      .min(1, "Debe agregar 1 vacante como mínimo"),
    lstArchivos: z
      .array(
        z.object({
          name: z.string(),
          size: z.number(),
          file: z.instanceof(File),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validación de autogenRQ
    if (!data.autogenRQ && !data.codigoRQ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RQ es obligatorio",
        path: ["codigoRQ"],
      });
    }

    // Validación de fechas (COMO EN TU EQUIPOFORMSCHEMA)
    if (data.fechaSolicitud && data.fechaVencimiento) {
      const fechaSolicitud = new Date(data.fechaSolicitud);
      const fechaVencimiento = new Date(data.fechaVencimiento);

      if (fechaVencimiento < fechaSolicitud) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La fecha de vencimiento no puede ser menor a la fecha de solicitud",
          path: ["fechaVencimiento"],
        });
      }
    }
  });

export type UpdateBaseRQSchemaType = z.infer<
  typeof UpdateBaseRQSchema
>;
