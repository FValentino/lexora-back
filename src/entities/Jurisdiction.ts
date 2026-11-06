import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "jurisdictions", schema: "public" })
export class Jurisdiction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 150 })
    name!: string;

    @Column({ type: "varchar", length: 50 })
    scope!: "provincial" | "nacional" | "federal";

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;
}