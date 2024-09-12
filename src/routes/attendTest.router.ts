import { FastifyInstance } from "fastify";
import { attendTestController } from "../controllers/attendTest.controller";

export default async function attendTestRouter(fastify: FastifyInstance) {
  fastify.register(attendTestController);
}