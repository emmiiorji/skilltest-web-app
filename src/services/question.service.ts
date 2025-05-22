import { connection } from '../database/connection';
import { Question } from '../database/entities/Question.entity';
import { QuestionTest } from '../database/entities/QuestionTest.entity';
import { Test } from '../database/entities/Test.entity';

interface CreateQuestionData {
  question: string;
  answer_type: "textarea" | "radiobutton" | "multiinput" | "multiTextInput";
  answer_html: string;
  correct: string;
}

class QuestionService {
  async createQuestion(data: CreateQuestionData): Promise<Question> {
    const dataSource = await connection();
    const questionRepository = dataSource.getRepository(Question);
    
    const question = questionRepository.create(data);
    return questionRepository.save(question);
  }

  async getQuestionById(id: number): Promise<Question | null> {
    const dataSource = await connection();
    return dataSource.getRepository(Question).findOneBy({ id });
  }

  async getAllQuestions(): Promise<Question[]> {
    const dataSource = await connection();
    return dataSource.getRepository(Question).find({
      order: { created_at: 'DESC' }
    });
  }

  async addQuestionToTest(questionId: number, testId: number, priority: number = 1): Promise<void> {
    const dataSource = await connection();
    const questionTestRepository = dataSource.getRepository(QuestionTest);
    
    // Check if the association already exists
    const existingAssociation = await questionTestRepository.findOneBy({
      question_id: questionId,
      test_id: testId
    });

    if (!existingAssociation) {
      // Create new association
      const questionTest = questionTestRepository.create({
        question_id: questionId,
        test_id: testId,
        priority
      });
      await questionTestRepository.save(questionTest);
    }
  }

  async getQuestionsForTest(testId: number): Promise<Question[]> {
    const dataSource = await connection();
    
    return dataSource
      .getRepository(Question)
      .createQueryBuilder('question')
      .innerJoin('question.questionTests', 'qt')
      .where('qt.test_id = :testId', { testId })
      .orderBy('qt.priority', 'ASC')
      .getMany();
  }

  async removeQuestionFromTest(questionId: number, testId: number): Promise<void> {
    const dataSource = await connection();
    await dataSource
      .getRepository(QuestionTest)
      .delete({ question_id: questionId, test_id: testId });
  }
}

export const questionService = new QuestionService();
