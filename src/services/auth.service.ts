import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entities/User.js";
import { env } from "../config/env.js";
import type { ChangePasswordDTO, LoginDTO } from "../dtos/auth.dto.js";

const userRepository = AppDataSource.getRepository(User);

export async function loginUser({ email, password }: LoginDTO) {
    const user = await userRepository
        .createQueryBuilder("user")
        .addSelect("user.passwordHash")
        .where("LOWER(user.email) = LOWER(:email)", { email })
        .getOne();

    if (!user || !user.isActive) {
        throw new Error("Credenciales inválidas");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
        throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            isPlatformAdmin: user.isPlatformAdmin
        },
        env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            full_name: user.fullName,
            email: user.email,
            is_platform_admin: user.isPlatformAdmin
        }
    };
}

export async function getCurrentUser(userId: string) {
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    return {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        is_platform_admin: user.isPlatformAdmin
    };
}

export async function changePassword(userId: string, data: ChangePasswordDTO) {
    const { currentPassword, newPassword } = data;

    const user = await userRepository
        .createQueryBuilder("user")
        .addSelect("user.passwordHash")
        .where("user.id = :userId", { userId })
        .andWhere("user.isActive = :active", { active: true })
        .getOne();

    if (!user) {
        throw new Error("Usuario no encontrado o inactivo");
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatches) {
        throw new Error("La contraseña actual es incorrecta");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await userRepository.update(userId, {
        passwordHash: newPasswordHash
    });

    return {
        message: "Contraseña actualizada correctamente"
    };
}