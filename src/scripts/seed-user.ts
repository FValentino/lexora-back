import bcrypt from "bcrypt";
import { pool } from "../config/database.js";
import { randomUUID } from "node:crypto";
async function seedUser() {
  try {
    const firstName = "Juan";
    const lastName = "Pérez";
    const email = "juan@lexora.test";
    const password = "Juan123!";
    const registration = "TOMO-123-FOLIO-456";
    const id = randomUUID();
    // Verificar si el usuario ya existe
    const existingUser = await pool.query(
      "SELECT id FROM public.users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
      console.log("El usuario de prueba ya existe");
      return;
    }

    // Generar hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    await pool.query(
    `INSERT INTO public.users
        (id, first_name, last_name, email, password_hash, bar_association_registration)
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, firstName, lastName, email, passwordHash, registration]
    );

    console.log("Usuario de prueba creado correctamente");
  } catch (error) {
    console.error("Error creando usuario:", error);
  } finally {
    await pool.end();
  }
}

seedUser();