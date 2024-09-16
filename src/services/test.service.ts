import { AppDataSource } from '../database/connection';
import { Group } from '../database/entities/Group.entity';
import { Profile } from '../database/entities/Profile.entity';
import { Template } from '../database/entities/Template.entity';
import { Test } from '../database/entities/Test.entity';
import { generateRandomString } from '../utils/generateRandomString.utils';

class TestService {
  private testRepository = AppDataSource.getRepository(Test);
  private groupRepository = AppDataSource.getRepository(Group);
  private profileRepository = AppDataSource.getRepository(Profile);
  private templateRepository = AppDataSource.getRepository(Template);

  async getAllTestsIdAndName(): Promise<{ id: number; name: string }[]> {
    return this.testRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' }
    });
  }

  async createTest(data: { group_id: number; profile_id: number}): Promise<Test> {
    const { group_id, profile_id} = data;

    // Fetch related entities in parallel
    const [group, profile] = await Promise.all([
      this.groupRepository.findOneOrFail({ where: { id: group_id } }),
      this.profileRepository.findOneOrFail({ where: { id: profile_id } }),
    ]);

    // Create and save the test
    const test = this.testRepository.create({
      name: generateRandomString(9),
      groups: [group],
      profiles: [profile],
    });

    return this.testRepository.save({
      name: generateRandomString(9),
      groups: [group],
      profiles: [profile],
    });
  }

  async getTestById(id: number): Promise<Test | null> {
    return AppDataSource.getRepository(Test).findOne({ where: { id }, relations: ['groups', 'profiles'] });
  }

  async linkUserAndGroupToTest(profileId: number, groupId: number, test: Test) {

    return Promise.all([
      test.profiles?.some(profile => profile.id === profileId)
        ? test
        : AppDataSource.createQueryBuilder().relation(Test, 'profiles').of(test.id).add(profileId),
      test.groups?.some(group => group.id === groupId)
        ? test
        : AppDataSource.createQueryBuilder().relation(Test, 'groups').of(test.id).add(groupId)
    ]);
  }
}

export const testService = new TestService();