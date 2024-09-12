import { DataSource } from "typeorm";
import { env, isDev } from "../env.config";
import { logger } from "../server";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: isDev,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    logger.info("Database connection established successfully.");
  } catch (error) {
    logger.fatal("Error connecting to the database:", error);
    throw error;
  }
}