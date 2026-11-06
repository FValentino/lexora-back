import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "categories", schema: "public" })
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "parent_id", type: "uuid", nullable: true })
    parentId!: string | null;

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "varchar", length: 150, unique: true })
    slug!: string;

    @Column({ type: "varchar", length: 20 })
    kind!: "rama" | "tramite" | "tipo";

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;
}