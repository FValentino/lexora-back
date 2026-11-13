
import type { RequestHandler } from "express";
import {
    getModelSources,
    associateSourceToModel,
    disassociateSourceFromModel
} from "../services/model-sources.service.js";

export const listModelSources: RequestHandler = async (req, res) => {
    try {
        const modelId = req.params.modelId as string;

        const result = await getModelSources(
            modelId,
            res.locals.userId,
            res.locals.isPlatformAdmin
        );

        if (result.error === "MODEL_NOT_FOUND") {
            res.status(404).json({ error: result.error });
            return;
        }

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las fuentes del modelo" });
    }
};

export const associateSource: RequestHandler = async (req, res) => {
    try {
        const modelId = req.params.modelId as string;
        const sourceId = req.body?.sourceId;

        if (typeof sourceId !== "string") {
            res.status(422).json({ message: "sourceId es obligatorio" });
            return;
        }

        const result = await associateSourceToModel(
            modelId,
            sourceId,
            res.locals.userId,
            res.locals.isPlatformAdmin
        );

        if (result.error === "MODEL_NOT_FOUND" || result.error === "SOURCE_NOT_FOUND") {
            res.status(404).json({ error: result.error });
            return;
        }

        if (result.error === "MODEL_FORBIDDEN") {
            res.status(403).json({ error: result.error });
            return;
        }

        if (result.error === "SOURCE_ALREADY_ASSOCIATED") {
            res.status(409).json({ error: result.error });
            return;
        }

        res.status(201).json(result.source);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al asociar la fuente" });
    }
};

export const disassociateSource: RequestHandler = async (req, res) => {
    try {
        const modelId = req.params.modelId as string;
        const sourceId = req.params.sourceId as string;

        const result = await disassociateSourceFromModel(
            modelId,
            sourceId,
            res.locals.userId,
            res.locals.isPlatformAdmin
        );

        if (result.error === "MODEL_NOT_FOUND" || result.error === "SOURCE_NOT_FOUND" || result.error === "ASSOCIATION_NOT_FOUND") {
            res.status(404).json({ error: result.error });
            return;
        }

        if (result.error === "MODEL_FORBIDDEN") {
            res.status(403).json({ error: result.error });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al desasociar la fuente" });
    }
};
