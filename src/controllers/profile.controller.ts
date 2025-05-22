import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { connection } from '../database/connection';
import { profileService } from '../services/profile.service';
import { groupService } from '../services/group.service';
import { ProfileInput } from '../database/validators/profile.validator';

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
      FROM profiles p
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
      title: profile.name,
      profile,
      testResults,
      key
    });
  });

  // Show profile creation form
  app.get('/create', async (request, reply) => {
    try {
      const { key } = z.object({
        key: z.string(),
      }).parse(request.query);

      // Get all groups for the dropdown
      const groups = await groupService.getAllGroupsIdAndName();

      return reply.view('admin/profile/create', {
        title: 'Create Profile',
        groups,
        key,
        url: request.url
      });
    } catch (error) {
      request.log.error(error, "Error loading profile creation form");
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Create a new profile
  app.post('/create', async (request, reply) => {
    try {
      // Validate the key parameter (for authentication)
      z.object({
        key: z.string(),
      }).parse(request.query);

      const profileData = z.object({
        link: z.string().min(1, "Link ID is required"),
        name: z.string().optional(),
        email: z.string().email().optional(),
        country: z.string().optional(),
        rate: z.coerce.number().optional(),
        url: z.string().optional(),
        group_id: z.coerce.number()
      }).parse(request.body);

      // Extract group_id and create profile data object
      const { group_id, ...profileInput } = profileData;

      // Create the profile
      const profile = await profileService.createProfile(profileInput as ProfileInput, group_id);

      return reply.send({
        success: true,
        profile
      });
    } catch (error) {
      request.log.error(error, "Error creating profile");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({
        success: false,
        error: errorMessage
      });
    }
  });

  // Create a profile via AJAX (for quick creation from test form)
  app.post('/create-ajax', async (request, reply) => {
    try {
      // Generate a random ID for the profile
      const randomId = Math.random().toString(36).substring(2, 10);
      const profile = await profileService.createProfileByLinkId(randomId);

      return reply.send({
        success: true,
        profile
      });
    } catch (error) {
      request.log.error(error, "Error creating profile via AJAX");
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return reply.status(400).send({
        success: false,
        error: errorMessage
      });
    }
  });

  done();
}
