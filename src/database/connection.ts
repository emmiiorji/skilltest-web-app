import { DataSource } from "typeorm";
import { env, isDev } from "../env.config";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: isDev,
  entities: ["src/database/entities/**/*.entity.ts"],
  // entities: [Test, Group, Profile, Template],
  migrations: ["src/database/migrations/**/*.ts"],
  subscribers: ["src/database/subscribers/**/*.ts"],
  // Update connection pooling options
  extra: {
    connectionLimit: env.DB_CONNECTION_LIMIT,
    queueLimit: 0,
    waitForConnections: true,
  },
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