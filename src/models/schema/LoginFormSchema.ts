import { z } from "zod";

export const LoginFormSchema = z.object({
    username: z.string().min(1, "Campo obligatorio"),
    password: z.string().min(1, "Campo obligatorio")
});

export type LoginFormType = z.infer<typeof LoginFormSchema>;