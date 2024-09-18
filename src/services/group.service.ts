import { connection } from '../database/connection';
import { Group } from '../database/entities/Group.entity';

class GroupService {

  async getAllGroupsIdAndName(): Promise<{ id: number; name: string }[]> {
    const dataSource = await connection();
    return dataSource.getRepository(Group).find({
      select: ['id', 'name'],
      order: { name: 'ASC' }
    });
  }

  async getGroupById(id: number): Promise<Group | null> {
    const dataSource = await connection();
    return dataSource.getRepository(Group).findOneBy({ id });
  };

  async createGroup(groupData: { id: number; name?: string }): Promise<Group> {
    const dataSource = await connection();
    const group = dataSource.getRepository(Group).create({
      id: groupData.id,
      name: groupData.name ?? `Group ${groupData.id}` 
    });
    return dataSource.getRepository(Group).save(group);
  }
}

export const groupService = new GroupService();