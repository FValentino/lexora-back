import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.lexora_session;

        if (!token) {
            return res.status(401).json({
                error: {
                    code: "UNAUTHORIZED",
                    message: "No estás autenticado"
                }
            });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET!);

         if (
            typeof payload === "string" ||
            typeof payload.sub !== "string" ||
            typeof payload.isPlatformAdmin !== "boolean"
        ) {
            return res.status(401).json({
                error: {
                    code: "INVALID_TOKEN",
                    message: "Token inválido"
                }
            });
        }

        res.locals.userId = payload.sub;
        res.locals.isPlatformAdmin = payload.isPlatformAdmin;

        next();
    }
    catch (error) {
        return res.status(401).json({
            error: {
                code: "INVALID_TOKEN",
                message: "Token inválido o expirado"
            }
        });
    }
};
