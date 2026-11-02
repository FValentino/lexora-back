import { z } from "zod";
import { loginSchema, changePasswordSchema } from "../schemas/auth.schema.js";


export type LoginDTO = z.infer<typeof loginSchema>;

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
