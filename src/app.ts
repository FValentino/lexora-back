declare module "express" {
  export type Express = any;
  const express: any;
  export default express;
}

import express, { type Express } from "express";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import usersRoutes from "./routes/users.routes.js";
import router from "./routes/cases.routes.js";

const app: Express = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/cases", router);
 


export default app;