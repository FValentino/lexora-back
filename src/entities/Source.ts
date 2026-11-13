import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "sources", schema: "public" })
export class Source {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 30 })
    type!: string;

    @Column({ type: "varchar", length: 300 })
    title!: string;

    @Column({ type: "varchar", length: 200, nullable: true })
    issuer!: string | null;

    @Column({ type: "text", nullable: true })
    url!: string | null;

    @Column({ name: "jurisdiction_id", type: "uuid", nullable: true })
    jurisdictionId!: string | null;

    @Column({ name: "published_at", type: "date", nullable: true })
    publishedAt!: Date | null;

    @Column({ name: "reviewed_at", type: "timestamptz", nullable: true })
    reviewedAt!: Date | null;

    @Column({ type: "text", nullable: true })
    notes!: string | null;

    @Column({ type: "varchar", length: 20, default: "institution" })
    visibility!: string;

    @Column({ name: "created_by", type: "uuid" })
    createdBy!: string;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;
}