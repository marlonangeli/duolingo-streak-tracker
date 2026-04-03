import {
  type DuolingoUser,
  type UserStats,
  duolingoUsersResponseSchema,
  userStatsSchema,
} from "@/models/user";

const DUOLINGO_BASE_URL = "https://www.duolingo.com/2017-06-30/users";
const DUOLINGO_USER_AGENT =
  "Mozilla/5.0 (compatible; DuolingoStreakTracker/2.0; +https://duolingo-streak-tracker.vercel.app)";

export const STATS_REVALIDATE_SECONDS = 60 * 30;

const normalizeAvatarUrl = (picture: string | null | undefined) => {
  if (!picture) {
    return null;
  }

  if (picture.startsWith("//")) {
    return `https:${picture}/xlarge`;
  }

  if (picture.startsWith("http://") || picture.startsWith("https://")) {
    return picture;
  }

  return null;
};

const mapUser = (user: DuolingoUser): UserStats => {
  const sortedCourses = [...user.courses].sort((left, right) => right.xp - left.xp);

  const topLanguages = sortedCourses.slice(0, 5).map((course) => ({
    code: course.learningLanguage,
    title: course.title,
    xp: course.xp,
  }));

  const stats: UserStats = {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarUrl: normalizeAvatarUrl(user.picture),
    totalXp: user.totalXp,
    streak: user.streak,
    streakWindow: user.streakData?.currentStreak
      ? {
          length: user.streakData.currentStreak.length,
          startDate: user.streakData.currentStreak.startDate ?? null,
          endDate: user.streakData.currentStreak.endDate ?? null,
        }
      : null,
    hasPlus: user.hasPlus ?? null,
    creationDate: user.creationDate ?? null,
    currentCourseId: user.currentCourseId ?? null,
    fromLanguage: user.fromLanguage ?? null,
    learningLanguage: user.learningLanguage ?? null,
    courses: sortedCourses.map((course) => ({
      id: course.id,
      title: course.title,
      learningLanguage: course.learningLanguage,
      fromLanguage: course.fromLanguage,
      xp: course.xp,
      crowns: course.crowns ?? null,
    })),
    topLanguages,
    league: {
      available: false,
      tier: null,
      rank: null,
      pointsThisWeek: null,
      source: null,
      reason:
        "No public unauthenticated Duolingo league endpoint is currently available",
    },
    meta: {
      source: "duolingo-public-2017-06-30",
      fetchedAt: new Date().toISOString(),
    },
  };

  return userStatsSchema.parse(stats);
};

export const getUserStatsByUsername = async (username: string) => {
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername) {
    return null;
  }

  const url = `${DUOLINGO_BASE_URL}?username=${encodeURIComponent(normalizedUsername)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json; charset=UTF-8",
      "user-agent": DUOLINGO_USER_AGENT,
    },
    next: {
      revalidate: STATS_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`Duolingo request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const parsedPayload = duolingoUsersResponseSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new Error("Unexpected Duolingo payload format");
  }

  const [user] = parsedPayload.data.users;

  if (!user) {
    return null;
  }

  return mapUser(user);
};
