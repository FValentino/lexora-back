import { z } from "zod";
import { loginSchema } from "../schemas/auth.schema.js";


export type LoginDTO = z.infer<typeof loginSchema>;


