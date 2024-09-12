import { AppDataSource } from '../database/connection';
import { Template } from '../database/entities/Template.entity';
import { generateRandomString } from '../utils/generateRandomString.utils';

class TemplateService {
  private templateRepository = AppDataSource.getRepository(Template);

  async getAllTemplatesIdAndName(): Promise<{ id: number; template: string }[]> {
    return this.templateRepository.find({
      select: ['id', 'template'],
      order: { template: 'ASC' }
    });
  }

  async createTemplate(): Promise<Template> {
    const newTemplate = new Template();
    newTemplate.template = generateRandomString(10);
    return this.templateRepository.save(newTemplate);
  }

  async getTemplateById(id: number): Promise<Template | null> {
    return this.templateRepository.findOneBy({ id });
  };

  async getFirstTemplate(): Promise<Template | null> {
    return AppDataSource.getRepository(Template).find({
      take: 1,
    }).then(res => res[0] ?? null);
  }
}

export const templateService = new TemplateService();