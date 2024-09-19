import { FastifyInstance } from "fastify";
import { z } from "zod";
import { connection } from "../database/connection";
import { Group } from "../database/entities/Group.entity";

export function groupController(app: FastifyInstance, opts: any, done: () => void) {

  app.get("/list", async (request, reply) => {
    const dataSource = await connection();
    const groupRepo = dataSource.getRepository(Group);
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
    console.debug(groups.map(group => group.profile_countries))

    return reply.view("/admin/group/list", {
      title: "All Groups",
      groups,
      url: request.url
    });
  });

  app.post("/create", async (request, reply) => {
    try {
      const dataSource = await connection();
      const groupRepo = dataSource.getRepository(Group);
      const { group_id: id, group_name: name } = z.object({
        group_id: z.coerce.number(),
        group_name: z.string()  
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
      sort: z.enum(['date', 'pass', 'date,pass', 'pass,date'])
    }).safeParse(request.query);

    let groupId: number;
    let validSort: string;
    let orderBy: string;

    if (result.success) {
      groupId = result.data.group_id;
      validSort = result.data.sort;
    } else if (result.error.issues.some(issue => issue.path.includes('sort'))) {
      const parsedQuery = z.object({
        group_id: z.coerce.number(),
      }).parse(request.query);
      groupId = parsedQuery.group_id;
      // Redirect to the test result page with the default sort order if group_id is available
      return reply.redirect(`/admin/group/test_result?group_id=${groupId}&sort=date,pass`);
    } else {
      throw result.error;
    };

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
        p.id AS user_id,
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
            ta.copy_count,
            ',',
            ta.paste_count,
            ',',
            ta.right_click_count,
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
      -- Group results by user
      GROUP BY p.id, p.name, p.country
      ORDER BY ${orderBy}
    `, [groupId]);

    return reply.view("/admin/group/test_result", {
      title: "Test Results",
      testResults,
      url: request.url,
      currentSort: validSort
    });
  });

  done()
}