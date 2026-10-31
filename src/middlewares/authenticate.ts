import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.session;

        if (!token) {
            return res.status(401).json({
                message: "No estás autenticado",
            })
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET!);

        if (typeof payload === "string" || !payload.sub) {
            return res.status(401).json({
                message: "Token inválido",
            });
        }

        res.locals.userId = payload.sub;

        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Token inválido o expirado",
        })
    }
};
