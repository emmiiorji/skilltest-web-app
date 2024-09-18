import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Answer } from "./Answer.entity";
import { QuestionTest } from "./QuestionTest.entity";

@Entity("questions")
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    question: string;

    @Column({
        type: "enum",
        enum: ["textarea", "radiobutton", "multiinput", "multiTextInput"],
    })
    answer_type: "textarea" | "radiobutton" | "multiinput" | "multiTextInput";

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

    @OneToMany(() => QuestionTest, questionTest => questionTest.question)
    questionTests: QuestionTest[];
}