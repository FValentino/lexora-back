import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import type { ChangePasswordDTO, LoginDTO } from "../dtos/auth.dto.js";


export async function loginUser({ email, password}: LoginDTO) {
    const result = await pool.query(
        `SELECT id, full_name, email, password_hash, is_platform_admin, is_active
         FROM public.users
         WHERE LOWER(email) = LOWER($1)`
         , [email]
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
            isPlatformAdmin: user.is_platform_admin
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
            full_name: user.full_name,
            email: user.email,
            is_platform_admin: user.is_platform_admin
        },
    };
}

export async function getCurrentUser(userId: string) {
    const result = await pool.query(
        `SELECT id, full_name, email, is_platform_admin
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

export async function changePassword(userId: string, data: ChangePasswordDTO) {
    const { currentPassword, newPassword} = data;

    const result = await pool.query(
        `SELECT password_hash
         FROM public.users
         WHERE id = $1 AND is_active = TRUE`,
         [userId]
    );

    const user = result.rows[0];

    if (!user) {
        throw new Error("Usuario no encontrado o inactivo");
    }

    const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error("La contraseña actual es incorrecta");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await pool.query(
        `UPDATE public.users
         SET password_hash = $1
         WHERE id = $2`,
         [newPasswordHash, userId]
    );

    return { message: "Contraseña actualizada correctamente"};
}