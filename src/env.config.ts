import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]),
	PORT: z.coerce.number(),
	DB_HOST: z.string(),
	DB_PORT: z.coerce.number(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	DB_CONNECTION_LIMIT: z.coerce.number().default(10),
	SESSION_SECRET: z.string().min(32),
	SESSION_SALT: z.string(),
	URL: z.string().url(),
	KEY: z.string().min(1),
	RESULT_SALT: z.string().min(1),
});

export const env = envSchema.parse(process.env);
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";