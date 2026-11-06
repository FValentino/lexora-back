import type { Request, Response } from "express";
import {
    getModels,
    getModelById,
    createModel,
    updateModel,
    updateModelVisibility,
    reviewModel
} from "../services/models.service.js";



export async function getModelsController(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await getModels({
            userId,
            page,
            limit,
            q: req.query.q as string,
            categoryId: req.query.categoryId as string,
            jurisdictionId: req.query.jurisdictionId as string,
            reviewStatus: req.query.reviewStatus as any,
            visibility: req.query.visibility as any,
            sort: req.query.sort as any
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error al obtener modelos:", error);
        return res.status(500).json({ message: "Error al obtener los modelos" });
    }
}



export async function getModelByIdController(req: Request, res: Response) {
    try {
        const { modelId } = req.params;
        const userId = res.locals.userId;

        if (typeof modelId !== "string") {

            return res.status(400).json({ message: "ID de modelo inválido" });

        }
        const model = await getModelById(modelId, userId);

        return res.status(200).json(model);
    } catch (error: any) {
        if (error.message === "MODEL_NOT_FOUND") {
            return res.status(404).json({ message: "Modelo no encontrado" });
        }

        console.error("Error al obtener el modelo:", error);
        return res.status(500).json({ message: "Error al obtener el modelo" });
    }
}


export async function createModelController(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;

        const model = await createModel(req.body, userId);

        return res.status(201).json(model);
    } catch (error: any) {
        if (error.message === "MODEL_SLUG_ALREADY_EXISTS") {
            return res.status(409).json({ message: "Ya existe un modelo con ese slug" });
        }

        if (error.message === "MODEL_REFERENCE_NOT_FOUND") {
            return res.status(422).json({ message: "La categoría o jurisdicción indicada no existe" });
        }

        console.error("Error al crear el modelo:", error);
        return res.status(500).json({ message: "Error al crear el modelo" });
    }
}



export async function updateModelController(req: Request, res: Response) {
    try {
        const { modelId } = req.params;
        const userId = res.locals.userId;
        const isPlatformAdmin = res.locals.isPlatformAdmin;
        if (typeof modelId !== "string") {
            return res.status(400).json({ message: "ID de modelo inválido" });
        }
        const model = await updateModel(modelId, req.body, userId, isPlatformAdmin);

        return res.status(200).json(model);
    } catch (error: any) {
        if (error.message === "MODEL_NOT_FOUND") {
            return res.status(404).json({ message: "Modelo no encontrado" });
        }

        if (error.message === "MODEL_FORBIDDEN") {
            return res.status(403).json({ message: "No tenés permisos para editar este modelo" });
        }

        if (error.message === "MODEL_SLUG_ALREADY_EXISTS") {
            return res.status(409).json({ message: "Ya existe un modelo con ese slug" });
        }

        if (error.message === "MODEL_REFERENCE_NOT_FOUND") {
            return res.status(422).json({ message: "La categoría o jurisdicción indicada no existe" });
        }

        console.error("Error al editar el modelo:", error);
        return res.status(500).json({ message: "Error al editar el modelo" });
    }
}



export async function updateModelVisibilityController(req: Request, res: Response) {
    try {
        const { modelId } = req.params;
        const { visibility } = req.body;

        const userId = res.locals.userId;

        if (typeof modelId !== "string") {

            return res.status(400).json({ message: "ID de modelo inválido" });

        }

        const isPlatformAdmin = res.locals.isPlatformAdmin;

        const model = await updateModelVisibility(modelId, visibility, userId, isPlatformAdmin);

        return res.status(200).json(model);
    } catch (error: any) {
        if (error.message === "MODEL_NOT_FOUND") {
            return res.status(404).json({ message: "Modelo no encontrado" });
        }

        if (error.message === "MODEL_FORBIDDEN") {
            return res.status(403).json({ message: "No tenés permisos para cambiar la visibilidad" });
        }

        console.error("Error al cambiar la visibilidad:", error);
        return res.status(500).json({ message: "Error al cambiar la visibilidad del modelo" });
    }
}



export async function reviewModelController(req: Request, res: Response) {
    try {
        const { modelId } = req.params;
        const { status } = req.body;

        const userId = res.locals.userId;

        if (typeof modelId !== "string") {

            return res.status(400).json({ message: "ID de modelo inválido" });
            
        }
        const isPlatformAdmin = res.locals.isPlatformAdmin;

        const model = await reviewModel(modelId, status, userId, isPlatformAdmin);

        return res.status(200).json(model);
    } catch (error: any) {
        if (error.message === "MODEL_NOT_FOUND") {
            return res.status(404).json({ message: "Modelo no encontrado" });
        }

        if (error.message === "MODEL_FORBIDDEN") {
            return res.status(403).json({ message: "No tenés permisos para revisar este modelo" });
        }

        console.error("Error al actualizar la revisión:", error);
        return res.status(500).json({ message: "Error al actualizar el estado de revisión" });
    }
}
