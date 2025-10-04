import { connection } from '../database/connection';
import { Group } from '../database/entities/Group.entity';
import { Profile } from '../database/entities/Profile.entity';
import { Test } from '../database/entities/Test.entity';
import { TestProfile } from '../database/entities/TestProfile.entity';
import { Answer } from '../database/entities/Answer.entity';
import { QuestionTest } from '../database/entities/QuestionTest.entity';
import { generateRandomString } from '../utils/generateRandomString.utils';
import { TrackingConfig } from '../types/tracking';

class TestService {

  async getAllTestsIdAndName(): Promise<{ id: number; name: string }[]> {
    const dataSource = await connection();
    return dataSource.getRepository(Test).find({
      select: ['id', 'name'],
      order: { createdAt: 'DESC' }
    });
  }

  async createTest(data: {
    group_id: number;
    profile_id: number;
    tracking_config?: TrackingConfig;
    test_name?: string;
  }): Promise<Test> {
    const dataSource = await connection();
    const groupRepository = dataSource.getRepository(Group);
    const profileRepository = dataSource.getRepository(Profile);
    const testRepository = dataSource.getRepository(Test);
    const testProfileRepository = dataSource.getRepository(TestProfile);
    const { group_id, profile_id, tracking_config = {}, test_name } = data;

    // Fetch related entities in parallel
    const [group] = await Promise.all([
      groupRepository.findOneOrFail({ where: { id: group_id } }),
      profileRepository.findOneOrFail({ where: { id: profile_id } }),
    ]);

    // Create and save the test
    const test = testRepository.create({
      name: test_name && test_name.trim() !== '' ? test_name : generateRandomString(9),
      groups: [group],
      tracking_config: tracking_config // Use the provided tracking configuration
    });

    const savedTest = await testRepository.save(test);

    // Create the TestProfile relationship
    const testProfile = testProfileRepository.create({
      testId: savedTest.id,
      profileId: profile_id,
      test_start_time: null, // Will be set when first answer is submitted
      assignedAt: new Date() // Explicitly set the assignment date
    });

    await testProfileRepository.save(testProfile);

    return savedTest;
  }

  async getTestById(id: number): Promise<Test | null> {
    const dataSource = await connection();
    return dataSource.getRepository(Test).findOne({ where: { id } });
  }

  async updateTestTrackingConfig(testId: number, trackingConfig: TrackingConfig): Promise<void> {
    const dataSource = await connection();
    const testRepository = dataSource.getRepository(Test);

    await testRepository.update(testId, {
      tracking_config: trackingConfig
    });
  }

  async linkUserAndGroupToTest(profileId: number, groupId: number, test: Test) {
    const dataSource = await connection();
    const testProfileRepository = dataSource.getRepository(TestProfile);

    // Check if relationships already exist by querying the database
    const [existingProfileRelation, existingGroupRelation] = await Promise.all([
      testProfileRepository.findOne({
        where: { testId: test.id, profileId: profileId }
      }),
      dataSource.query(
        'SELECT 1 FROM tests_groups WHERE testId = ? AND groupId = ? LIMIT 1',
        [test.id, groupId]
      )
    ]);

    // Only add relationships that don't already exist
    const operations = [];

    if (!existingProfileRelation) {
      const testProfile = testProfileRepository.create({
        testId: test.id,
        profileId: profileId,
        test_start_time: null,
        assignedAt: new Date() // Explicitly set the assignment date
      });
      operations.push(testProfileRepository.save(testProfile));
    }

    if (existingGroupRelation.length === 0) {
      operations.push(
        dataSource.createQueryBuilder().relation(Test, 'groups').of(test.id).add(groupId)
      );
    }

    if (operations.length > 0) {
      return Promise.all(operations);
    }

    return test;
  }

  async isTestAssignedToUser({linkId, testId}:{linkId: string, testId: number}) {
    const dataSource = await connection();
    const testProfileRepository = dataSource.getRepository(TestProfile);

    // First get the profile by linkId
    const profileRepository = dataSource.getRepository(Profile);
    const profile = await profileRepository.findOne({ where: { link: linkId } });

    if (!profile) {
      return false;
    }

    // Check if TestProfile relationship exists
    const testProfile = await testProfileRepository.findOne({
      where: { testId: testId, profileId: profile.id }
    });

    return !!testProfile;
  }

  async updateTestStartTime(testId: number, profileId: number, startTime: Date) {
    const dataSource = await connection();
    const testProfileRepository = dataSource.getRepository(TestProfile);

    const testProfile = await testProfileRepository.findOne({
      where: { testId, profileId }
    });

    if (testProfile && !testProfile.test_start_time) {
      testProfile.test_start_time = startTime;
      await testProfileRepository.save(testProfile);
    }
  }

  async hasUserCompletedTest(profileId: number, testId: number): Promise<boolean> {
    const dataSource = await connection();

    // Get all questions for this test
    const totalQuestions = await dataSource
      .getRepository(QuestionTest)
      .createQueryBuilder('qt')
      .where('qt.test_id = :testId', { testId })
      .getCount();

    // Get count of answered questions by this user for this test
    const answeredQuestions = await dataSource
      .getRepository(Answer)
      .createQueryBuilder('answer')
      .where('answer.test_id = :testId', { testId })
      .andWhere('answer.profile_id = :profileId', { profileId })
      .getCount();

    // Test is completed if user has answered all questions
    return totalQuestions > 0 && answeredQuestions >= totalQuestions;
  }
}

export const testService = new TestService();