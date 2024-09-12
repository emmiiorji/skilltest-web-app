import dotenv from 'dotenv';
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]),
	PORT: z.coerce.number(),
	DB_HOST: z.string(),
	DB_PORT: z.coerce.number(),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string(),
	SESSION_SECRET: z.string().min(32),
	URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";