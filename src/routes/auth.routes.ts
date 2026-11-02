import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { login, getMe, logout, changePasswordController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { changePasswordSchema, loginSchema } from "../schemas/auth.schema.js";

const router: ExpressRouter = Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', logout)
router.get('/me', authenticate, getMe);
router.patch('/password', authenticate, validate(changePasswordSchema), changePasswordController);
export default router;