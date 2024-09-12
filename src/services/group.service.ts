import { AppDataSource } from '../database/connection';
import { Group } from '../database/entities/Group';
import { generateRandomString } from '../utils/helpers';

class GroupService {
  private groupRepository = AppDataSource.getRepository(Group);

  async getAllGroupsIdAndName(): Promise<{ id: number; name: string }[]> {
    return this.groupRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' }
    });
  }

  async createGroup(): Promise<Group> {
    const newGroup = this.groupRepository.create({
      name: generateRandomString(8) // Generate a random 8-character string
    });
    return this.groupRepository.save(newGroup);
  }
}

export const groupService = new GroupService();