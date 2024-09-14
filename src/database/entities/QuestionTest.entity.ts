import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { Question } from "./Question.entity";
import { Test } from "./Test.entity";

@Entity("questions_tests")
export class QuestionTest {
    @RelationId("question")
    @PrimaryColumn()
    question_id: number;

    @RelationId("test")
    @PrimaryColumn()
    test_id: number;

    @Column()
    priority: number;

    @ManyToOne(() => Question, question => question.questionTests, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "question_id" })
    question: Question;

    @ManyToOne(() => Test, test => test.questionTests, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "test_id" })
    test: Test;
}