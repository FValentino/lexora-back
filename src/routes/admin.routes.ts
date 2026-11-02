import { Router } from "express";
import { Router as ExpressRouter } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { getAdminDashboard } from "../controllers/admin.controller.js";


const router: ExpressRouter = Router();

router.get('/', authenticate, authorize, getAdminDashboard);

export default router;