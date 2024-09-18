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
    const dataSource = await connection();
    const groupRepo = dataSource.getRepository(Group);
    const { group_id: id, group_name: name } = z.object({
      group_id: z.coerce.number(),
      group_name: z.string()  
    }).parse(request.body);
    const newGroup = groupRepo.create({ id, name });
    await groupRepo.insert(newGroup);
    
    reply.redirect("/admin/group/list");
  });

  app.get("/test_result", async (request, reply) => {
    const { group_id: groupId } = z.object({
      group_id: z.coerce.number(),
    }).parse(request.query);

    const dataSource = await connection();
    
    const testResults = await dataSource.query(`
      SELECT 
        p.id AS user_id,
        p.name AS user_name,
        p.country,
        COUNT(CASE WHEN ta.is_correct = 1 THEN 1 END) AS correct_answers,
        COUNT(ta.id) AS total_answers,
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
        ) AS question_details
      FROM profile p
      JOIN profiles_groups pg ON p.id = pg.profileId
      JOIN answers ta ON p.id = ta.profile_id
      WHERE pg.groupId = ?
      GROUP BY p.id, p.name, p.country
    `, [groupId]);

    return reply.view("/admin/group/test_result", {
      title: "Test Results",
      testResults,
      url: request.url
    });
  });

  done()
}