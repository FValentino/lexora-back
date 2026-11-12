import { Router } from "express";
import { createCase, getCases } from "../controllers/cases.controllers.js";
import { authenticate } from "../middlewares/authenticate.js";
const router = Router();
router.use(authenticate); // Middleware para autenticar el token antes de acceder a las rutas

router.post("/", createCase); 
router.get("/", getCases);  

export default router;