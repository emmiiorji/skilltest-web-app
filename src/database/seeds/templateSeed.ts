import { AppDataSource } from "../connection";
import { Template } from "../entities/Template.entity";

export async function seedTemplates() {
  const templateRepository = AppDataSource.getRepository(Template);

  const templateData = {
    template: `<html><head><style id="HighlightThisStyles"></style></head><body><text>Hi,</text><br>Thank you for your interest! <br>As the first step of the interview for this project, we offer to do a quick skill test that should not take more than 10 min. <br>Please open this link ON DESKTOP: <a href={url}>{url}</a> and follow instructions.
<br>Let me know if you have any questions.</body></html>`,
  };

  const template = templateRepository.create(templateData);
  await templateRepository.save(template);

  console.info("Template seeded successfully");
}