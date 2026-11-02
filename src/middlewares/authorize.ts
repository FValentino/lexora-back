import type { NextFunction, Request, Response } from "express";

export function authorize(_req: Request, res: Response, next: NextFunction) {
    const isPlatformAdmin = res.locals.isPlatformAdmin;

    if (!isPlatformAdmin) {
        return res.status(403).json({
            message: "No tenés permisos"
        });
    }

    next();
}