import { z } from "zod";

export const AddRQContactSchema = z.object({
    nombres: z.string().min(1, "Los nombres son obligatorios"),
    apellidoPaterno: z.string().min(1, "El apellido paterno es obligatorio"),
    apellidoMaterno: z.string().min(1, "El apellido materno es obligatorio"),
    telefono: z.string().min(1, "El teléfono es obligatorio"),
    correo: z.string().email("El correo electrónico no es válido"),
    cargo: z.string().min(1, "El cargo es obligatorio"),
});

export type AddRQContactSchemaType = z.infer<typeof AddRQContactSchema>;