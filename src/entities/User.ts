import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "users", schema: "public" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ name: "password_hash", type: "varchar", length: 255, select: false })
    passwordHash!: string;

    @Column({ name: "full_name", type: "varchar", length: 150 })
    fullName!: string;

    @Column({ name: "is_platform_admin", type: "boolean", default: false })
    isPlatformAdmin!: boolean;

    @Column({ name: "is_active", type: "boolean", default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: "created_at", type: "timestamptz", default: () => "now()" })
    createdAt!: Date;
}