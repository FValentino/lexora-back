import express, { type Express } from "express";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";


const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);


export default app;