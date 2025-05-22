import { connection } from '../database/connection';
import { Group } from '../database/entities/Group.entity';
import { Profile } from '../database/entities/Profile.entity';
import { Test } from '../database/entities/Test.entity';
import { generateRandomString } from '../utils/generateRandomString.utils';

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
    tracking_config?: Record<string, boolean>;
  }): Promise<Test> {
    const dataSource = await connection();
    const groupRepository = dataSource.getRepository(Group);
    const profileRepository = dataSource.getRepository(Profile);
    const testRepository = dataSource.getRepository(Test);
    const { group_id, profile_id, tracking_config = {} } = data;

    // Fetch related entities in parallel
    const [group, profile] = await Promise.all([
      groupRepository.findOneOrFail({ where: { id: group_id } }),
      profileRepository.findOneOrFail({ where: { id: profile_id } }),
    ]);

    // Create and save the test
    const test = testRepository.create({
      name: generateRandomString(9),
      groups: [group],
      profiles: [profile],
      tracking_config: tracking_config // Use the provided tracking configuration
    });

    return testRepository.save(test);
  }

  async getTestById(id: number): Promise<Test | null> {
    const dataSource = await connection();
    return dataSource.getRepository(Test).findOne({ where: { id }, relations: ['groups', 'profiles'] });
  }

  async linkUserAndGroupToTest(profileId: number, groupId: number, test: Test) {
    const dataSource = await connection();
    return Promise.all([
      test.profiles?.some(profile => profile.id === profileId)
        ? test
        : dataSource.createQueryBuilder().relation(Test, 'profiles').of(test.id).add(profileId),
      test.groups?.some(group => group.id === groupId)
        ? test
        : dataSource.createQueryBuilder().relation(Test, 'groups').of(test.id).add(groupId)
    ]);
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