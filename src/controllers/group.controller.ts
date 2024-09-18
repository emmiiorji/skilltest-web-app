import { FastifyInstance } from "fastify";
import { z } from "zod";
import { AppDataSource } from "../database/connection";
import { Group } from "../database/entities/Group.entity";
import { Profile } from "../database/entities/Profile.entity";
import { Test } from "../database/entities/Test.entity";

export function groupController(app: FastifyInstance, opts: any, done: () => void) {
  const groupRepo = AppDataSource.getRepository(Group);

  app.get("/list", async (request, reply) => {
    const groups = await groupRepo.find({
      select: ["id", "name", "createdAt"],
      order: { createdAt: "DESC" }
    });

    let formattedGroups = await Promise.all(
      groups.map(async group => ({
        ...group,
        ...(
          await AppDataSource.getRepository(Profile).findAndCount({
            relations: ["groups"],
            select: ["id", "country"],
            order: { country: "ASC" },
            where: {
              groups: {
                id: group.id
              }
            }
          }).then(res => ({
            profile_count: res[1],
            profile_countries: [...new Set(res[0].map((p: any) => p.country))].join(', '),
          }))
        ),
        test_ids: await AppDataSource.getRepository(Test).find({
          select: ["id"],
          order: { id: "ASC" },
          where: {
            groups: {
              id: group.id
            }
          }
        }).then(res => res.map((t: any) => t.id).join(', '))
      }))
    );

    return reply.view("/admin/group/list", {
      title: "All Groups",
      groups: formattedGroups,
      url: request.url
    });
  });

  app.post("/create", async (request, reply) => {
    const { group_id: id, group_name: name } = z.object({
      group_id: z.coerce.number(),
      group_name: z.string()  
    }).parse(request.body);
    const newGroup = groupRepo.create({ id, name });
    await groupRepo.insert(newGroup);
    
    reply.redirect("/admin/group/list");
  });

  done()
}