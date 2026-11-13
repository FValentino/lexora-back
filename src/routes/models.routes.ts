
import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { authenticate } from "../middlewares/authenticate.js";

import {
    getModelsController,
    getModelByIdController,
    createModelController,
    updateModelController,
    updateModelVisibilityController,
    reviewModelController
} from "../controllers/models.controller.js";

import {
    listModelSources,
    associateSource,
    disassociateSource
} from "../controllers/model-sources.controller.js";

const router: ExpressRouter = Router();

router.use(authenticate);

router.get("/", getModelsController);
router.get("/:modelId", getModelByIdController);
router.post("/", createModelController);
router.patch("/:modelId", updateModelController);
router.patch("/:modelId/visibility", updateModelVisibilityController);
router.patch("/:modelId/review", reviewModelController);

router.get("/:modelId/sources", listModelSources);
router.post("/:modelId/sources", associateSource);
router.delete("/:modelId/sources/:sourceId", disassociateSource);

export default router;
