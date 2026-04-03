import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownSnippet from "@/components/markdown-snippet";
import { APP_UPDATED_LABEL, APP_VERSION } from "@/lib/app-meta";
import { CARD_DIMENSIONS } from "@/lib/card/svg";
import { getUserStatsByUsername } from "@/lib/duolingo/client";
import { getLanguageFlagCode } from "@/lib/language-flag-map";
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
  const cardImageDimensions = CARD_DIMENSIONS[variant];
  const githubRepoUrl = "https://github.com/marlonangeli/duolingo-streak-tracker";

  const cardImageSizes =
    variant === "badges"
      ? "(max-width: 640px) 92vw, 420px"
      : "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 760px";

  const cardPreviewWrapperClass =
    variant === "badges"
      ? "mt-6 inline-flex max-w-full overflow-x-auto rounded-2xl border border-slate-600/40 bg-slate-900/40 p-3"
      : "mt-6 overflow-hidden rounded-2xl border border-slate-600/40 bg-slate-900/40 p-3";

  const cardPreviewImageClass =
    variant === "badges"
      ? "h-auto w-auto max-w-full rounded-xl"
      : "h-auto w-full rounded-xl";

  const statsGridColumnsClass = profile.league.available
    ? "sm:grid-cols-4"
    : "sm:grid-cols-3";

  const cardPath = `/api/card/${profile.username}?theme=${theme}&variant=${variant}`;
  const markdownSnippet = getMarkdownSnippet({
    username: profile.username,
    theme,
    variant,
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-10">
      <section className="duo-panel relative p-6 sm:p-8">
        <a
          href={githubRepoUrl}
          target="_blank"
          rel="noreferrer"
          className="duo-link duo-interactive absolute right-4 top-4 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white sm:text-xs"
        >
          Repository
        </a>

        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {profile.name}
        </h1>
        <p className="mt-2 text-sm text-slate-300">@{profile.username}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <details className="group relative">
            <summary className="duo-link duo-interactive list-none cursor-pointer px-3 py-1 text-xs font-bold uppercase tracking-wide">
              ℹ Latest Update
            </summary>
            <div className="absolute left-0 top-9 z-20 min-w-max rounded-xl border border-white/20 bg-slate-900/95 px-3 py-2 text-xs text-slate-100 shadow-2xl">
              Version <strong>v{APP_VERSION}</strong> · build {APP_UPDATED_LABEL}
            </div>
          </details>
        </div>

        <div className={`mt-6 grid grid-cols-2 gap-3 ${statsGridColumnsClass}`}>
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
          {profile.league.available ? (
            <div className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                League
              </p>
              <p className="mt-1 text-lg font-bold text-white">{profile.league.tier}</p>
            </div>
          ) : null}
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

        <div className={cardPreviewWrapperClass}>
          <Image
            src={cardPath}
            alt={`Duolingo SVG card for ${profile.username}`}
            width={cardImageDimensions.width}
            height={cardImageDimensions.height}
            sizes={cardImageSizes}
            unoptimized
            className={cardPreviewImageClass}
          />
        </div>

        <MarkdownSnippet snippet={markdownSnippet} />
      </section>

      <section className="duo-panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">Top languages</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profile.courses.slice(0, 6).map((course) => (
            <article
              key={course.id}
              className="rounded-xl border border-slate-600/40 bg-slate-900/50 p-4"
            >
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                {(() => {
                  const flagCode = getLanguageFlagCode(course.learningLanguage);

                  if (!flagCode) {
                    return (
                      <span className="inline-flex h-5 min-w-6 items-center justify-center rounded bg-white/15 px-1 text-[10px] font-black text-white">
                        {course.learningLanguage.toUpperCase()}
                      </span>
                    );
                  }

                  return (
                    <Image
                      src={`/flags/${flagCode}.svg`}
                      alt={`${course.title} flag`}
                      width={24}
                      height={18}
                      className="duo-flag h-[18px] w-6 border border-white/25"
                    />
                  );
                })()}
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
