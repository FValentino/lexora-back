
import { AppDataSource } from "../config/data-source.js";
import { Category } from "../entities/Category.js";

interface CreateCategoryData {
    name: string;
    slug: string;
    kind: "rama" | "tramite" | "tipo";
    parentId?: string | null;
}

interface UpdateCategoryData {
    name?: string;
    position?: number;
}

const categoryRepository = AppDataSource.getRepository(Category);


export async function getCategories(parentId?: string, tree: boolean = false) {
    const categories = await categoryRepository.find({
        order: {
            name: "ASC"
        }
    });

    if (tree) {
        return buildCategoryTree(categories);
    }

    if (parentId) {
        return categories.filter(category => category.parentId === parentId);
    }

    return categories;
}



export function buildCategoryTree(categories: Category[], parentId: string | null = null): any[] {
    return categories
        .filter(category => category.parentId === parentId)
        .map(category => ({
            ...category,
            children: buildCategoryTree(categories, category.id)
        }));
}



export async function createCategory(data: CreateCategoryData) {
    let depth = 1;

    if (data.parentId) {
        const parent = await categoryRepository.findOneBy({
            id: data.parentId
        });

        if (!parent) {
            throw new Error("CATEGORY_PARENT_NOT_FOUND");
        }

        depth = 2;

        let currentParent = parent;

        while (currentParent.parentId) {
            const nextParent = await categoryRepository.findOneBy({
                id: currentParent.parentId
            });

            if (!nextParent) {
                break;
            }

            currentParent = nextParent;
            depth++;
        }
    }

    if (depth > 3) {
        throw new Error("MAX_DEPTH_EXCEEDED");
    }

    try {
        const category = categoryRepository.create({
            name: data.name,
            slug: data.slug,
            kind: data.kind,
            parentId: data.parentId ?? null
        });

        return await categoryRepository.save(category);
    } catch (error: any) {
        if (error.driverError?.code === "23505") {
            throw new Error("CATEGORY_SLUG_ALREADY_EXISTS");
        }

        if (error.driverError?.code === "23503") {
            throw new Error("CATEGORY_PARENT_NOT_FOUND");
        }

        throw error;
    }
}



export async function updateCategory(categoryId: string, data: UpdateCategoryData) {
    const category = await categoryRepository.findOneBy({
        id: categoryId
    });

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    if (data.name !== undefined) {
        category.name = data.name;
    }

    try {
        return await categoryRepository.save(category);
    } catch (error: any) {
        if (error.driverError?.code === "23505") {
            throw new Error("CATEGORY_NAME_ALREADY_EXISTS");
        }

        throw error;
    }
}
