
import type { Request, Response } from "express";
import { getJurisdictions } from "../services/jurisdictions.service.js";



export async function getJurisdictionsController(req: Request, res: Response) {
    try {
        const jurisdictions = await getJurisdictions();

        return res.status(200).json({
            items: jurisdictions
        });
    } catch (error) {
        console.error("Error al obtener jurisdicciones:", error);
        return res.status(500).json({ message: "Error al obtener las jurisdicciones" });
    }
}
