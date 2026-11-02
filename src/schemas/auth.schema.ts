import { z } from "zod";

export const loginSchema = z.object({
    email: z.email({
        error: "Email inválido",
    }),
    password: z.string().min(8, {
        error: "La contraseña debe tener al menos 8 caracteres",
    }),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "La contraseña actual es obligatoria"),
    newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres")
}).refine(
    (data) => data.currentPassword !== data.newPassword,
    {
        message: "La nueva contraseña debe ser diferente a la actual",
        path: ["newPassword"]
    }
);