import type { NextFunction, Response, Request } from "express";
import { z } from "zod";
export function validate(schema: z.ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Error de validación",
                errors: result.error.issues,
            });
        }

        req.body = result.data;
        next();
    }
}