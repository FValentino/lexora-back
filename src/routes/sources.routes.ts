import { Router } from "express";
import {
    listSources,
    createSourceController,
    getSource,
    editSource,
    removeSource
} from "../controllers/sources.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", listSources);
router.post("/", createSourceController);
router.get("/:sourceId", getSource);
router.patch("/:sourceId", editSource);
router.delete("/:sourceId", removeSource);

export default router;