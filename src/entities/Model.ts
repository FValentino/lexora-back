import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "models", schema: "public" })
export class Model {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 200 })
    title!: string;

    @Column({ type: "varchar", length: 220, unique: true })
    slug!: string;

    @Column({ type: "text" })
    summary!: string;

    @Column({ type: "text" })
    purpose!: string;

    @Column({ name: "when_to_use", type: "text", nullable: true })
    whenToUse!: string | null;

    @Column({ type: "text", nullable: true })
    limitations!: string | null;

    @Column({ type: "text", nullable: true })
    requirements!: string | null;

    @Column({ type: "text", nullable: true })
    documentation!: string | null;

    @Column({ name: "content_md", type: "text" })
    contentMd!: string;

    @Column({ type: "varchar", length: 20, default: "institution" })
    visibility!: "institution" | "private";

    @Column({ name: "category_id", type: "uuid", nullable: true })
    categoryId!: string | null;

    @Column({ name: "jurisdiction_id", type: "uuid", nullable: true })
    jurisdictionId!: string | null;

    @Column({
        type: "varchar",
        length: 30,
        default: "borrador"
    })
    status!: "borrador" | "pendiente_revision" | "revisado" | "requiere_actualizacion";

    @Column({ name: "reviewed_at", type: "timestamptz", nullable: true })
    reviewedAt!: Date | null;

    @Column({ name: "reviewed_by", type: "uuid", nullable: true })
    reviewedBy!: string | null;

    @Column({ name: "created_by", type: "uuid" })
    createdBy!: string;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt!: Date;
    
}