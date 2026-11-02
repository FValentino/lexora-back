import type { Request, Response, NextFunction } from "express";
import { isCaseMember } from "../services/case.service.js";

export async function verifyCaseMembership(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;
        const caseId = req.params.caseId;

        if (!caseId || typeof caseId !== "string") {
            return res.status(400).json({
                message: "ID de caso inválido"
            });
        }

        const isMember = await isCaseMember(caseId, userId);

        if (!isMember) {
            return res.status(403).json({
                message: "No tenés permisos para acceder a este caso"
            });
        }

        next();
    } catch (error) {
        next(error);
    }
} 