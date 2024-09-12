import { AppDataSource } from '../database/connection';
import { Group } from '../database/entities/Group.entity';

class GroupService {
  private groupRepository = AppDataSource.getRepository(Group);

  async getAllGroupsIdAndName(): Promise<{ id: number; name: string }[]> {
    return this.groupRepository.find({
      select: ['id', 'name'],
      order: { name: 'ASC' }
    });
  }

  async getGroupById(id: number): Promise<Group | null> {
    return AppDataSource.getRepository(Group).findOneBy({ id });
  };

  async createGroup(groupData: { id: number; name?: string }): Promise<Group> {
    const group = AppDataSource.getRepository(Group).create({
      id: groupData.id,
      name: groupData.name ?? `Group ${groupData.id}` 
    });
    return AppDataSource.getRepository(Group).save(group);
  }
}

export const groupService = new GroupService();