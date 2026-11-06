
import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { authenticate } from "../middlewares/authenticate.js";
import { getJurisdictionsController } from "../controllers/jurisdictions.controller.js";

const router: ExpressRouter = Router();

router.use(authenticate);

router.get("/", getJurisdictionsController);

export default router;
