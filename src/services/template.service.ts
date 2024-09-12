import { AppDataSource } from '../database/connection';
import { Template } from '../database/entities/Template';
import { generateRandomString } from '../utils/helpers';

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
}

export const templateService = new TemplateService();