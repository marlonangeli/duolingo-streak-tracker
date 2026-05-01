import { z } from "zod";

export const duolingoCourseSchema = z.object({
  authorId: z.string().optional(),
  title: z.string(),
  learningLanguage: z.string(),
  xp: z.coerce.number().nonnegative().default(0),
  healthEnabled: z.boolean().optional(),
  fromLanguage: z.string(),
  id: z.string(),
});

export type DuolingoCourse = z.infer<typeof duolingoCourseSchema>;

export const courseSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  learningLanguage: z.string(),
  fromLanguage: z.string(),
  xp: z.number().nonnegative(),
});

export type CourseSummary = z.infer<typeof courseSummarySchema>;
