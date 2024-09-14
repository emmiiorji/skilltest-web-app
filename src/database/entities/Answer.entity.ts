import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { AnswerInput } from "../validators/answer.validation";
import { Profile } from "./Profile.entity";
import { Question } from "./Question.entity";
import { Test } from "./Test.entity";

@Entity("answers")
export class Answer implements AnswerInput {
    @PrimaryGeneratedColumn()
    id: number;

    @RelationId("test")
    @Column()
    test_id: number;

    @ManyToOne(() => Test)
    @JoinColumn({ name: "test_id" })
    test: Test;

    @RelationId("question")
    @Column()
    question_id: number;

    @ManyToOne(() => Question)
    @JoinColumn({ name: "question_id" })
    question: Question;

    @RelationId("profile")
    @Column()
    profile_id: number;

    @ManyToOne(() => Profile)
    @JoinColumn({ name: "profile_id" })
    profile: Profile;

    @Column("text")
    answer: string;

    @Column({ length: 255 })
    user_agent: string;

    @Column({ length: 45 })
    ip: string;

    @Column()
    time_taken: number;

    @Column()
    copy_count: number

    @Column()
    paste_count: number;

    @Column()
    right_click_count: number;

    @Column()
    inactive_time: number;

    @Column({ type: "boolean", nullable: true })
    is_correct: boolean | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}