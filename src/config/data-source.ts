import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env.js";
import { User } from "../entities/User.js";
import { CaseMember } from "../entities/CaseMember.js";
import { Model } from "../entities/Model.js";
import { Category } from "../entities/Category.js";
import { Jurisdiction } from "../entities/Jurisdiction.js";
export const AppDataSource = new DataSource({
    type: "postgres",
    url: env.DATABASE_URL,
    synchronize: false,
    logging: false,
    entities: [User, CaseMember, Model, Category, Jurisdiction],
    migrations: []
});