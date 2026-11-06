
import { AppDataSource } from "../config/data-source.js";
import { Jurisdiction } from "../entities/Jurisdiction.js";

const jurisdictionRepository = AppDataSource.getRepository(Jurisdiction);



export async function getJurisdictions() {
    const jurisdictions = await jurisdictionRepository.find({
        order: {
            name: "ASC"
        }
    });

    return jurisdictions;
}
