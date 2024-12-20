import { z } from "zod";

export const validDropdown = z
    .number().default(0)
    .refine(value => value !== 0, { message: "Opción no válida" });