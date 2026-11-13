import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Model } from "./Model.js";
import { Source } from "./Source.js";

@Entity({ name: "model_sources", schema: "public" })
export class ModelSource {
    @PrimaryColumn({ name: "model_id", type: "uuid" })
    modelId!: string;

    @PrimaryColumn({ name: "source_id", type: "uuid" })
    sourceId!: string;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;

    @ManyToOne(() => Model, { onDelete: "CASCADE" })
    @JoinColumn({ name: "model_id" })
    model!: Model;

    @ManyToOne(() => Source, { onDelete: "CASCADE" })
    @JoinColumn({ name: "source_id" })
    source!: Source;
}