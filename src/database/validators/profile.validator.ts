import { z } from "zod";

const dateSchemaOptional = z.string().optional();

export const ProfileSchema = z.object({
  link: z.string(),
  url: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  country: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  lastActivity: dateSchemaOptional,
  earned: z.coerce.number().optional(),
  rate: z.coerce.number().optional(),
  totalHours: z.coerce.number().optional(),
  inProgress: z.boolean().optional(),
  invitedAt: dateSchemaOptional,
  shortname: z.string().max(100).optional(),
  recno: z.coerce.number().optional(),
  agencies: z.string().optional(),
  totalRevenue: z.coerce.number().optional(),
  memberSince: dateSchemaOptional,
  vanityUrl: z.string().optional(),
  skills: z.string().optional(),
  process: z.string().optional(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;