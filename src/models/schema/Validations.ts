import { z } from "zod";

export const validDropdown = z
  .number()
  .int()
  .refine((value) => value !== 0, { message: "Opción no válida" });

export const validDropdownOptional = validDropdown.optional();
