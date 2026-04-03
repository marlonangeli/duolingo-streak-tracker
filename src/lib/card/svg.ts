import { getLanguageFlagCode } from "@/lib/language-flag-map";
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

type RenderAssets = {
  avatarDataUri?: string | null;
  flagDataUris?: Record<string, string>;
};

type ChipLayout = {
  startY: number;
  maxRows: number;
  maxChipWidth: number;
};

type CardRenderData = {
  body: string;
  defs: string;
  dimensions: { width: number; height: number };
  palette: Palette;
  useGradient: boolean;
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
    muted: "#CBD5E1",
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
  default: { width: 760, height: 252 },
  compact: { width: 600, height: 182 },
  minimal: { width: 500, height: 124 },
  badges: { width: 340, height: 64 },
};

const CHIP_LAYOUT_BY_VARIANT: Record<"default" | "compact", ChipLayout> = {
  default: {
    startY: 138,
    maxRows: 3,
    maxChipWidth: 280,
  },
  compact: {
    startY: 118,
    maxRows: 1,
    maxChipWidth: 215,
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

const buildMetricText = (stats: UserStats): Record<MetricKey, string | null> => ({
  streak: `🔥 ${stats.streak.toLocaleString("en-US")} day streak`,
  xp: `⚡ ${formatNumber(stats.totalXp)} XP total`,
  languages: `🌍 ${stats.courses.length} active language${stats.courses.length === 1 ? "" : "s"}`,
  league: stats.league.available
    ? `🏆 ${stats.league.tier ?? "League"} · #${stats.league.rank ?? "-"}`
    : null,
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

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="30" rx="15" fill="${palette.chip}" stroke="${palette.border}" />
      <text x="${x + 16}" y="${y + 20}" font-size="14" fill="${palette.chipText}" font-family="${FONT_FAMILY}">${escapeXml(label)}</text>
    </g>
  `;
};

const renderChips = (params: {
  labels: string[];
  startX: number;
  maxWidth: number;
  palette: Palette;
  layout: ChipLayout;
}) => {
  const { labels, startX, maxWidth, palette, layout } = params;
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
    const summary = `+${remaining} more`;
    const width = Math.max(104, summary.length * 7 + 32);

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
          label: summary,
          palette,
        })
      );
    }
  }

  return chips.join("\n");
};

const buildMetricLabels = (stats: UserStats, options: CardOptions, variant: CardVariant) => {
  const metricText = buildMetricText(stats);

  const metricLabels = options.metrics.flatMap((metric) => {
    const label = metricText[metric];
    return label ? [label] : [];
  });

  if (variant === "compact") {
    return metricLabels.slice(0, 2);
  }

  const languageLabels = stats.topLanguages
    .slice(0, options.langLimit)
    .map((language) => `${language.code.toUpperCase()} · ${formatNumber(language.xp)} XP`);

  return [...metricLabels, ...languageLabels];
};

const renderAvatar = (params: {
  stats: UserStats;
  palette: Palette;
  assets: RenderAssets;
  variant: "default" | "compact";
}) => {
  const { stats, palette, assets, variant } = params;

  const radius = variant === "compact" ? 27 : 31;
  const centerY = variant === "compact" ? 58 : 64;
  const centerX = 58;
  const clipId = `avatar-clip-${stats.id}-${variant}`;
  const safeInitial = escapeXml(getInitial(stats.name));

  if (!assets.avatarDataUri) {
    return {
      defs: "",
      avatar: `
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${palette.accent}" />
        <text x="${centerX}" y="${centerY + 12}" text-anchor="middle" font-size="26" font-weight="800" fill="${palette.card}" font-family="${FONT_FAMILY}">${safeInitial}</text>
      `,
    };
  }

  const size = radius * 2;
  const imageX = centerX - radius;
  const imageY = centerY - radius;

  return {
    defs: `
      <clipPath id="${clipId}">
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" />
      </clipPath>
    `,
    avatar: `
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${palette.chip}" stroke="${palette.border}" stroke-width="2" />
      <image href="${assets.avatarDataUri}" x="${imageX}" y="${imageY}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />
    `,
  };
};

const renderDefaultOrCompact = (params: {
  stats: UserStats;
  options: CardOptions;
  palette: Palette;
  variant: "default" | "compact";
  assets: RenderAssets;
}) => {
  const { stats, options, palette, variant, assets } = params;
  const dimensions = CARD_DIMENSIONS[variant];
  const title = escapeXml(options.title ?? "Duolingo Streak Tracker");
  const name = escapeXml(stats.name);
  const username = escapeXml(stats.username);
  const avatar = renderAvatar({ stats, palette, assets, variant });

  const labels = buildMetricLabels(stats, options, variant);
  const layout = CHIP_LAYOUT_BY_VARIANT[variant];

  const chips = renderChips({
    labels,
    startX: 24,
    maxWidth: dimensions.width - 48,
    palette,
    layout,
  });

  const titleY = variant === "compact" ? 34 : 38;
  const nameY = variant === "compact" ? 64 : 69;
  const usernameY = variant === "compact" ? 87 : 94;

  return {
    dimensions,
    palette,
    defs: avatar.defs,
    useGradient: true,
    body: `
      ${avatar.avatar}
      <text x="100" y="${titleY}" font-size="13" font-weight="700" fill="${palette.muted}" font-family="${FONT_FAMILY}">${title}</text>
      <text x="100" y="${nameY}" font-size="24" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${name}</text>
      <text x="100" y="${usernameY}" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${username}</text>
      ${chips}
    `,
  } satisfies CardRenderData;
};

const renderMinimal = (params: {
  stats: UserStats;
  options: CardOptions;
  palette: Palette;
}) => {
  const { stats, options, palette } = params;
  const dimensions = CARD_DIMENSIONS.minimal;
  const title = escapeXml(options.title ?? "Duolingo Streak Tracker");
  const name = escapeXml(stats.name);
  const username = escapeXml(stats.username);

  return {
    dimensions,
    palette,
    defs: "",
    useGradient: true,
    body: `
      <text x="24" y="24" font-size="12" font-weight="700" fill="${palette.muted}" font-family="${FONT_FAMILY}">${title}</text>
      <text x="24" y="56" font-size="24" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${name}</text>
      <text x="24" y="76" font-size="13" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${username}</text>

      <text x="24" y="104" font-size="16" font-weight="700" fill="${palette.text}" font-family="${FONT_FAMILY}">🔥 <tspan font-size="20" font-weight="800">${stats.streak.toLocaleString(
        "en-US"
      )}</tspan></text>
      <text x="248" y="104" font-size="16" font-weight="700" fill="${palette.text}" font-family="${FONT_FAMILY}">⚡ <tspan font-size="20" font-weight="800">${formatNumber(
        stats.totalXp
      )}</tspan> XP</text>
    `,
  } satisfies CardRenderData;
};

const renderBadgeFlags = (params: {
  stats: UserStats;
  assets: RenderAssets;
  startX: number;
}) => {
  const { stats, assets, startX } = params;
  const selected = stats.topLanguages.slice(0, 2);

  return selected
    .map((language, index) => {
      const countryCode = getLanguageFlagCode(language.code);
      if (!countryCode) {
        return "";
      }

      const flagDataUri = assets.flagDataUris?.[countryCode];

      if (!flagDataUri) {
        return "";
      }

      const x = startX + index * 22;

      return `
        <rect x="${x - 1}" y="22" width="20" height="16" rx="3" fill="#ffffff" opacity="0.22" />
        <image href="${flagDataUri}" x="${x}" y="23" width="18" height="14" preserveAspectRatio="xMidYMid slice" />
      `;
    })
    .join("\n");
};

const renderBadges = (params: {
  stats: UserStats;
  options: CardOptions;
  palette: Palette;
  assets: RenderAssets;
}) => {
  const { stats, options, palette, assets } = params;
  const selected = options.metrics.filter(
    (metric): metric is Extract<MetricKey, "streak" | "xp"> =>
      metric === "streak" || metric === "xp"
  );

  const picked: Array<Extract<MetricKey, "streak" | "xp">> =
    selected.length > 0 ? selected : ["streak"];
  const text = picked
    .flatMap((metric) => {
      if (metric === "streak") {
        return [`🔥 ${stats.streak.toLocaleString("en-US")}`];
      }

      return [`⚡ ${formatNumber(stats.totalXp)} XP`];
    })
    .join(" · ");

  const normalizedText = text || `🔥 ${stats.streak.toLocaleString("en-US")}`;
  const textLength = normalizedText.length;
  const flagCount = Math.min(2, stats.topLanguages.length);

  const width = Math.min(560, Math.max(188, 98 + textLength * 8 + flagCount * 22));
  const dimensions = {
    width,
    height: 64,
  };

  const textX = 52;
  const flagsX = Math.min(width - 50, textX + textLength * 7 + 14);
  const flags = renderBadgeFlags({
    stats,
    assets,
    startX: flagsX,
  });

  return {
    dimensions,
    palette,
    defs: "",
    useGradient: false,
    body: `
      <circle cx="24" cy="32" r="15" fill="#ffffff" />
      <circle cx="21" cy="30" r="4" fill="#58CC02" />
      <polygon points="24,34 31,37 24,40" fill="#FFB020" />

      <text x="${textX}" y="39" font-size="17" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(normalizedText)}</text>
      ${flags}
    `,
  } satisfies CardRenderData;
};

const getRenderData = (stats: UserStats, options: CardOptions, assets: RenderAssets) => {
  const palette = THEME_PALETTES[options.theme];

  if (options.variant === "badges") {
    return renderBadges({ stats, options, palette, assets });
  }

  if (options.variant === "minimal") {
    return renderMinimal({ stats, options, palette });
  }

  return renderDefaultOrCompact({
    stats,
    options,
    palette,
    variant: options.variant,
    assets,
  });
};

export const renderUserCardSvg = (
  stats: UserStats,
  options: CardOptions,
  assets: RenderAssets = {}
) => {
  const renderData = getRenderData(stats, options, assets);
  const { body, defs, dimensions, palette, useGradient } = renderData;

  const backgroundFill = useGradient ? 'url(#duo-bg)' : palette.background;
  const gradientDefinition = useGradient
    ? `
      <linearGradient id="duo-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.background}" />
        <stop offset="100%" stop-color="${palette.card}" />
      </linearGradient>
    `
    : "";

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" role="img" aria-label="Duolingo statistics card for ${escapeXml(
    stats.username
  )}">
  <defs>
    ${gradientDefinition}
    ${defs}
  </defs>

  <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="18" fill="${backgroundFill}" />
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
