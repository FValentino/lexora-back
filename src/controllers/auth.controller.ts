import type { NextFunction, Request, Response} from "express";
import { loginUser, getCurrentUser, changePassword } from "../services/auth.service.js";

export async function login(req: Request, res: Response) {
    try {
        const { email, password} = req.body;

        const result = await loginUser({ email, password });

        res.cookie("lexora_session", result.token, {
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
        if (error instanceof Error && error.message === "Credenciales inválidas") {
            return res.status(401).json({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                }
                
            });
        }
        
        console.log(error);

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Error interno del servidor"
            }
        });
    } 
    
}
export async function getMe(_req: Request, res: Response) {
    try {
        const userId = res.locals.userId;
        const user = await getCurrentUser(userId);

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Error interno del servidor"
            }
        });
    }
}

export function logout(_req: Request, res: Response) { //_req -> el _ indica que la variable no se utiliza
    res.clearCookie("lexora_session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res.status(204).send();
}

export async function changePasswordController(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.userId;

        const result = await changePassword(userId, req.body);

        return res.status(204).send();
    } catch (error) {
        if (error instanceof Error && error.message === "La contraseña actual es incorrecta") {
            return res.status(422).json({
                error: {
                    code: "INVALID_CURRENT_PASSWORD",
                    message: "Current password is incorrect"
                }
            });
        }

        next(error);
    }
}