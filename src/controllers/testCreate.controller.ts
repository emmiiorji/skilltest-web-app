import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { templateService } from '../services/template.service';
import { testService } from '../services/test.service';
import { profileService } from '../services/profile.service';
import { groupService } from '../services/group.service';
import { env } from '../env.config';

export function testCreateController(app: FastifyInstance, opts: any, done: () => void) {
  
  app.get('/create', async (request, reply) => {
    const templates = await templateService.getAllTemplatesIdAndName();

    const { key } = z.object({
      key: z.string(),
    }).parse(request.query);
    
    return reply.view('admin/test/create', {
      title: 'Create Test',
      templates,
      key,
      url: request.url
    });
  });

  app.post('/create-link', async (request, reply) => {
    const { template_id, freelancer_input, group_id } = z.object({
      template_id: z.string(),
      freelancer_input: z.string(),
      group_id: z.string(),
    }).parse(request.body);
    
    // Parse freelancer ID from input
    let freelancerId = freelancer_input;
    if (freelancer_input.includes('upwork.com')) {
      const match = freelancer_input.match(/~([a-zA-Z0-9]+)/);
      freelancerId = match && match[1] ? match[1] : freelancer_input;
    }
    
    // Create test
    const profile = await profileService.getProfileByLinkId(freelancerId);
    if (!profile) {
      return reply.status(404).send({ error: 'Profile not found' });
    }
    
    const test = await testService.createTest({ 
      group_id: parseInt(group_id), 
      profile_id: profile.id 
    });
    
    // Generate link
    const template = await templateService.getTemplateById(parseInt(template_id));
    const testUrl = `${env.URL}/test/attend?user=${freelancerId}&test=${test.id}`;
    const message = template?.template.replace(/{url}|{link}/g, testUrl);
    
    return reply.send({ 
      success: true, 
      message,
      freelancerId,
      testUrl 
    });
  });

  done();
}