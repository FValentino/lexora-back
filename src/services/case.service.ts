import { pool } from "../config/database.js";


export async function isCaseMember(
    caseId: string,
    userId: string
): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1
         FROM public.case_members
         WHERE case_id = $1
            AND user_id = $2`,
        [caseId, userId]
    );

    return (result.rowCount ?? 0) > 0;
}