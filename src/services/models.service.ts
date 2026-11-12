
import { AppDataSource } from "../config/data-source.js";
import { Model } from "../entities/Model.js";

type Visibility = "institution" | "private";

type ReviewStatus =
    | "borrador"
    | "pendiente_revision"
    | "revisado"
    | "requiere_actualizacion";

type ModelSort = "relevance" | "updatedAt" | "createdAt" | "title";

interface GetModelsParams {
    userId: string;
    page: number;
    limit: number;
    q?: string;
    categoryId?: string;
    jurisdictionId?: string;
    reviewStatus?: ReviewStatus;
    visibility?: Visibility;
    sort?: ModelSort;
}

interface CreateModelData {
    title: string;
    slug: string;
    summary: string;
    purpose: string;
    contentMd: string;
    whenToUse?: string | null;
    limitations?: string | null;
    requirements?: string | null;
    documentation?: string | null;
    visibility?: Visibility;
    categoryId?: string | null;
    jurisdictionId?: string | null;
}

interface UpdateModelData {
    title?: string;
    slug?: string;
    summary?: string;
    purpose?: string;
    contentMd?: string;
    whenToUse?: string | null;
    limitations?: string | null;
    requirements?: string | null;
    documentation?: string | null;
    categoryId?: string | null;
    jurisdictionId?: string | null;
}

const modelRepository = AppDataSource.getRepository(Model);

export async function getModels(params: GetModelsParams) {
    const { userId, page, limit, q, categoryId, jurisdictionId, reviewStatus, visibility, sort } = params;

    const query = q?.trim();
    const offset = (page - 1) * limit;

    const conditions: string[] = [
        "(m.visibility = 'institution' OR m.created_by = $1)"
    ];

    const values: any[] = [userId];

    if (visibility === "private") {
        conditions.push("m.visibility = 'private'");
        conditions.push("m.created_by = $1");
    }

    if (visibility === "institution") {
        conditions.push("m.visibility = 'institution'");
    }

    if (reviewStatus) {
        values.push(reviewStatus);
        conditions.push(`m.status = $${values.length}`);
    }

    if (jurisdictionId) {
        values.push(jurisdictionId);
        conditions.push(`m.jurisdiction_id = $${values.length}`);
    }

    if (categoryId) {
        values.push(categoryId);
        conditions.push(`
            m.category_id IN (
                WITH RECURSIVE category_tree AS (
                    SELECT id
                    FROM public.categories
                    WHERE id = $${values.length}

                    UNION ALL

                    SELECT c.id
                    FROM public.categories c
                    INNER JOIN category_tree ct ON c.parent_id = ct.id
                )
                SELECT id FROM category_tree
            )
        `);
    }

    if (query) {
        values.push(query);

        conditions.push(`
            to_tsvector(
                'spanish',
                COALESCE(m.title, '') || ' ' ||
                COALESCE(m.summary, '') || ' ' ||
                COALESCE(m.purpose, '') || ' ' ||
                COALESCE(m.content_md, '')
            ) @@ plainto_tsquery('spanish', $${values.length})
        `);
    }

    const whereClause = conditions.join(" AND ");

    let orderClause = "m.updated_at DESC";

    if (query && (!sort || sort === "relevance")) {
        orderClause = `
            ts_rank(
                to_tsvector(
                    'spanish',
                    COALESCE(m.title, '') || ' ' ||
                    COALESCE(m.summary, '') || ' ' ||
                    COALESCE(m.purpose, '') || ' ' ||
                    COALESCE(m.content_md, '')
                ),
                plainto_tsquery('spanish', $${values.length})
            ) DESC
        `;
    } else if (sort === "createdAt") {
        orderClause = "m.created_at DESC";
    } else if (sort === "title") {
        orderClause = "m.title ASC";
    } else if (sort === "updatedAt") {
        orderClause = "m.updated_at DESC";
    }

    const countQuery = `
        SELECT COUNT(*)::int AS total
        FROM public.models m
        WHERE ${whereClause}
    `;

    const countResult = await AppDataSource.query(countQuery, values);
    const total = countResult[0].total;

    const listValues = [...values, limit, offset];

    const listQuery = `
        SELECT
            m.id,
            m.title,
            m.slug,
            m.summary,
            m.visibility,
            m.category_id,
            m.jurisdiction_id,
            m.status,
            m.created_by,
            m.created_at,
            m.updated_at
        FROM public.models m
        WHERE ${whereClause}
        ORDER BY ${orderClause}
        LIMIT $${listValues.length - 1}
        OFFSET $${listValues.length}
    `;

    const items = await AppDataSource.query(listQuery, listValues);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

export async function getModelById(modelId: string, userId: string) {
    const model = await modelRepository
        .createQueryBuilder("model")
        .where("model.id = :modelId", { modelId })
        .andWhere("(model.visibility = :visibility OR model.createdBy = :userId)", {
            visibility: "institution",
            userId
        })
        .getOne();

    if (!model) {
        throw new Error("MODEL_NOT_FOUND");
    }

    return model;
}

export async function createModel(data: CreateModelData, userId: string) {
    try {
        const model = modelRepository.create({
            ...data,
            createdBy: userId,
            visibility: data.visibility ?? "institution"
        });

        return await modelRepository.save(model);
    } catch (error: any) {
        if (error.driverError?.code === "23505") {
            throw new Error("MODEL_SLUG_ALREADY_EXISTS");
        }

        if (error.driverError?.code === "23503") {
            throw new Error("MODEL_REFERENCE_NOT_FOUND");
        }

        throw error;
    }
}

export async function updateModel(modelId: string, data: UpdateModelData, userId: string, isPlatformAdmin: boolean) {
    const model = await modelRepository.findOneBy({ id: modelId });

    if (!model) {
        throw new Error("MODEL_NOT_FOUND");
    }

    if (model.createdBy !== userId && !isPlatformAdmin) {
        throw new Error("MODEL_FORBIDDEN");
    }

    try {
        modelRepository.merge(model, data);
        return await modelRepository.save(model);
    } catch (error: any) {
        if (error.driverError?.code === "23505") {
            throw new Error("MODEL_SLUG_ALREADY_EXISTS");
        }

        if (error.driverError?.code === "23503") {
            throw new Error("MODEL_REFERENCE_NOT_FOUND");
        }

        throw error;
    }
}

export async function updateModelVisibility(modelId: string, visibility: Visibility, userId: string, isPlatformAdmin: boolean) {
    const model = await modelRepository.findOneBy({ id: modelId });

    if (!model) {
        throw new Error("MODEL_NOT_FOUND");
    }

    if (model.createdBy !== userId && !isPlatformAdmin) {
        throw new Error("MODEL_FORBIDDEN");
    }

    model.visibility = visibility;

    return await modelRepository.save(model);
}

export async function reviewModel(modelId: string, reviewStatus: ReviewStatus, userId: string, isPlatformAdmin: boolean) {
    const model = await modelRepository.findOneBy({ id: modelId });

    if (!model) {
        throw new Error("MODEL_NOT_FOUND");
    }

    if (model.createdBy !== userId && !isPlatformAdmin) {
        throw new Error("MODEL_FORBIDDEN");
    }

    model.status = reviewStatus;

    if (reviewStatus === "revisado") {
        model.reviewedAt = new Date();
        model.reviewedBy = userId;
    } else {
        model.reviewedAt = null;
        model.reviewedBy = null;
    }

    return await modelRepository.save(model);
}
