import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source.js";
import { User } from "../entities/User.js";
import { ILike } from "typeorm";

interface CreateUserData {
    full_name: string;
    email: string;
    password: string;
}

interface GetUsersParams {
    page: number;
    limit: number;
    search?: string;
    active?: boolean;
}

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data: CreateUserData) {
    const { full_name, email, password } = data;
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const user = userRepository.create({
            fullName: full_name,
            email: email.toLowerCase(),
            passwordHash,
            isPlatformAdmin: false,
            isActive: true
        });

        const savedUser = await userRepository.save(user);

        return {
            id: savedUser.id,
            full_name: savedUser.fullName,
            email: savedUser.email,
            is_platform_admin: savedUser.isPlatformAdmin,
            is_active: savedUser.isActive,
            created_at: savedUser.createdAt
        };
    } catch (error: any) {
        if (error.driverError?.code === "23505") {
            throw new Error("El email ya está registrado");
        }
        throw error;
    }
}

export async function activateUser(userId: string) {
    const result = await userRepository.update(userId, { isActive: true });

    if (result.affected === 0) {
        throw new Error("Usuario no encontrado");
    }

    const user = await userRepository.findOneBy({ id: userId });

    return {
        id: user!.id,
        full_name: user!.fullName,
        email: user!.email,
        is_platform_admin: user!.isPlatformAdmin,
        is_active: user!.isActive
    };
}

export async function getUsers({ page, limit, search, active }: GetUsersParams) {
    const where: any = {};

    if (active !== undefined) where.isActive = active;

    const conditions = search
        ? [
            { ...where, email: ILike(`%${search}%`) },
            { ...where, fullName: ILike(`%${search}%`) }
        ]
        : where;

    const [users, total] = await userRepository.findAndCount({
        where: conditions,
        select: {
            id: true,
            email: true,
            fullName: true,
            isPlatformAdmin: true,
            isActive: true,
            createdAt: true
        },
        order: { fullName: "ASC" },
        take: limit,
        skip: (page - 1) * limit
    });

    return {
        items: users.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            is_platform_admin: user.isPlatformAdmin,
            is_active: user.isActive,
            created_at: user.createdAt
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}