import { pool } from "../config/database.js";
import bcrypt from "bcrypt";

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

export async function createUser(data: CreateUserData) {
    const { full_name, email, password } = data;

    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const result = await pool.query(
            `INSERT INTO public.users (
                full_name,
                email,
                password_hash,
                is_platform_admin,
                is_active
            )
            VALUES ($1, $2, $3, FALSE, TRUE)
            RETURNING id, full_name, email, is_platform_admin, is_active, created_at`,
            [full_name, email.toLowerCase(), passwordHash]
        );

        return result.rows[0];

    } catch (error: any) {
        if (error.code === "23505") {
            throw new Error("El email ya está registrado");
        }

        throw error;
    }
}

export async function activateUser(userId: string) {
    const result = await pool.query(
        `UPDATE public.users
         SET is_active = TRUE
          WHERE id = $1
          RETURNING id, full_name, email, is_platform_admin, is_active`
          , [userId]
    );

    if (result.rows.length === 0) {
        throw new Error("Usuario no encontrado");
    }

    return result.rows[0];
}




export async function getUsers({ page, limit, search, active}: GetUsersParams) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
        `SELECT
            id,
            email,
            full_name,
            is_platform_admin,
            is_active,
            created_at
         FROM public.users
         WHERE
            ($1::text IS NULL OR full_name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
            AND ($2::boolean IS NULL OR is_active = $2)
         ORDER BY full_name ASC
         LIMIT $3
         OFFSET $4`,
        [
            search ?? null,
            active ?? null,
            limit,
            offset
        ]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total
         FROM public.users
         WHERE
            ($1::text IS NULL OR full_name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
            AND ($2::boolean IS NULL OR is_active = $2)`,
        [
            search ?? null,
            active ?? null
        ]
    );

    return {
        items: result.rows,
        total: countResult.rows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
}

// ### ==========================================
// ### LISTAR USUARIOS - GET /api/v1/users
// ### ==========================================

// ### 1. Listar usuarios (valores predeterminados: page=1, limit=10)
// GET http://localhost:3000/api/v1/users


// ### ==========================================
// ### PAGINACIÓN
// ### ==========================================

// ### 2. Obtener la primera página
// GET http://localhost:3000/api/v1/users?page=1

// ### 3. Obtener la segunda página
// GET http://localhost:3000/api/v1/users?page=2

// ### 4. Obtener la tercera página
// GET http://localhost:3000/api/v1/users?page=3

// ### 5. Obtener 5 usuarios por página
// GET http://localhost:3000/api/v1/users?limit=5

// ### 6. Obtener 20 usuarios por página
// GET http://localhost:3000/api/v1/users?limit=20

// ### 7. Segunda página mostrando 5 usuarios
// GET http://localhost:3000/api/v1/users?page=2&limit=5


// ### ==========================================
// ### BÚSQUEDA POR NOMBRE O EMAIL
// ### ==========================================

// ### 8. Buscar usuarios por nombre
// GET http://localhost:3000/api/v1/users?search=ana

// ### 9. Buscar usuarios por apellido o parte del nombre completo
// GET http://localhost:3000/api/v1/users?search=gomez

// ### 10. Buscar usuarios por email
// GET http://localhost:3000/api/v1/users?search=gmail

// ### 11. Buscar por una dirección de email parcial
// GET http://localhost:3000/api/v1/users?search=@gmail.com

// ### 12. Buscar sin distinguir mayúsculas y minúsculas
// GET http://localhost:3000/api/v1/users?search=ANA


// ### ==========================================
// ### FILTRAR POR ESTADO DE CUENTA
// ### ==========================================

// ### 13. Obtener solamente usuarios activos
// GET http://localhost:3000/api/v1/users?active=true

// ### 14. Obtener solamente usuarios inactivos
// GET http://localhost:3000/api/v1/users?active=false


// ### ==========================================
// ### COMBINAR BÚSQUEDA Y ESTADO
// ### ==========================================

// ### 15. Buscar usuarios activos llamados Ana
// GET http://localhost:3000/api/v1/users?search=ana&active=true

// ### 16. Buscar usuarios inactivos llamados Ana
// GET http://localhost:3000/api/v1/users?search=ana&active=false

// ### 17. Buscar usuarios activos por email
// GET http://localhost:3000/api/v1/users?search=gmail&active=true


// ### ==========================================
// ### COMBINAR TODOS LOS PARÁMETROS
// ### ==========================================

// ### 18. Primera página, 10 usuarios, búsqueda y filtro de activos
// GET http://localhost:3000/api/v1/users?page=1&limit=10&search=ana&active=true

// ### 19. Segunda página, 5 usuarios, búsqueda y filtro de inactivos
// GET http://localhost:3000/api/v1/users?page=2&limit=5&search=gmail&active=false

// ### 20. Tercera página, 20 usuarios activos
// GET http://localhost:3000/api/v1/users?page=3&limit=20&active=true

// ### 21. Primera página, 5 usuarios que coincidan con la búsqueda
// GET http://localhost:3000/api/v1/users?page=1&limit=5&search=martin


// ### ==========================================
// ### CASOS DE PRUEBA / BÚSQUEDAS SIN RESULTADOS
// ### ==========================================

// ### 22. Buscar un usuario inexistente
// GET http://localhost:3000/api/v1/users?search=usuario_inexistente

// ### 23. Buscar un email que no existe
// GET http://localhost:3000/api/v1/users?search=noexiste@example.com

// ### 24. Solicitar una página fuera del rango disponible
// GET http://localhost:3000/api/v1/users?page=100&limit=10

// ### 25. Buscar usuarios inactivos con una coincidencia inexistente
// GET http://localhost:3000/api/v1/users?search=desconocido&active=false