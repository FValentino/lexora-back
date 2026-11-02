import bcrypt from "bcrypt";
import { pool } from "../config/database.js";
async function createAdmin() {
  const email = "admin@lexora.com";
  const password = "LexoraAdmin2026!";
  const fullName = "Administrador Lexora";

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO public.users (
      email,
      password_hash,
      full_name,
      is_platform_admin,
      is_active
    )
    VALUES ($1, $2, $3, TRUE, TRUE)
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, full_name, is_platform_admin`,
    [email, passwordHash, fullName]
  );

  if (result.rowCount === 0) {
    throw new Error("Ya existe un usuario con ese email");
  }

  console.log("Administrador creado:", result.rows[0]);
}

createAdmin()
  .catch(console.error)
  .finally(() => pool.end());