
import type { RequestHandler } from "express";

import {
    getSources,
    createSource,
    getSourceById,
    updateSource,
    deleteSource
} from "../services/sources.service.js";

export const listSources: RequestHandler = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const type = typeof req.query.type === "string" ? req.query.type : undefined;
        const q = typeof req.query.q === "string" ? req.query.q : undefined;

        const result = await getSources({ page, limit, type, q });

        res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las fuentes" });
    }
};

export const createSourceController: RequestHandler = async (req, res) => {
    try {
        const result = await createSource({
            ...req.body,
            userId: res.locals.userId
        });

        if ("exists" in result && result.exists) {
            res.status(409).json({
                error: {
                    code: "SOURCE_EXISTS",
                    message: "Ya existe una fuente con esa URL"
                },
                existing: result.source
            });
            return;
        }

        res.status(201).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear la fuente" });
    }
};

export const getSource: RequestHandler = async (req, res) => {
    try {
        const sourceId = req.params.sourceId as string;
        const source = await getSourceById(sourceId);

        if (!source) {
            res.status(404).json({ message: "Fuente no encontrada" });
            return;
        }

        res.status(200).json({ data: source });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la fuente" });
    }
};

export const editSource: RequestHandler = async (req, res) => {
    try {
        const sourceId = req.params.sourceId as string;
        const source = await updateSource(sourceId, req.body);

        if (!source) {
            res.status(404).json({ message: "Fuente no encontrada" });
            return;
        }

        if ("exists" in source && source.exists) {
            res.status(409).json({
                error: {
                    code: "SOURCE_EXISTS",
                    message: "Ya existe una fuente con esa URL"
                },
                existing: source.source
            });
            return;
        }

        res.status(200).json({ data: source });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar la fuente" });
    }
};

export const removeSource: RequestHandler = async (req, res) => {
    try {
        const sourceId = req.params.sourceId as string;
        const result = await deleteSource(sourceId);

        if (result.inUse) {
            res.status(409).json({
                error: {
                    code: "SOURCE_IN_USE",
                    message: "La fuente está asociada a uno o más modelos"
                }
            });
            return;
        }

        if (!result.deleted) {
            res.status(404).json({ message: "Fuente no encontrada" });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar la fuente" });
    }
};
