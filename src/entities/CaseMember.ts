import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "case_members", schema: "public" })
export class CaseMember {
    @PrimaryColumn({ name: "case_id", type: "uuid" })
    caseId!: string;

    @PrimaryColumn({ name: "user_id", type: "uuid" })
    userId!: string;

    @Column({ name: "member_role", type: "varchar", length: 20 })
    memberRole!: "owner" | "collaborator";

    @Column({ name: "added_by", type: "uuid" })
    addedBy!: string;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;
}