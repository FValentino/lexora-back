import express, { type Express } from "express";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/admin.routes.js";
import usersRoutes from "./routes/users.routes.js";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", usersRoutes);



export default app;