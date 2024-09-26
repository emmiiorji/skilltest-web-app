import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connection } from '../database/connection';
import { profileService } from '../services/profile.service';

export function profileController(app: FastifyInstance, opts: any, done: () => void) {
  app.get('/list', async (request, reply) => {
    const {key, page} = z.object({key: z.string(), page: z.coerce.number().optional().default(1)}).parse(request.query);
    const limit = 10; // Profiles per page

    try {
      const { profiles, totalPages, currentPage } = await profileService.getProfiles(page, limit);
      return reply.view('admin/profile/list', {
        title: 'View Profiles',
        profiles,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        url: request.url,
        key
      });
    } catch (error) {
      request.log.error(error, "Error fetching profiles");
      reply.view('admin/profile/list', {
        title: 'View Profiles',
        error: 'Failed to fetch profiles. Please try again.',
        url: request.url,
        key
      });
    }
  });

  app.get('/view', async (request, reply) => {
    const {id: profileLinkId, key} = z.object({id: z.string(), key: z.string()}).parse(request.query);
    const db = await connection();
    
    const result: {
      id: number;
      name: string;
      country: string;
      hourlyRate: number;
      lastActivity: Date;
      url: string;
      testResults: Array<{
        test_id: number;
        test_name: string;
        answers: Array<{
          question: string;
          answer: string;
          timeTaken: number;
          copyPaste: number;
          inactive: number;
          isCorrect: boolean;
        }>;
        attended_at: Date;
      }>;
    }[] = await db.query(`
      -- Main query to fetch profile details and test results
      SELECT
        p.id,
        p.name, 
        p.country, 
        p.rate AS hourlyRate, 
        p.lastActivity,
        p.url,
        -- Use COALESCE to return an empty JSON array if no test results are found
        COALESCE(
          -- Aggregate test results into a JSON array, grouped by test_id
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'test_id', test_id,
              'test_name', test_name,
              'answers', answers,
              'attended_at', attended_at
            )
          ),
          JSON_ARRAY()
        ) AS testResults
      FROM profile p
      -- Left join with a subquery that groups answers by test_id
      LEFT JOIN (
        SELECT 
          a.profile_id,
          a.test_id,
          t.name AS test_name,
          MAX(a.created_at) AS attended_at,
          -- Aggregate answers for each test into a JSON array
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'question', q.question,
              'answer', a.answer,
              'timeTaken', a.time_taken,
              'copyPaste', a.paste_count + a.copy_count + a.right_click_count,
              'inactive', a.inactive_time,
              'isCorrect', a.is_correct
            )
          ) AS answers
        FROM answers a
        -- Join with questions to get question text
        JOIN questions q ON a.question_id = q.id
        -- Join with tests to get test name
        JOIN tests t ON a.test_id = t.id
        -- Group by profile_id and test_id to aggregate answers for each test
        GROUP BY a.profile_id, a.test_id, t.name
      ) AS grouped_answers ON p.id = grouped_answers.profile_id
      -- Filter by the profile's link ID
      WHERE p.link = ?
      -- Group by profile id to aggregate all test results for the profile
      GROUP BY p.id
    `, [profileLinkId]);
    
    if (!result[0]) {
      return reply.status(404).send({ error: 'Profile not found' });
    }

    const {testResults, ...profile} = result[0];

    return reply.view('admin/profile/view', {
      title: 'View Profile',
      profile,
      testResults,
      key
    });
  });

  done();
}