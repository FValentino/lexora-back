import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import type { LoginDTO } from "../dtos/auth.dto.js";


export async function loginUser({ email, password}: LoginDTO) {
    const result = await pool.query(
        `SELECT id, first_name, last_name, email, password_hash
         FROM public.users
         WHERE email = $1
         `, [email]
    )

    const user = result.rows[0];

    if (!user) {
        throw new Error('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
        {
            sub: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "1d",
        }
    );

    return {
        token,
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        },
    };
}

export async function getCurrentUser(userId: string) {
    const result = await pool.query(
        `SELECT id, first_name, last_name, email
         FROM public.users
         WHERE id = $1`,
         [userId]
    );

    const user = result.rows[0];

    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    return user;
}