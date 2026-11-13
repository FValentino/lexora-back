
import { AppDataSource } from "../config/data-source.js";

export async function getModelSources(modelId: string, userId: string, isPlatformAdmin: boolean) {
    const models = await AppDataSource.query(
        `SELECT id, created_by AS "createdBy", visibility
         FROM public.models
         WHERE id = $1`,
        [modelId]
    );

    if (models.length === 0) {
        return { error: "MODEL_NOT_FOUND" };
    }

    const model = models[0];

    if (model.visibility === "private" && model.createdBy !== userId && !isPlatformAdmin) {
        return { error: "MODEL_NOT_FOUND" };
    }

    const items = await AppDataSource.query(
        `SELECT
            s.id,
            s.type,
            s.title,
            s.issuer,
            s.url,
            s.jurisdiction_id AS "jurisdictionId",
            s.published_at AS "publishedAt",
            s.reviewed_at AS "reviewedAt",
            s.notes,
            s.visibility,
            s.created_by AS "createdBy",
            s.created_at AS "createdAt"
         FROM public.model_sources ms
         INNER JOIN public.sources s ON s.id = ms.source_id
         WHERE ms.model_id = $1
         ORDER BY ms.created_at DESC`,
        [modelId]
    );

    return { items };
}

export async function associateSourceToModel(modelId: string, sourceId: string, userId: string, isPlatformAdmin: boolean) {
    const models = await AppDataSource.query(
        `SELECT id, created_by AS "createdBy"
         FROM public.models
         WHERE id = $1`,
        [modelId]
    );

    if (models.length === 0) {
        return { error: "MODEL_NOT_FOUND" };
    }

    if (models[0].createdBy !== userId && !isPlatformAdmin) {
        return { error: "MODEL_FORBIDDEN" };
    }

    const sources = await AppDataSource.query(
        `SELECT id FROM public.sources WHERE id = $1`,
        [sourceId]
    );

    if (sources.length === 0) {
        return { error: "SOURCE_NOT_FOUND" };
    }

    const result = await AppDataSource.query(
        `INSERT INTO public.model_sources (model_id, source_id)
         VALUES ($1, $2)
         ON CONFLICT (model_id, source_id) DO NOTHING
         RETURNING source_id`,
        [modelId, sourceId]
    );

    if (result.length === 0) {
        return { error: "SOURCE_ALREADY_ASSOCIATED" };
    }

    const source = await AppDataSource.query(
        `SELECT
            id,
            type,
            title,
            issuer,
            url,
            jurisdiction_id AS "jurisdictionId",
            published_at AS "publishedAt",
            reviewed_at AS "reviewedAt",
            notes,
            visibility,
            created_by AS "createdBy",
            created_at AS "createdAt"
         FROM public.sources
         WHERE id = $1`,
        [sourceId]
    );

    return { source: source[0] };
}

export async function disassociateSourceFromModel(modelId: string, sourceId: string, userId: string, isPlatformAdmin: boolean) {
    const models = await AppDataSource.query(
        `SELECT id, created_by AS "createdBy"
         FROM public.models
         WHERE id = $1`,
        [modelId]
    );

    if (models.length === 0) {
        return { error: "MODEL_NOT_FOUND" };
    }

    if (models[0].createdBy !== userId && !isPlatformAdmin) {
        return { error: "MODEL_FORBIDDEN" };
    }

    const sources = await AppDataSource.query(
        `SELECT id FROM public.sources WHERE id = $1`,
        [sourceId]
    );

    if (sources.length === 0) {
        return { error: "SOURCE_NOT_FOUND" };
    }

    const result = await AppDataSource.query(
        `DELETE FROM public.model_sources
         WHERE model_id = $1 AND source_id = $2
         RETURNING model_id`,
        [modelId, sourceId]
    );

    if (result.length === 0) {
        return { error: "ASSOCIATION_NOT_FOUND" };
    }

    return { disassociated: true };
}
