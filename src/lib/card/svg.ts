import type { CardOptions, CardTheme, MetricKey } from "@/models/card";
import type { UserStats } from "@/models/user";

type Palette = {
  background: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  chip: string;
  chipText: string;
  border: string;
};

const THEME_PALETTES: Record<CardTheme, Palette> = {
  duo: {
    background: "#0f1e2c",
    card: "#122638",
    text: "#f4faf7",
    muted: "#9bb0c1",
    accent: "#58cc02",
    chip: "#1f3347",
    chipText: "#f4faf7",
    border: "#2d4359",
  },
  dark: {
    background: "#0a0a0f",
    card: "#131320",
    text: "#f6f7fb",
    muted: "#a5a8ba",
    accent: "#7f5af0",
    chip: "#1a1a2d",
    chipText: "#f6f7fb",
    border: "#2b2b41",
  },
  light: {
    background: "#f4f7fb",
    card: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    accent: "#1cb0f6",
    chip: "#eef2f9",
    chipText: "#111827",
    border: "#d7deea",
  },
  sunset: {
    background: "#251235",
    card: "#341b4a",
    text: "#fff5fd",
    muted: "#f4b9df",
    accent: "#ff9600",
    chip: "#4a255f",
    chipText: "#fff5fd",
    border: "#72428f",
  },
};

const CARD_DIMENSIONS = {
  default: { width: 760, height: 240 },
  compact: { width: 600, height: 170 },
  minimal: { width: 460, height: 110 },
  badges: { width: 760, height: 140 },
} as const;

const escapeXml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const getMetricsText = (stats: UserStats): Record<MetricKey, string> => ({
  streak: `🔥 ${stats.streak.toLocaleString("en-US")} day streak`,
  xp: `⚡ ${formatNumber(stats.totalXp)} XP total`,
  languages: `🌍 ${stats.courses.length} active language${stats.courses.length === 1 ? "" : "s"}`,
  league: stats.league.available
    ? `🏆 ${stats.league.tier ?? "League"} · #${stats.league.rank ?? "-"}`
    : "🏆 League unavailable (public API)",
  plus: stats.hasPlus ? "✨ Super user" : "✨ Free user",
});

const getInitial = (name: string) => {
  const [firstChar] = name.trim();
  return firstChar?.toUpperCase() ?? "D";
};

const renderChips = ({
  labels,
  startX,
  startY,
  maxWidth,
  palette,
}: {
  labels: string[];
  startX: number;
  startY: number;
  maxWidth: number;
  palette: Palette;
}) => {
  const chipHeight = 30;
  const gap = 8;

  let cursorX = startX;
  let cursorY = startY;

  const chips = labels
    .map((label) => {
      const escapedLabel = escapeXml(label);
      const width = Math.max(104, label.length * 7 + 32);

      if (cursorX + width > startX + maxWidth) {
        cursorX = startX;
        cursorY += chipHeight + gap;
      }

      const chip = `
        <g>
          <rect x="${cursorX}" y="${cursorY}" width="${width}" height="${chipHeight}" rx="15" fill="${palette.chip}" stroke="${palette.border}" />
          <text x="${cursorX + 16}" y="${cursorY + 20}" font-size="14" fill="${palette.chipText}" font-family="Inter, Segoe UI, sans-serif">${escapedLabel}</text>
        </g>
      `;

      cursorX += width + gap;
      return chip;
    })
    .join("\n");

  return {
    chips,
    usedHeight: cursorY + chipHeight - startY,
  };
};

const renderMinimal = ({
  stats,
  options,
  palette,
}: {
  stats: UserStats;
  options: CardOptions;
  palette: Palette;
}) => {
  const title = escapeXml(options.title ?? "Duolingo Streak Tracker");
  const username = escapeXml(stats.username);

  return `
    <text x="24" y="35" font-size="18" font-weight="700" fill="${palette.text}" font-family="Inter, Segoe UI, sans-serif">${title}</text>
    <text x="24" y="62" font-size="14" fill="${palette.muted}" font-family="Inter, Segoe UI, sans-serif">@${username}</text>
    <text x="24" y="90" font-size="16" fill="${palette.text}" font-family="Inter, Segoe UI, sans-serif">🔥 ${stats.streak.toLocaleString("en-US")} · ⚡ ${formatNumber(stats.totalXp)} XP · 🌍 ${stats.courses.length}</text>
  `;
};

const renderCardBody = (stats: UserStats, options: CardOptions) => {
  const palette = THEME_PALETTES[options.theme];
  const dimensions = CARD_DIMENSIONS[options.variant];

  const title = escapeXml(options.title ?? "Duolingo Streak Tracker");
  const name = escapeXml(stats.name);
  const username = escapeXml(stats.username);

  const selectedMetrics = getMetricsText(stats);
  const labels = options.metrics.map((metric) => selectedMetrics[metric]);

  const languageLabels = stats.topLanguages
    .slice(0, options.langLimit)
    .map((language) => `${language.code.toUpperCase()} · ${formatNumber(language.xp)} XP`);

  const chipData = renderChips({
    labels: [...labels, ...languageLabels],
    startX: 24,
    startY: options.variant === "compact" ? 98 : 126,
    maxWidth: dimensions.width - 48,
    palette,
  });

  if (options.variant === "minimal") {
    return {
      dimensions,
      palette,
      body: renderMinimal({ stats, options, palette }),
    };
  }

  if (options.variant === "badges") {
    return {
      dimensions,
      palette,
      body: `
        <text x="24" y="36" font-size="18" font-weight="700" fill="${palette.text}" font-family="Inter, Segoe UI, sans-serif">${title}</text>
        <text x="24" y="62" font-size="14" fill="${palette.muted}" font-family="Inter, Segoe UI, sans-serif">@${username}</text>
        ${chipData.chips}
      `,
    };
  }

  return {
    dimensions,
    palette,
    body: `
      <circle cx="64" cy="62" r="32" fill="${palette.accent}" />
      <text x="64" y="74" text-anchor="middle" font-size="28" font-weight="700" fill="${palette.card}" font-family="Inter, Segoe UI, sans-serif">${escapeXml(
        getInitial(stats.name)
      )}</text>

      <text x="112" y="44" font-size="18" font-weight="700" fill="${palette.text}" font-family="Inter, Segoe UI, sans-serif">${title}</text>
      <text x="112" y="70" font-size="17" fill="${palette.text}" font-family="Inter, Segoe UI, sans-serif">${name}</text>
      <text x="112" y="92" font-size="14" fill="${palette.muted}" font-family="Inter, Segoe UI, sans-serif">@${username}</text>

      ${chipData.chips}
    `,
  };
};

export const renderUserCardSvg = (stats: UserStats, options: CardOptions) => {
  const { dimensions, palette, body } = renderCardBody(stats, options);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" role="img" aria-label="Duolingo statistics card for ${escapeXml(
    stats.username
  )}">
  <defs>
    <linearGradient id="duo-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.background}" />
      <stop offset="100%" stop-color="${palette.card}" />
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="18" fill="url(#duo-bg)" />
  <rect x="1" y="1" width="${dimensions.width - 2}" height="${dimensions.height - 2}" rx="17" fill="none" stroke="${palette.border}" />

  ${body}
</svg>
`.trim();
};

export const renderMissingUserSvg = (username: string) => {
  const safeUsername = escapeXml(username);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="560" height="140" viewBox="0 0 560 140" role="img" aria-label="Duolingo user not found">
  <rect x="0" y="0" width="560" height="140" rx="16" fill="#101828" />
  <text x="24" y="52" font-size="20" font-weight="700" fill="#f9fafb" font-family="Inter, Segoe UI, sans-serif">Duolingo user not found</text>
  <text x="24" y="82" font-size="14" fill="#9ca3af" font-family="Inter, Segoe UI, sans-serif">We could not load public stats for @${safeUsername}</text>
</svg>
`.trim();
};
