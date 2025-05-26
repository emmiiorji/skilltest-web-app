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

    // First, get the profile information
    const profileResult = await db.query(`
      SELECT
        p.id,
        p.name,
        p.email,
        p.country,
        p.title,
        p.description,
        p.rate AS hourlyRate,
        p.totalHours,
        p.skills,
        p.lastActivity,
        p.url,
        p.link
      FROM profile p
      WHERE p.link = ?
    `, [profileLinkId]);

    if (!profileResult[0]) {
      return reply.status(404).send({ error: 'Profile not found' });
    }

    const profile = profileResult[0];

    // Add link property if it's missing
    if (!profile.link) {
      profile.link = profileLinkId;
    }

    // Get all tests associated with this profile
    const testsResult = await db.query(`
      SELECT
        t.id AS test_id,
        t.name AS test_name,
        MAX(a.created_at) AS attended_at
      FROM tests t
      JOIN tests_profiles tp ON t.id = tp.testId
      LEFT JOIN answers a ON t.id = a.test_id AND a.profile_id = ?
      WHERE tp.profileId = ?
      GROUP BY t.id, t.name
    `, [profile.id, profile.id]);

    // For each test, get the answers
    const testResults = [];

    for (const test of testsResult) {
      const answersResult = await db.query(`
        SELECT
          q.question,
          a.answer,
          a.time_taken AS timeTaken,
          (a.paste_count + a.copy_count + a.right_click_count) AS copyPaste,
          a.inactive_time AS inactive,
          a.is_correct AS isCorrect,
          a.focus_lost_events AS focusLostEvents,
          a.clipboard_events AS clipboardEvents,
          a.pre_submit_delay AS preSubmitDelay,
          a.answer_change_events AS answerChangeEvents,
          a.device_fingerprint AS deviceFingerprint,
          a.device_type AS deviceType,
          a.time_to_first_interaction AS timeToFirstInteraction,
          a.mouse_click_events AS mouseClickEvents,
          a.keyboard_press_events AS keyboardPressEvents
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.test_id = ? AND a.profile_id = ?
      `, [test.test_id, profile.id]);

      // Process the answers to ensure JSON fields are properly parsed
      const processedAnswers = answersResult.map((answer: any) => {
        try {
          return {
            ...answer,
            // Parse JSON fields if they're strings
            focusLostEvents: typeof answer.focusLostEvents === 'string' ?
              JSON.parse(answer.focusLostEvents) : (answer.focusLostEvents || []),
            clipboardEvents: typeof answer.clipboardEvents === 'string' ?
              JSON.parse(answer.clipboardEvents) : (answer.clipboardEvents || []),
            answerChangeEvents: typeof answer.answerChangeEvents === 'string' ?
              JSON.parse(answer.answerChangeEvents) : (answer.answerChangeEvents || []),
            deviceFingerprint: typeof answer.deviceFingerprint === 'string' ?
              JSON.parse(answer.deviceFingerprint) : (answer.deviceFingerprint || {}),
            mouseClickEvents: typeof answer.mouseClickEvents === 'string' ?
              JSON.parse(answer.mouseClickEvents) : (answer.mouseClickEvents || []),
            keyboardPressEvents: typeof answer.keyboardPressEvents === 'string' ?
              JSON.parse(answer.keyboardPressEvents) : (answer.keyboardPressEvents || [])
          };
        } catch (error) {
          console.error('Error parsing JSON fields:', error);
          return answer; // Return original if parsing fails
        }
      });

      if (answersResult.length > 0) {
        testResults.push({
          test_id: test.test_id,
          test_name: test.test_name,
          answers: processedAnswers, // Use processed answers with parsed JSON
          attended_at: test.attended_at
        });
      } else {
        // Include tests even if they have no answers yet
        testResults.push({
          test_id: test.test_id,
          test_name: test.test_name,
          answers: [],
          attended_at: null
        });
      }
    }

    return reply.view('admin/profile/view', {
      title: profile.name,
      profile,
      profileLinkId, // Pass the original link ID from the URL
      testResults,
      key,
      url: request.url
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
        title: z.string().optional(),
        description: z.string().optional(),
        skills: z.string().optional(),
        totalHours: z.coerce.number().optional(),
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
