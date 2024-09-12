import { AppDataSource } from '../database/connection';
import { Group } from '../database/entities/Group';
import { Profile } from '../database/entities/Profile';
import { Template } from '../database/entities/Template';
import { Test } from '../database/entities/Test';
import { generateRandomString } from '../utils/helpers';

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

  async createTest(data: { group_id: number; profile_id: number; template_id: number }): Promise<Test> {
    const { group_id, profile_id, template_id } = data;

    // Fetch related entities in parallel
    const [group, profile, template] = await Promise.all([
      this.groupRepository.findOneOrFail({ where: { id: group_id } }),
      this.profileRepository.findOneOrFail({ where: { id: profile_id } }),
      this.templateRepository.findOneOrFail({ where: { id: template_id } })
    ]);

    // Create and save the test
    const test = this.testRepository.create({
      name: generateRandomString(9),
      groups: [group],
      profiles: [profile],
      templates: [template]
    });

    return this.testRepository.save({
      name: generateRandomString(9),
      groups: [group],
      profiles: [profile],
      templates: [template]
    });
  }
}

export const testService = new TestService();