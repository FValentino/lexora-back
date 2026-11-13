
import express, { type Express } from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import usersRoutes from "./routes/users.routes.js";
import modelsRoutes from "./routes/models.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import jurisdictionsRoutes from "./routes/jurisdictions.routes.js";
import sourcesRoutes from "./routes/sources.routes.js";
const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/models", modelsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/jurisdictions", jurisdictionsRoutes);
app.use("/api/v1/sources", sourcesRoutes);

export default app;
