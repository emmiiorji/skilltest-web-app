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
  logging: false,
  entities: ["dist/database/entities/**/*.entity.js"],
  migrations: ["dist/database/migrations/**/*.js"],
  subscribers: ["dist/database/subscribers/**/*.js"],
  extra: {
    connectionLimit: env.DB_CONNECTION_LIMIT,
    queueLimit: 0,
    waitForConnections: true,
  },
});

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.info("Database connection established successfully.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

export const connection = async () => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }
  await initializeDatabase();
  return AppDataSource;
}
