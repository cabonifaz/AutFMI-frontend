import { z } from "zod";
import { CurrencyType } from "../../utils";

const vacanteSchema = z.object({
  idPerfil: z
    .number({ invalid_type_error: "Debe seleccionar un perfil" })
    .min(1, "Debe seleccionar un perfil"),
  cantidad: z.coerce.number().min(1, "La cantidad no puede ser menor a 1"),
  tarifa: z.string().optional().nullable(),
  tarifaFinal: z.coerce
    .number()
    .min(0, "La tarifa final no puede ser menor a 0")
    .optional(),
});

// Subschema: Skills por vacante
const vacanteSkillSchema = z.object({
  idPerfil: z.number(),
  idSkill: z.number(),
  anios: z.coerce
    .number({
      invalid_type_error: "Los años deben ser un número",
    })
    .min(0)
    .optional(),
  isOptional: z.boolean(),
});

// Subschema: Carreras por vacante
const vacanteCareerSchema = z.object({
  idPerfil: z.number(),
  carrera: z.string().min(1, "La carrera es obligatoria"),
  idGrado: z.number().min(1, "Debe elegir un grado"),
  isOptional: z.boolean(),
});

// Subchema: Duración de contrato
const contrato = z.object({
  idDuracionContrato: z
    .number({
      invalid_type_error: "Debe elegir una duración de contrato",
    })
    .min(1, "Debe elegir una duración de contrato"),
  duracionContrato: z.coerce
    .number({
      invalid_type_error: "La duración debe ser un número",
    })
    .min(1, "La duración no puede ser menor a 1"),
});

const rqFacturacionSchema = z
  .object({
    idModalidad: z.coerce.number().default(0),
    idGrupoModalidad: z.coerce.number().default(0),

    // Base Amounts
    minBaseAmount: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),
    maxBaseAmount: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),

    // Travel Allowance / Mobility
    minTravelAllowance: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo"),
    maxTravelAllowance: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),

    // Monthly Frequency
    minMonthlyAmount: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),
    maxMonthlyAmount: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),

    // Quarterly Frequency (Every 3 months)
    minQuarterlyAmount: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),
    maxQuarterlyAmount: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),

    // Semi-Annual Frequency (Every 6 months)
    minSemiAnnualAmount: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),
    maxSemiAnnualAmount: z.coerce
      .number()
      .min(0, "Este valor no puede ser negativo")
      .default(0),

    currencyType: z.coerce
      .number()
      .min(1, "Se necesita selecionar una moneda")
      .default(0),
  })
  .superRefine((data, ctx) => {
    // Función auxiliar para validar pares
    const validateRange = (min: number, max: number, path: string) => {
      if (max < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El monto máximo no puede ser menor al mínimo",
          path: [path],
        });
      }
    };

    validateRange(data.minBaseAmount, data.maxBaseAmount, "maxBaseAmount");
    validateRange(
      data.minTravelAllowance,
      data.maxTravelAllowance,
      "maxTravelAllowance",
    );
    validateRange(
      data.minMonthlyAmount,
      data.maxMonthlyAmount,
      "maxMonthlyAmount",
    );
    validateRange(
      data.minQuarterlyAmount,
      data.maxQuarterlyAmount,
      "maxQuarterlyAmount",
    );
    validateRange(
      data.minSemiAnnualAmount,
      data.maxSemiAnnualAmount,
      "maxSemiAnnualAmount",
    );
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
    fechaSolicitud: z
      .string({
        required_error: "La fecha de solicitud es obligatoria",
      })
      .min(1, "La fecha de solicitud es obligatoria"),
    descripcion: z
      .string()
      .min(1, "La descripción es obligatoria")
      .max(255, "La descripción no puede exceder los 255 caracteres"),
    idEstado: z.number().min(1, "El estado es obligatorio"),
    autogenRQ: z.boolean(),
    fechaVencimiento: z
      .string({
        required_error: "La fecha de vencimiento es obligatoria",
      })
      .min(1, "La fecha de vencimiento es obligatoria"),
    duracion: z.coerce
      .number()
      .min(1, "La duración no puede ser menor a 1")
      .optional(),

    // Duracón de contrato
    contrato: contrato,
    idDuracion: z
      .number({
        required_error: "Elija una duración",
        invalid_type_error: "Elija una duración",
      })
      .min(1, "elige una duración")
      .optional(),
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
        }),
      )
      .optional(),
    lstVacantes: z
      .array(vacanteSchema)
      .min(1, "Debe agregar 1 vacante como mínimo"),

    // Control de vacantes y carreras
    lstVacanteSkills: z.array(vacanteSkillSchema).optional(),
    lstCarreras: z.array(vacanteCareerSchema).optional(),

    // Tiene duración
    tieneDuracion: z.boolean(),

    lstContactos: z.array(z.number()).optional(),

    // Array de facturación por modalidades seleccionadas
    lstFacturacion: z.array(rqFacturacionSchema).optional(),

    lstArchivos: z
      .array(
        z.object({
          name: z.string(),
          size: z.number(),
          file: z.instanceof(File),
          idTipoArchivoRQ: z.coerce
            .number({
              required_error: "Elija un tipo de archivo",
              invalid_type_error: "Elija un tipo de archivo",
            })
            .min(1, "Elija un tipo de archivo"),
        }),
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

    // Validación de duración
    if (data.tieneDuracion && !data.duracion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La duración es obligatoria si tiene duración",
        path: ["duracion"],
      });
    }

    if (data.tieneDuracion && !data.idDuracion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La duración es obligatoria si tiene duración",
        path: ["idDuracion"],
      });
    }
  });

export type newRQSchemaType = z.infer<typeof newRQSchema>;
