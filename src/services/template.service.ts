import { connection } from '../database/connection';
import { Template } from '../database/entities/Template.entity';
import { generateRandomString } from '../utils/generateRandomString.utils';

class TemplateService {

  async getAllTemplatesIdAndName(): Promise<{ id: number; template: string }[]> {
    const dataSource = await connection();
    const templateRepository = dataSource.getRepository(Template);
    return templateRepository.find({
      select: ['id', 'template'],
      order: { template: 'ASC' }
    });
  }

  async createTemplate(templateString?: string): Promise<Template> {
    const dataSource = await connection();
    const newTemplate = new Template();
    newTemplate.template = templateString || generateRandomString(10);
    return dataSource.getRepository(Template).save(newTemplate);
  }

  async updateTemplate(id: number, templateString: string): Promise<Template> {
    const dataSource = await connection();
    const templateRepository = dataSource.getRepository(Template);

    // Find the template
    const template = await templateRepository.findOneBy({ id });
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }

    // Update the template
    template.template = templateString;
    return templateRepository.save(template);
  }

  async getTemplateById(id: number): Promise<Template | null> {
    const dataSource = await connection();
    return dataSource.getRepository(Template).findOneBy({ id });
  };

  async getFirstTemplate(): Promise<Template | null> {
    const dataSource = await connection();
    return dataSource.getRepository(Template).find({
      take: 1,
    }).then(res => res[0] ?? null);
  }
}

export const templateService = new TemplateService();