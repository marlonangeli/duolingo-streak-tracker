import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserStatsByUsername } from "@/lib/duolingo/client";
import type { UserStats } from "@/models/user";
import {
  type CardTheme,
  type CardVariant,
  cardThemeSchema,
  cardVariantSchema,
} from "@/models/card";

type UserPageProps = {
  params: Promise<{ user: string }>;
  searchParams: Promise<{ theme?: string; variant?: string }>;
};

const CARD_IMAGE_DIMENSIONS: Record<CardVariant, { width: number; height: number }> =
  {
    default: { width: 760, height: 240 },
    compact: { width: 600, height: 170 },
    minimal: { width: 460, height: 110 },
    badges: { width: 760, height: 140 },
  };

const themes: CardTheme[] = ["duo", "dark", "light", "sunset"];
const variants: CardVariant[] = ["default", "compact", "minimal", "badges"];

const parseTheme = (input?: string): CardTheme => {
  const parsed = cardThemeSchema.safeParse(input);
  return parsed.success ? parsed.data : "duo";
};

const parseVariant = (input?: string): CardVariant => {
  const parsed = cardVariantSchema.safeParse(input);
  return parsed.success ? parsed.data : "default";
};

const getMarkdownSnippet = ({
  username,
  theme,
  variant,
}: {
  username: string;
  theme: CardTheme;
  variant: CardVariant;
}) => {
  const baseUrl = "https://duolingo-streak-tracker.vercel.app";
  return `![Duolingo Streak Card](${baseUrl}/api/card/${username}?theme=${theme}&variant=${variant})`;
};

const UserPage = async ({ params, searchParams }: UserPageProps) => {
  const { user } = await params;
  const { theme: themeInput, variant: variantInput } = await searchParams;

  const theme = parseTheme(themeInput);
  const variant = parseVariant(variantInput);

  let userStats: UserStats | null = null;

  try {
    userStats = await getUserStatsByUsername(user);
  } catch {
    notFound();
  }

  if (!userStats) {
    notFound();
  }

  const profile = userStats;
  const cardImageDimensions = CARD_IMAGE_DIMENSIONS[variant];

  const cardPath = `/api/card/${profile.username}?theme=${theme}&variant=${variant}`;
  const markdownSnippet = getMarkdownSnippet({
    username: profile.username,
    theme,
    variant,
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <section className="duo-panel p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {profile.name}
        </h1>
        <p className="mt-2 text-sm text-slate-300">@{profile.username}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Streak
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              🔥 {profile.streak}
            </p>
          </div>
          <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total XP
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              ⚡ {profile.totalXp.toLocaleString("en-US")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Languages
            </p>
            <p className="mt-1 text-2xl font-bold text-white">
              🌍 {profile.courses.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              League
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {profile.league.available
                ? profile.league.tier
                : "Unavailable"}
            </p>
          </div>
        </div>
      </section>

      <section className="duo-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">SVG README Card</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {themes.map((item) => (
            <Link
              key={item}
              href={`/${profile.username}?theme=${item}&variant=${variant}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                item === theme
                  ? "border-emerald-300 bg-emerald-300/15 text-emerald-100"
                  : "border-slate-600 bg-slate-900/40 text-slate-200"
              }`}
            >
              theme: {item}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {variants.map((item) => (
            <Link
              key={item}
              href={`/${profile.username}?theme=${theme}&variant=${item}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                item === variant
                  ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                  : "border-slate-600 bg-slate-900/40 text-slate-200"
              }`}
            >
              variant: {item}
            </Link>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-600/40 bg-slate-900/40 p-3">
          <Image
            src={cardPath}
            alt={`Duolingo SVG card for ${profile.username}`}
            width={cardImageDimensions.width}
            height={cardImageDimensions.height}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 760px"
            unoptimized
            className="h-auto w-full"
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-600/40 bg-slate-900/60 p-4">
          <p className="mb-2 text-sm font-semibold text-white">
            Markdown snippet
          </p>
          <pre className="overflow-x-auto text-xs text-slate-200 sm:text-sm">
            {markdownSnippet}
          </pre>
        </div>
      </section>

      <section className="duo-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">Top languages</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.courses.slice(0, 6).map((course) => (
            <article
              key={course.id}
              className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4"
            >
              <h3 className="text-base font-semibold text-white">
                {course.title}
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                {course.fromLanguage.toUpperCase()} →{" "}
                {course.learningLanguage.toUpperCase()}
              </p>
              <p className="mt-2 text-lg font-bold text-emerald-200">
                {course.xp.toLocaleString("en-US")} XP
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default UserPage;
