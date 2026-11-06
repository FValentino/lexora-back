import dotenv from "dotenv";

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`,
});

function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Falta configurar la variable de entorno ${name}`);
    }

    return value;
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT || 3000),
    DATABASE_URL: getRequiredEnv("DATABASE_URL"),
    JWT_SECRET: getRequiredEnv("JWT_SECRET"),
};