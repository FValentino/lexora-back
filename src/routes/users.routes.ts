import { Router } from "express";
import { Router as ExpressRouter} from "express";

import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { listUsers, registerUser, enableUser } from "../controllers/users.controller.js";

const router: ExpressRouter = Router();

router.use(authenticate);
router.use(authorize);

router.get('/', listUsers);

router.post('/', registerUser);

router.patch("/:id/activate", enableUser);


export default router;