import { z } from 'zod';
import { validDropdown } from './Validations';

export const EquipoFormSchema = z.object({
    nombres: z.string().min(1, { message: "El nombre es requerido" }),
    apellidos: z.string().min(1, { message: "Los apellidos son requeridos" }),
    cliente: z.string().min(1, { message: "El cliente es requerido" }),
    area: validDropdown,
    cargo: z.string().min(1, { message: "El cargo es requerido" }),
    fechaSolicitud: z.string().min(1, { message: "La fecha de solicitud es requerida" }),
    fechaEntrega: z.string().min(1, { message: "La fecha de entrega es requerida" }),
    
    // Nuevos campos para selección única
    tipoHardware: validDropdown,
    anexoHardware: validDropdown,
    celular: z.string().min(1, { message: "Celular es requerido" }),
    internetMovil: z.string().min(1, { message: "Internet Móvil es requerido" }),
    
    // Mantener para compatibilidad con el backend
    isPc: z.boolean().default(false),
    isLaptop: z.boolean().default(false),
    anexoFijo: z.boolean().default(false),
    anexoSoftphone: z.boolean().default(false),
    celularsi: z.boolean().optional(),
    celularno: z.boolean().optional(),
    internetMovilsi: z.boolean().optional(),
    internetMovilno: z.boolean().optional(),
    
    // Campos condicionales
    procesador: z.string().optional(),
    ram: z.string().optional(),
    disco: z.string().optional(),
    marca: z.string().optional(),
    accesorios: z.string().optional(),
    
    // Array de software 
    software: z.array(
        z.object({
            producto: z.string().optional(),
            version: z.string().optional()
        })
    )
}).superRefine((data, ctx) => {
    // Validación condicional para procesador, RAM y disco basada en PC o Laptop
    if (data.tipoHardware === 1 || data.tipoHardware === 2) {
        if (!data.procesador || data.procesador.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El procesador es requerido",
                path: ["procesador"]
            });
        }
        
        if (!data.ram || data.ram.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La RAM es requerida",
                path: ["ram"]
            });
        }
        
        if (!data.disco || data.disco.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El disco duro es requerido",
                path: ["disco"]
            });
        }
    }
});

export type EquipoFormType = z.infer<typeof EquipoFormSchema>;