import type { Request, Response } from "express";
import { getUsers, createUser, activateUser } from "../services/users.service.js";

export async function listUsers(req: Request, res: Response) {
    try {
        const { page, limit, search, active } = req.query;

        const result = await getUsers({
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            ...(typeof search === "string" && { search }),
            ...(typeof active === "string" && { active: active === "true" })
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Error al obtener los usuarios"
        });
    }
}

export async function registerUser(req: Request, res: Response) {
    try {
        const user = await createUser(req.body);

        return res.status(201).json({
            message: "Usuario creado correctamente",
            user
        });

    } catch (error) {
        if (error instanceof Error && error.message === "El email ya está registrado") {
            return res.status(409).json({
                message: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Error al crear el usuario"
        });
    }
}

export async function enableUser(req: Request, res: Response) {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                message: "ID de usuario inválido"
            });
        }

        const user = await activateUser(id);

        return res.status(200).json({
            message: "Usuario activado correctamente",
            user
        });

    } catch (error) {
        if (error instanceof Error && error.message === "Usuario no encontrado") {
            return res.status(404).json({
                message: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            message: "Error al activar el usuario"
        });
    }
}