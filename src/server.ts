import "reflect-metadata";
import app from "./app.js";
import { env } from "./config/env.js";
import { AppDataSource } from "./config/data-source.js";

const PORT = process.env.PORT;

AppDataSource.initialize()
    .then(() => {
        console.log("Conexión con la base de datos establecida");

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error al conectar con la base de datos:", error);
    });

