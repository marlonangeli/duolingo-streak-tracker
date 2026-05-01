import { z } from "zod";
import { courseSummarySchema, duolingoCourseSchema } from "./course";

const streakWindowSchema = z.object({
  length: z.coerce.number().int().nonnegative(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export const duolingoUserSchema = z.object({
  id: z.coerce.number().int(),
  username: z.string(),
  name: z.string(),
  picture: z.string().nullable().optional(),
  totalXp: z.coerce.number().nonnegative(),
  streak: z.coerce.number().int().nonnegative(),
  streakData: z
    .object({
      currentStreak: streakWindowSchema.nullable().optional(),
      longestStreak: streakWindowSchema.nullable().optional(),
      previousStreak: streakWindowSchema.nullable().optional(),
    })
    .optional(),
  courses: z.array(duolingoCourseSchema).default([]),
  currentCourseId: z.string().nullable().optional(),
  fromLanguage: z.string().nullable().optional(),
  learningLanguage: z.string().nullable().optional(),
  hasPlus: z.boolean().nullable().optional(),
  creationDate: z.coerce.number().int().nullable().optional(),
  xpGoal: z.coerce.number().int().nonnegative().nullable().optional(),
  timezone: z.string().nullable().optional(),
  timezoneOffset: z.coerce.number().nullable().optional(),
});

export type DuolingoUser = z.infer<typeof duolingoUserSchema>;

export const duolingoUsersResponseSchema = z.object({
  users: z.array(duolingoUserSchema).default([]),
});

export const leagueInfoSchema = z.object({
  available: z.boolean(),
  tier: z.string().nullable(),
  rank: z.number().int().nullable(),
  pointsThisWeek: z.number().nullable(),
  source: z.string().nullable(),
  reason: z.string().nullable(),
});

export const languageStatSchema = z.object({
  code: z.string(),
  title: z.string(),
  xp: z.number().nonnegative(),
});

export const userStatsSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().nullable(),
  totalXp: z.number().nonnegative(),
  streak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative().nullable(),
  streakWindow: streakWindowSchema.nullable(),
  hasPlus: z.boolean().nullable(),
  creationDate: z.number().int().nullable(),
  xpGoal: z.number().int().nonnegative().nullable(),
  timezone: z.string().nullable(),
  timezoneOffset: z.number().nullable(),
  currentCourseId: z.string().nullable(),
  fromLanguage: z.string().nullable(),
  learningLanguage: z.string().nullable(),
  courses: z.array(courseSummarySchema),
  topLanguages: z.array(languageStatSchema),
  league: leagueInfoSchema,
  meta: z.object({
    source: z.string(),
    fetchedAt: z.string(),
  }),
});

export type UserStats = z.infer<typeof userStatsSchema>;
