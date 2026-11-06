import { AppDataSource } from "../config/data-source.js";
import { CaseMember } from "../entities/CaseMember.js";

const caseMemberRepository = AppDataSource.getRepository(CaseMember);

export async function isCaseMember(caseId: string, userId: string): Promise<boolean> {
    const membership = await caseMemberRepository.findOneBy({
        caseId,
        userId
    });

    return membership !== null;
}