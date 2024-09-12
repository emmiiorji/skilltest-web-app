import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Answer } from "./Answer.entity";

@Entity("questions")
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    question: string;

    @Column({
        type: "enum",
        enum: ["textarea", "radiobutton", "multiinput"],
    })
    answer_type: "textarea" | "radiobutton" | "multiinput";

    @Column("text")
    answer_html: string;

    @Column("text")
    correct: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Answer, answer => answer.question)
    answers: Answer[];
}