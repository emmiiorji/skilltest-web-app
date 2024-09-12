import { DataSource } from "typeorm";
import { env } from "../env.config";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false, // isDev,
  entities: ["src/database/entities/**/*.ts"],
  migrations: ["src/database/migrations/**/*.ts"],
  subscribers: ["src/database/subscribers/**/*.ts"],
});

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.info("Database connection established successfully.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

export async function dropDatabase() {
  try {
    await AppDataSource.dropDatabase();
    console.info("Database dropped successfully.");
  } catch (error) {
    console.error("Error dropping the database:", error);
    throw error;
  }
}

export async function syncDatabase() {
  try {
    await AppDataSource.synchronize();
    console.info("Database schema synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing the database schema:", error);
    throw error;
  }
}