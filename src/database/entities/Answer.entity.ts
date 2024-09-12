import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Profile } from "./Profile.entity";
import { Question } from "./Question.entity";
import { Test } from "./Test.entity";

@Entity("answers")
export class Answer {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Test)
    @JoinColumn({ name: "test_id" })
    test: Test;

    @ManyToOne(() => Question)
    @JoinColumn({ name: "question_id" })
    question: Question;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: "profile_id" })
    profile: Profile;

    @Column("text")
    answer: string;

    @Column({ length: 255 })
    user_agent: string;

    @Column({ length: 45 })
    ip: string;

    @Column({
        type: "enum",
        enum: ["copy", "paste", "right click"],
        nullable: true,
    })
    copypaste: "copy" | "paste" | "right click" | null;

    @Column({ type: "boolean", default: false })
    inactive: boolean;

    @Column({ type: "boolean", nullable: true })
    is_correct: boolean | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}