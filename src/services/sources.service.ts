
import { AppDataSource } from "../config/data-source.js";

interface GetSourcesParams {
    page: number;
    limit: number;
    type?: string | undefined;
    q?: string | undefined;
}

interface CreateSourceParams {
    type: string;
    title: string;
    issuer?: string | null;
    url?: string | null;
    jurisdictionId?: string | null;
    publishedAt?: string | null;
    notes?: string | null;
    visibility?: string;
    userId: string;
}

interface UpdateSourceParams {
    title?: string;
    url?: string;
    type?: string;
    reference?: string;
}

function normalizeUrl(value: string): string {
    const url = new URL(value.trim());

    url.hash = "";

    if (url.pathname.length > 1) {
        url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
}

async function findSourceByNormalizedUrl(url: string, excludeSourceId?: string) {
    const sources = await AppDataSource.query(
        `
        SELECT
            id, type, title, issuer, url,
            jurisdiction_id AS "jurisdictionId",
            published_at AS "publishedAt",
            reviewed_at AS "reviewedAt",
            notes, visibility,
            created_by AS "createdBy",
            created_at AS "createdAt"
        FROM public.sources
        WHERE url IS NOT NULL
        AND ($1::uuid IS NULL OR id <> $1)
        `,
        [excludeSourceId ?? null]
    );

    return sources.find((source: { url: string }) => {
        try {
            return normalizeUrl(source.url) === url;
        } catch {
            return false;
        }
    }) ?? null;
}

export async function getSources(params: GetSourcesParams) {
    const { page, limit, type, q } = params;

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];

    if (type) {
        values.push(type);
        conditions.push(`s.type = $${values.length}`);
    }

    if (q?.trim()) {
        values.push(`%${q.trim()}%`);
        conditions.push(`s.title ILIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await AppDataSource.query(
        `SELECT COUNT(*)::int AS total FROM public.sources s ${whereClause}`,
        values
    );

    const total = countResult[0].total;
    const listValues = [...values, limit, offset];

    const items = await AppDataSource.query(
        `
        SELECT
            s.id, s.type, s.title, s.issuer, s.url,
            s.jurisdiction_id AS "jurisdictionId",
            s.published_at AS "publishedAt",
            s.reviewed_at AS "reviewedAt",
            s.notes, s.visibility,
            s.created_by AS "createdBy",
            s.created_at AS "createdAt"
        FROM public.sources s
        ${whereClause}
        ORDER BY s.created_at DESC
        LIMIT $${listValues.length - 1}
        OFFSET $${listValues.length}
        `,
        listValues
    );

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

export async function createSource(params: CreateSourceParams) {
    const {
        type, title, issuer, url, jurisdictionId,
        publishedAt, notes, visibility = "institution", userId
    } = params;

    const normalizedUrl = url ? normalizeUrl(url) : null;

    return AppDataSource.transaction(async (manager) => {
        if (normalizedUrl) {
            await manager.query(
                `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
                [normalizedUrl]
            );

            const existingSources = await manager.query(
                `
                SELECT
                    id, type, title, issuer, url,
                    jurisdiction_id AS "jurisdictionId",
                    published_at AS "publishedAt",
                    reviewed_at AS "reviewedAt",
                    notes, visibility,
                    created_by AS "createdBy",
                    created_at AS "createdAt"
                FROM public.sources
                WHERE url IS NOT NULL
                `
            );

            const existing = existingSources.find((source: { url: string }) => {
                try {
                    return normalizeUrl(source.url) === normalizedUrl;
                } catch {
                    return false;
                }
            });

            if (existing) {
                return { exists: true as const, source: existing };
            }
        }

        const result = await manager.query(
            `
            INSERT INTO public.sources (
                type, title, issuer, url, jurisdiction_id,
                published_at, notes, visibility, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING
                id, type, title, issuer, url,
                jurisdiction_id AS "jurisdictionId",
                published_at AS "publishedAt",
                reviewed_at AS "reviewedAt",
                notes, visibility,
                created_by AS "createdBy",
                created_at AS "createdAt"
            `,
            [
                type, title, issuer ?? null, url ?? null,
                jurisdictionId ?? null, publishedAt ?? null,
                notes ?? null, visibility, userId
            ]
        );

        return result[0];
    });
}

export async function getSourceById(sourceId: string) {
    const result = await AppDataSource.query(
        `
        SELECT
            id, type, title, issuer, url,
            jurisdiction_id AS "jurisdictionId",
            published_at AS "publishedAt",
            reviewed_at AS "reviewedAt",
            notes, visibility,
            created_by AS "createdBy",
            created_at AS "createdAt"
        FROM public.sources
        WHERE id = $1
        `,
        [sourceId]
    );

    return result[0] ?? null;
}

export async function updateSource(sourceId: string, params: UpdateSourceParams) {
    return AppDataSource.transaction(async (manager) => {
        const current = await manager.query(
            `SELECT id FROM public.sources WHERE id = $1`,
            [sourceId]
        );

        if (current.length === 0) return null;

        if (params.url !== undefined && params.url.trim() !== "") {
            const normalizedUrl = normalizeUrl(params.url);

            await manager.query(
                `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
                [normalizedUrl]
            );

            const existingSources = await manager.query(
                `
                SELECT
                    id, type, title, issuer, url,
                    jurisdiction_id AS "jurisdictionId",
                    published_at AS "publishedAt",
                    reviewed_at AS "reviewedAt",
                    notes, visibility,
                    created_by AS "createdBy",
                    created_at AS "createdAt"
                FROM public.sources
                WHERE url IS NOT NULL AND id <> $1
                `,
                [sourceId]
            );

            const existing = existingSources.find((source: { url: string }) => {
                try {
                    return normalizeUrl(source.url) === normalizedUrl;
                } catch {
                    return false;
                }
            });

            if (existing) {
                return { exists: true as const, source: existing };
            }
        }

        const fields: string[] = [];
        const values: any[] = [sourceId];

        if (params.title !== undefined) {
            values.push(params.title);
            fields.push(`title = $${values.length}`);
        }

        if (params.url !== undefined) {
            values.push(params.url);
            fields.push(`url = $${values.length}`);
        }

        if (params.type !== undefined) {
            values.push(params.type);
            fields.push(`type = $${values.length}`);
        }


        if (fields.length === 0) {
            return getSourceById(sourceId);
        }

        const result = await manager.query(
            `
            UPDATE public.sources
            SET ${fields.join(", ")}
            WHERE id = $1
            RETURNING
                id, type, title, issuer, url,
                jurisdiction_id AS "jurisdictionId",
                published_at AS "publishedAt",
                reviewed_at AS "reviewedAt",
                notes, visibility,
                created_by AS "createdBy",
                created_at AS "createdAt"
            `,
            values
        );

        return result[0] ?? null;
    });
}


export async function deleteSource(sourceId: string) {
    const associations = await AppDataSource.query(
        `
        SELECT 1
        FROM public.model_sources
        WHERE source_id = $1
        LIMIT 1
        `,
        [sourceId]
    );

    if (associations.length > 0) return { inUse: true };

    const result = await AppDataSource.query(
        `DELETE FROM public.sources WHERE id = $1 RETURNING id`,
        [sourceId]
    );

    return { deleted: result.length > 0 };
}
