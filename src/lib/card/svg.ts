import type { CardOptions, CardTheme, CardVariant, MetricKey } from "@/models/card";
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

type ChipLayout = {
  startY: number;
  maxRows: number;
  maxChipWidth: number;
};

const FONT_FAMILY = "Nunito, Inter, Segoe UI, sans-serif";

const THEME_PALETTES: Record<CardTheme, Palette> = {
  duo: {
    background: "#58CC02",
    card: "#1CB0F6",
    text: "#FFFFFF",
    muted: "#E5F7FF",
    accent: "#FFFFFF",
    chip: "#0F7DB3",
    chipText: "#FFFFFF",
    border: "#5FCBFF",
  },
  dark: {
    background: "#1F2937",
    card: "#111827",
    text: "#F9FAFB",
    muted: "#9CA3AF",
    accent: "#58CC02",
    chip: "#0B1220",
    chipText: "#F9FAFB",
    border: "#374151",
  },
  light: {
    background: "#F4F7FB",
    card: "#FFFFFF",
    text: "#4B4B4B",
    muted: "#777777",
    accent: "#58CC02",
    chip: "#ECF7FF",
    chipText: "#4B4B4B",
    border: "#E5E5E5",
  },
  sunset: {
    background: "#FF6D5A",
    card: "#FFB020",
    text: "#FFFFFF",
    muted: "#FFF4DB",
    accent: "#FFFFFF",
    chip: "#D14E3D",
    chipText: "#FFFFFF",
    border: "#FFB9AF",
  },
};

export const CARD_DIMENSIONS: Record<CardVariant, { width: number; height: number }> = {
  default: { width: 760, height: 240 },
  compact: { width: 600, height: 170 },
  minimal: { width: 460, height: 110 },
  badges: { width: 760, height: 140 },
};

const CHIP_LAYOUT_BY_VARIANT: Record<Exclude<CardVariant, "minimal">, ChipLayout> = {
  default: {
    startY: 126,
    maxRows: 3,
    maxChipWidth: 280,
  },
  compact: {
    startY: 98,
    maxRows: 2,
    maxChipWidth: 220,
  },
  badges: {
    startY: 72,
    maxRows: 2,
    maxChipWidth: 260,
  },
};

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

const buildChip = (params: {
  x: number;
  y: number;
  width: number;
  label: string;
  palette: Palette;
}) => {
  const { x, y, width, label, palette } = params;
  const safeLabel = escapeXml(label);

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="30" rx="15" fill="${palette.chip}" stroke="${palette.border}" />
      <text x="${x + 16}" y="${y + 20}" font-size="14" fill="${palette.chipText}" font-family="${FONT_FAMILY}">${safeLabel}</text>
    </g>
  `;
};

const renderChips = ({
  labels,
  startX,
  maxWidth,
  palette,
  layout,
}: {
  labels: string[];
  startX: number;
  maxWidth: number;
  palette: Palette;
  layout: ChipLayout;
}) => {
  const chipHeight = 30;
  const gap = 8;

  let cursorX = startX;
  let cursorY = layout.startY;
  let rowIndex = 0;
  let placed = 0;
  const chips: string[] = [];

  for (const label of labels) {
    const width = Math.min(layout.maxChipWidth, Math.max(104, label.length * 7 + 32));

    if (cursorX + width > startX + maxWidth) {
      rowIndex += 1;
      cursorX = startX;
      cursorY += chipHeight + gap;
    }

    if (rowIndex >= layout.maxRows) {
      break;
    }

    chips.push(
      buildChip({
        x: cursorX,
        y: cursorY,
        width,
        label,
        palette,
      })
    );

    cursorX += width + gap;
    placed += 1;
  }

  const remaining = labels.length - placed;

  if (remaining > 0 && rowIndex < layout.maxRows) {
    const moreLabel = `+${remaining} more`;
    const width = Math.max(104, moreLabel.length * 7 + 32);

    if (cursorX + width > startX + maxWidth) {
      rowIndex += 1;
      cursorX = startX;
      cursorY += chipHeight + gap;
    }

    if (rowIndex < layout.maxRows) {
      chips.push(
        buildChip({
          x: cursorX,
          y: cursorY,
          width,
          label: moreLabel,
          palette,
        })
      );
    }
  }

  return chips.join("\n");
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
    <text x="24" y="35" font-size="18" font-weight="700" fill="${palette.text}" font-family="${FONT_FAMILY}">${title}</text>
    <text x="24" y="62" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${username}</text>
    <text x="24" y="90" font-size="16" fill="${palette.text}" font-family="${FONT_FAMILY}">🔥 ${stats.streak.toLocaleString("en-US")} · ⚡ ${formatNumber(stats.totalXp)} XP · 🌍 ${stats.courses.length}</text>
  `;
};

const renderAvatar = ({
  stats,
  palette,
}: {
  stats: UserStats;
  palette: Palette;
}) => {
  const initial = escapeXml(getInitial(stats.name));

  if (!stats.avatarUrl) {
    return {
      defs: "",
      avatar: `
        <circle cx="64" cy="62" r="32" fill="${palette.accent}" />
        <text x="64" y="74" text-anchor="middle" font-size="28" font-weight="700" fill="${palette.card}" font-family="${FONT_FAMILY}">${initial}</text>
      `,
    };
  }

  return {
    defs: `
      <clipPath id="avatar-clip">
        <circle cx="64" cy="62" r="32" />
      </clipPath>
    `,
    avatar: `
      <circle cx="64" cy="62" r="32" fill="${palette.chip}" stroke="${palette.border}" stroke-width="2" />
      <image href="${escapeXml(stats.avatarUrl)}" x="32" y="30" width="64" height="64" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar-clip)" />
    `,
  };
};

const pickLabelsByVariant = (
  stats: UserStats,
  options: CardOptions,
  variant: Exclude<CardVariant, "minimal">
) => {
  const selectedMetrics = getMetricsText(stats);
  const metricLabels = options.metrics.map((metric) => selectedMetrics[metric]);

  const languageLabels = stats.topLanguages
    .slice(0, options.langLimit)
    .map((language) => `${language.code.toUpperCase()} · ${formatNumber(language.xp)} XP`);

  if (variant === "compact") {
    return metricLabels.slice(0, 3);
  }

  if (variant === "badges") {
    return metricLabels.slice(0, 5);
  }

  return [...metricLabels, ...languageLabels];
};

const renderCardBody = (stats: UserStats, options: CardOptions) => {
  const palette = THEME_PALETTES[options.theme];
  const dimensions = CARD_DIMENSIONS[options.variant];

  const title = escapeXml(options.title ?? "Duolingo Streak Tracker");
  const name = escapeXml(stats.name);
  const username = escapeXml(stats.username);

  if (options.variant === "minimal") {
    return {
      dimensions,
      palette,
      defs: "",
      body: renderMinimal({ stats, options, palette }),
    };
  }

  const layout = CHIP_LAYOUT_BY_VARIANT[options.variant];
  const labels = pickLabelsByVariant(stats, options, options.variant);
  const chips = renderChips({
    labels,
    startX: 24,
    maxWidth: dimensions.width - 48,
    palette,
    layout,
  });

  if (options.variant === "badges") {
    return {
      dimensions,
      palette,
      defs: "",
      body: `
        <text x="24" y="36" font-size="18" font-weight="700" fill="${palette.text}" font-family="${FONT_FAMILY}">${title}</text>
        <text x="24" y="60" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${username}</text>
        ${chips}
      `,
    };
  }

  const avatar = renderAvatar({ stats, palette });

  return {
    dimensions,
    palette,
    defs: avatar.defs,
    body: `
      ${avatar.avatar}
      <text x="112" y="42" font-size="18" font-weight="700" fill="${palette.text}" font-family="${FONT_FAMILY}">${title}</text>
      <text x="112" y="68" font-size="17" fill="${palette.text}" font-family="${FONT_FAMILY}">${name}</text>
      <text x="112" y="90" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${username}</text>
      ${chips}
    `,
  };
};

export const renderUserCardSvg = (stats: UserStats, options: CardOptions) => {
  const { dimensions, palette, defs, body } = renderCardBody(stats, options);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" role="img" aria-label="Duolingo statistics card for ${escapeXml(
    stats.username
  )}">
  <defs>
    <linearGradient id="duo-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.background}" />
      <stop offset="100%" stop-color="${palette.card}" />
    </linearGradient>
    ${defs}
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
  <rect x="0" y="0" width="560" height="140" rx="16" fill="#1F2937" />
  <text x="24" y="52" font-size="20" font-weight="700" fill="#F9FAFB" font-family="${FONT_FAMILY}">Duolingo user not found</text>
  <text x="24" y="82" font-size="14" fill="#D1D5DB" font-family="${FONT_FAMILY}">We could not load public stats for @${safeUsername}</text>
</svg>
`.trim();
};
