
import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { authenticate } from "../middlewares/authenticate.js";

import {
    getCategoriesController,
    createCategoryController,
    updateCategoryController
} from "../controllers/categories.controller.js";

const router: ExpressRouter = Router();

router.use(authenticate);

router.get("/", getCategoriesController);
router.post("/", createCategoryController);
router.patch("/:categoryId", updateCategoryController);

export default router;
