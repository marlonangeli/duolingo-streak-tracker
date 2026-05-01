import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownSnippet from "@/components/markdown-snippet";
import { CARD_THEME_META, CARD_THEME_ORDER } from "@/lib/card-theme";
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

const themes: CardTheme[] = CARD_THEME_ORDER;
const variants: CardVariant[] = ["default", "compact", "minimal", "badges"];
const CARD_VARIANT_LABELS: Record<CardVariant, string> = {
  default: "Default",
  compact: "Compact",
  minimal: "Minimal",
  badges: "Badge",
};

const DirectionArrowIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className="size-3.5 text-slate-400"
    fill="none"
  >
    <path
      d="M3 8h10m0 0-3-3m3 3-3 3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
  </svg>
);

const HomeArrowIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    className="size-4"
    fill="none"
  >
    <path
      d="M8.75 3.5 4 8l4.75 4.5M4.75 8H14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const ProfileMetricCard = ({
  iconAlt,
  iconHeight,
  iconSrc,
  iconWidth,
  label,
  value,
}: {
  iconAlt?: string;
  iconHeight?: number;
  iconSrc?: string;
  iconWidth?: number;
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-slate-600/35 bg-slate-900/45 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <div className="mt-2 flex items-center gap-2.5 text-2xl font-bold text-white">
      {iconSrc ? (
        <Image
          src={iconSrc}
          alt={iconAlt ?? ""}
          width={iconWidth ?? 20}
          height={iconHeight ?? 20}
          className="h-6 w-auto"
        />
      ) : null}
      <span>{value}</span>
    </div>
  </div>
);

const LanguageFlag = ({
  flagCode,
  languageCode,
  title,
}: {
  flagCode: string | null;
  languageCode: string;
  title: string;
}) => {
  if (!flagCode) {
    return (
      <span className="inline-flex h-5 min-w-6 items-center justify-center rounded-md bg-white/15 px-1 text-[10px] font-black text-white">
        {languageCode.toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={`/flags/${flagCode}.svg`}
      alt={`${title} flag`}
      width={24}
      height={18}
      className="duo-flag h-[18px] w-6 border border-white/25"
    />
  );
};

const parseTheme = (input?: string): CardTheme => {
  const parsed = cardThemeSchema.safeParse(input);
  return parsed.success ? parsed.data : "polar";
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
  const previewWidth = variant === "badges" ? 320 : cardImageDimensions.width;

  const cardImageSizes =
    variant === "badges"
      ? "(max-width: 640px) 92vw, 320px"
      : `(max-width: 640px) 100vw, (max-width: 1024px) 90vw, ${previewWidth}px`;

  const cardPreviewWrapperClass =
    variant === "badges"
      ? "mt-6 flex max-w-full justify-center overflow-x-auto rounded-2xl border border-slate-600/40 bg-slate-900/40 p-3"
      : "mt-6 flex justify-center overflow-x-auto rounded-2xl border border-slate-600/40 bg-slate-900/40 p-3";

  const cardPreviewImageClass =
    variant === "badges"
      ? "h-auto w-auto max-w-full rounded-xl"
      : "h-auto w-auto max-w-full rounded-xl";

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
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="duo-button-link duo-button--sm"
          >
            <HomeArrowIcon />
            Home
          </Link>
        </div>

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-slate-400">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {profile.name}
        </h1>
        <p className="mt-2 text-sm text-slate-300">@{profile.username}</p>

        <div className={`mt-6 grid grid-cols-2 gap-3 ${statsGridColumnsClass}`}>
          <ProfileMetricCard
            label="Streak"
            value={String(profile.streak)}
            iconSrc="/brand/icons/streak.svg"
            iconAlt="Streak"
            iconWidth={20}
            iconHeight={24}
          />
          <ProfileMetricCard
            label="Total XP"
            value={profile.totalXp.toLocaleString("en-US")}
            iconSrc="/brand/icons/xp.svg"
            iconAlt="XP"
            iconWidth={20}
            iconHeight={24}
          />
          <ProfileMetricCard
            label="Languages"
            value={String(profile.courses.length)}
          />
          {profile.league.available ? (
            <ProfileMetricCard label="League" value={profile.league.tier ?? "—"} />
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
              className={`duo-interactive inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                item === theme
                  ? "border-white/80 bg-white/18 text-white"
                  : "border-white/20 bg-black/10 text-white/90"
              }`}
            >
              <span
                className="inline-block size-3 rounded-full border border-white/40"
                style={{ backgroundColor: CARD_THEME_META[item].swatch }}
              />
              {CARD_THEME_META[item].label}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {variants.map((item) => (
            <Link
              key={item}
              href={`/${profile.username}?theme=${theme}&variant=${item}`}
              className={`duo-interactive rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                item === variant
                  ? "border-white/75 bg-white/14 text-white"
                  : "border-white/20 bg-black/10 text-white/90"
              }`}
            >
              {CARD_VARIANT_LABELS[item]}
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
          {profile.courses.slice(0, 6).map((course) => {
            const flagCode = getLanguageFlagCode(course.learningLanguage);

            return (
              <article
                key={course.id}
                className="rounded-xl border border-slate-600/35 bg-slate-900/45 p-4"
              >
                <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                  <LanguageFlag
                    flagCode={flagCode}
                    languageCode={course.learningLanguage}
                    title={course.title}
                  />
                  {course.title}
                </h3>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-slate-300">
                  <span>{course.fromLanguage.toUpperCase()}</span>
                  <DirectionArrowIcon />
                  <span>{course.learningLanguage.toUpperCase()}</span>
                </div>
                <p className="mt-3 text-lg font-bold text-emerald-200">
                  {course.xp.toLocaleString("en-US")} XP
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default UserPage;
