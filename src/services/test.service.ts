import { connection } from '../database/connection';
import { Group } from '../database/entities/Group.entity';
import { Profile } from '../database/entities/Profile.entity';
import { Test } from '../database/entities/Test.entity';
import { generateRandomString } from '../utils/generateRandomString.utils';
import { TrackingConfig } from '../types/tracking';

class TestService {

  async getAllTestsIdAndName(): Promise<{ id: number; name: string }[]> {
    const dataSource = await connection();
    return dataSource.getRepository(Test).find({
      select: ['id', 'name'],
      order: { name: 'ASC' }
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
    const { group_id, profile_id, tracking_config = {}, test_name } = data;

    // Fetch related entities in parallel
    const [group, profile] = await Promise.all([
      groupRepository.findOneOrFail({ where: { id: group_id } }),
      profileRepository.findOneOrFail({ where: { id: profile_id } }),
    ]);

    // Create and save the test
    const test = testRepository.create({
      name: test_name && test_name.trim() !== '' ? test_name : generateRandomString(9),
      groups: [group],
      profiles: [profile],
      tracking_config: tracking_config // Use the provided tracking configuration
    });

    return testRepository.save(test);
  }

  async getTestById(id: number): Promise<Test | null> {
    const dataSource = await connection();
    return dataSource.getRepository(Test).findOne({ where: { id } });
  }

  async linkUserAndGroupToTest(profileId: number, groupId: number, test: Test) {
    const dataSource = await connection();

    // Check if relationships already exist by querying the database
    const [existingProfileRelation, existingGroupRelation] = await Promise.all([
      dataSource.query(
        'SELECT 1 FROM tests_profiles WHERE testId = ? AND profileId = ? LIMIT 1',
        [test.id, profileId]
      ),
      dataSource.query(
        'SELECT 1 FROM tests_groups WHERE testId = ? AND groupId = ? LIMIT 1',
        [test.id, groupId]
      )
    ]);

    // Only add relationships that don't already exist
    const operations = [];

    if (existingProfileRelation.length === 0) {
      operations.push(
        dataSource.createQueryBuilder().relation(Test, 'profiles').of(test.id).add(profileId)
      );
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
    return dataSource.getRepository(Test).exists({
      relations: ['profiles'],
      where: { id: testId, profiles: { link: linkId }}
    });
  }
}

export const testService = new TestService();