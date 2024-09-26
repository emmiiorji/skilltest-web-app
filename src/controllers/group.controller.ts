import { FastifyInstance } from "fastify";
import { z } from "zod";
import { connection } from "../database/connection";
import { Group } from "../database/entities/Group.entity";

export function groupController(app: FastifyInstance, opts: any, done: () => void) {

  app.get("/list", async (request, reply) => {
    const { key } = z.object({
      key: z.string(),
    }).parse(request.query);
    const dataSource = await connection();
    // Optimized SQL query to fetch all required data in a single operation
    const groups: {
      id: number;
      name: string;
      createdAt: Date;
      profile_count: number;
      profile_countries: string;
      test_ids: string;
    }[] = await dataSource.query(`
      -- We start with the main 'groups' table to get basic group info.
      SELECT 
        g.id,
        g.name,
        g.createdAt,
        -- For each group, we use subqueries to fetch additional data:
        -- Subquery to count profiles for each group (using profiles_groups join table)
        (SELECT COUNT(*) FROM profiles_groups pg WHERE pg.groupId = g.id) as profile_count,
        -- Subquery to get unique, comma-separated countries for each group (using profile and profiles_groups tables)
        -- We use GROUP_CONCAT to concatenate countries and test IDs, as STRING_AGG is not available in MySQL 5.7.
        COALESCE(
          (SELECT GROUP_CONCAT(DISTINCT p.country ORDER BY p.country SEPARATOR ', ')
           FROM profile p
           JOIN profiles_groups pg ON p.id = pg.profileId
           WHERE pg.groupId = g.id),
          ''
        ) as profile_countries,
        -- Subquery to get comma-separated test IDs for each group (using tests and tests_groups tables)
        COALESCE(
          (SELECT GROUP_CONCAT(t.id ORDER BY t.id SEPARATOR ', ')
           FROM tests t
           JOIN tests_groups tg ON t.id = tg.testId
           WHERE tg.groupId = g.id),
          ''
        ) as test_ids
      FROM groups g
      -- The result is ordered by creation date descending
      ORDER BY g.createdAt DESC
    `);

    return reply.view("/admin/group/list", {
      title: "All Groups",
      groups,
      url: request.url,
      key,
    });
  });

  app.post("/create", async (request, reply) => {
    try {
      const dataSource = await connection();
      const groupRepo = dataSource.getRepository(Group);
      const { group_id: id, group_name: name } = z.object({
        group_id: z.coerce.number(),
        group_name: z.string(),
      }).parse(request.body);
      const newGroup = groupRepo.create({ id, name });
      await groupRepo.insert(newGroup);
      return reply.status(200).send({ success: true, message: "Group created successfully" });
    } catch (error) {
      console.error("Error creating group:", error);
      return reply.status(400).send({ 
        success: false, 
        message: error instanceof Error ? error.message : "An error occurred while creating the group" 
      });
    }
  });

  app.get("/test_result", async (request, reply) => {
    const result = z.object({
      group_id: z.coerce.number(),
      sort: z.enum(['date', 'pass', 'date,pass', 'pass,date']),
      test: z.coerce.number().optional(),
      key: z.string(),
    }).safeParse(request.query);

    let groupId: number;
    let validSort: string;
    let orderBy: string;
    let testId: number | undefined;
    let key: string;

    if (result.success) {
      groupId = result.data.group_id;
      validSort = result.data.sort;
      testId = result.data.test;
      key = result.data.key;
    } else if (result.error.issues.some(issue => issue.path.includes('sort'))) {
      const parsedQuery = z.object({
        group_id: z.coerce.number(),
        test: z.coerce.number().optional(),
        key: z.string(),
      }).parse(request.query);
      groupId = parsedQuery.group_id;
      testId = parsedQuery.test;
      key = parsedQuery.key;
      // Redirect to the test result page with the default sort order
      return reply.redirect(`/admin/group/test_result?group_id=${groupId}&key=${key}&sort=date,pass${testId ? `&test_id=${testId}` : ''}`);
    } else {
      throw result.error;
    }

    // SQL query to get the test results with proper sorting.
    switch(validSort) {
      case 'date':
        orderBy = 'completion_date DESC';
        break;
      case 'pass':
        orderBy = 'correct_answers DESC';
        break;
      case 'pass,date':
        orderBy = 'correct_answers DESC, completion_date DESC';
        break;
      default:
        orderBy = 'completion_date DESC, correct_answers DESC';
    }
    
    const dataSource = await connection();
    const testResults = await dataSource.query(`
      SELECT 
        -- Basic user information
        p.link AS user_link_id,
        p.name AS user_name,
        p.country,
        -- Count of correct answers for this user in this group
        COUNT(CASE WHEN ta.is_correct = 1 THEN 1 END) AS correct_answers,
        -- Total number of answers for this user in this group
        COUNT(ta.id) AS total_answers,
        -- Detailed information about each question answered
        GROUP_CONCAT(
          CONCAT(
            ta.question_id,
            '(',
            ta.time_taken,
            ',',
            ta.inactive_time,
            ',',
            ta.copy_count + ta.paste_count + ta.right_click_count,
            ')'
          )
          ORDER BY ta.question_id
          SEPARATOR ', '
        ) AS question_details,
        -- The latest answer date, considered as the completion date
        MAX(ta.created_at) AS completion_date
      FROM profile p
      -- Join to get all profiles in the specified group
      JOIN profiles_groups pg ON p.id = pg.profileId
      -- Join to get all answers for these profiles
      JOIN answers ta ON p.id = ta.profile_id
      -- Filter for the specific group
      WHERE pg.groupId = ?
      ${testId ? 'AND ta.test_id = ?' : ''}
      -- Group results by user
      GROUP BY p.id, p.name, p.country
      ORDER BY ${orderBy}
    `, testId ? [groupId, testId] : [groupId]);

    return reply.view("/admin/group/test_result", {
      title: "Test Results",
      testResults,
      url: request.url,
      currentSort: validSort,
      groupId,
      testId,
      key,
    });
  });

  app.get("/detailed_result", async (request, reply) => {
    const { group_id, test: test_id, key } = z.object({
      group_id: z.coerce.number(),
      test: z.coerce.number().optional(),
      key: z.string(),
    }).parse(request.query);

    const dataSource = await connection();
    const detailedResults: {
      profile_id: number;
      profile_name: string;
      country: string;
      hourly_rate: number;
      link_id: string;
      url: string | null;
      last_answer_date: Date;
      answer_details: string;
    }[] = await dataSource.query(`
      -- Start with selecting from the groups table
      SELECT 
          p.id AS profile_id,
          p.name AS profile_name,
          p.country,
          p.rate AS hourly_rate,
          p.link AS link_id,
          p.url AS url,
          -- Get the most recent answer date for each profile
          MAX(a.created_at) AS last_answer_date,
          -- Collect all answers for each profile
          GROUP_CONCAT(
              CONCAT(
                  a.id, '::', -- Answer ID
                  t.id, '::', -- Test ID
                  q.id, '::', -- Question ID
                  q.question, '::', -- Question text
                  a.answer, '::', -- Answer text
                  a.time_taken, '::', -- Time taken
                  a.paste_count, '::', -- Ctrl+V count
                  a.copy_count, '::', -- Ctrl+C count
                  a.right_click_count, '::', -- Right-click count
                  a.inactive_time, "::", -- Inactive time
                  a.is_correct
              ) 
              ORDER BY a.created_at DESC
              SEPARATOR '||'
          ) AS answer_details
      FROM 
          groups g
      -- Join with profiles_groups to get all profiles in the group
      INNER JOIN profiles_groups pg ON g.id = pg.groupId
      -- Join with profiles to get profile details
      INNER JOIN profile p ON pg.profileId = p.id
      -- Inner join with answers to exclude profiles without answers
      INNER JOIN answers a ON p.id = a.profile_id
      -- Join with questions to get question details
      LEFT JOIN questions q ON a.question_id = q.id
      -- Join with tests to get test details
      LEFT JOIN tests t ON a.test_id = t.id
      WHERE 
          g.id = ? -- Parameter for group ID
          ${test_id ? 'AND t.id = ?' : ''}
      GROUP BY 
          p.id
      ORDER BY 
          last_answer_date DESC
    `, test_id ? [group_id, test_id] : [group_id]);

    // Process the results
    const processedResults = detailedResults.map(result => ({
      profile: {
        id: result.profile_id,
        name: result.profile_name,
        country: result.country,
        hourlyRate: result.hourly_rate,
        linkId: result.link_id,
        lastAnswerDate: new Date(result.last_answer_date).toLocaleString(),
        url: result.url,
      },
      answers: result.answer_details.split('||').map(answer => {
        const [id, testId, questionId, question, answerText, timeTaken, ctrlV, ctrlC, rightClick, inactive, isCorrect] = answer.split('::');
        return {
          id: Number(id),
          testId: Number(testId),
          questionId: Number(questionId),
          question,
          answer: answerText,
          timeTaken: Number(timeTaken),
          inactive: Number(inactive),
          copyPaste: Number(ctrlV) + Number(ctrlC) + Number(rightClick),
          isCorrect: isCorrect === '1' ? true : false,
        };
      }),
    }));

    return reply.view("/admin/group/detailed_result", {
      title: "Detailed Test Results",
      detailedResults: processedResults,
      url: request.url,
      groupId: group_id,
      key,
    });
  });

  done()
}