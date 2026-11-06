
import type { Request, Response } from "express";
import { getCategories, createCategory, updateCategory } from "../services/categories.service.js";



export async function getCategoriesController(req: Request, res: Response) {
    try {
        const parentId = req.query.parentId;
        const tree = req.query.tree === "true";

        if (parentId !== undefined && typeof parentId !== "string") {
            return res.status(400).json({ message: "parentId inválido" });
        }

        const categories = await getCategories(parentId, tree);

        return res.status(200).json({
            items: categories
        });
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        return res.status(500).json({ message: "Error al obtener las categorías" });
    }
}



export async function createCategoryController(req: Request, res: Response) {
    try {
        const category = await createCategory(req.body);

        return res.status(201).json(category);
    } catch (error: any) {
        if (error.message === "MAX_DEPTH_EXCEEDED") {
            return res.status(422).json({
                error: {
                    code: "MAX_DEPTH_EXCEEDED",
                    message: "Categories cannot exceed 3 levels of depth"
                }
            });
        }

        if (error.message === "CATEGORY_PARENT_NOT_FOUND") {
            return res.status(422).json({ message: "La categoría padre no existe" });
        }

        if (error.message === "CATEGORY_SLUG_ALREADY_EXISTS") {
            return res.status(409).json({ message: "Ya existe una categoría con ese slug" });
        }

        console.error("Error al crear categoría:", error);
        return res.status(500).json({ message: "Error al crear la categoría" });
    }
}


export async function updateCategoryController(req: Request, res: Response) {
    try {
        const categoryId = req.params.categoryId;

        if (typeof categoryId !== "string") {
            return res.status(400).json({ message: "ID de categoría inválido" });
        }

        const category = await updateCategory(categoryId, req.body);

        return res.status(200).json(category);
    } catch (error: any) {
        if (error.message === "CATEGORY_NOT_FOUND") {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        if (error.message === "CATEGORY_NAME_ALREADY_EXISTS") {
            return res.status(409).json({ message: "Ya existe una categoría hermana con ese nombre" });
        }

        console.error("Error al editar categoría:", error);
        return res.status(500).json({ message: "Error al editar la categoría" });
    }
}
