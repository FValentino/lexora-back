import type { Request, Response } from "express";

export function getAdminDashboard(req: Request, res: Response) {
    return res.status(200).json({
        message: "Bienvenido administrador",
    });
}