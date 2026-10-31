import type { Request, Response} from "express";
import { loginUser, getCurrentUser } from "../services/auth.service.js";

export async function login(req: Request, res: Response) {
    try {
        const { email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({
                message: "Email y contraseña son obligatorios"
            });
        }

        const result = await loginUser({ email, password });

        res.cookie("session", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        })


        return res.status(200).json({
            message: "Login exitoso",
            user: result.user,
        });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Credencales inválidas") {
            return res.status(401).json({
                message: "Email o contraseña incorrectos",
            });
        }
        
        console.log(error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    } 
    
}
export async function getMe(req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const user = await getCurrentUser(userId);

        return res.status(200).json({
            user,
        });
    } catch (error) {
        return res.status(404).json({
            message: "Usuario no encontrado",
        });
    }
}

export function logout(_req: Request, res: Response) { //_req -> el _ indica que la variable no se utiliza
    res.clearCookie("session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res.status(200).json({
        message: "Sesión cerrada correctamente",
    });
}