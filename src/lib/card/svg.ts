import { CARD_THEME_META } from "@/lib/card-theme";
import { getLanguageFlagCode } from "@/lib/language-flag-map";
import type { CardOptions, CardTheme, CardVariant } from "@/models/card";
import type { UserStats } from "@/models/user";

type RenderAssets = {
  avatarDataUri?: string | null;
  duoIconDataUri?: string | null;
  errorIllustrationDataUri?: string | null;
  flagDataUris?: Record<string, string>;
  streakIconDataUri?: string | null;
  streakInactiveIconDataUri?: string | null;
  xpIconDataUri?: string | null;
};

type Palette = (typeof CARD_THEME_META)[CardTheme];

type RenderResult = {
  body: string;
  defs: string;
  dimensions: { height: number; width: number };
  palette: Palette;
};

type SvgFragment = {
  defs: string;
  markup: string;
};

export const CARD_DIMENSIONS: Record<
  CardVariant,
  { height: number; width: number }
> = {
  default: { width: 620, height: 216 },
  compact: { width: 500, height: 184 },
  minimal: { width: 460, height: 126 },
  badges: { width: 300, height: 64 },
};

const FONT_FAMILY = "Nunito, Inter, Segoe UI, sans-serif";
const CARD_OUTER_RADIUS = 16;
const CARD_INNER_RADIUS = 15;
const METRIC_CARD_RADIUS = 14;
const FLAG_RADIUS = 4;

const escapeXml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const formatPlainNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    useGrouping: false,
    maximumFractionDigits: 0,
  }).format(value);

const getYearFromDate = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime())) {
    return String(parsedDate.getUTCFullYear());
  }

  return value.match(/\d{4}/)?.[0] ?? null;
};

const getStreakSinceLabel = (stats: UserStats) => {
  const year = getYearFromDate(stats.streakWindow?.startDate);

  return year ? `Since ${year}` : undefined;
};

const getFlagStripWidth = (flagCount: number, remaining: number) => {
  if (flagCount === 0) {
    return 0;
  }

  return flagCount * 28 + Math.max(flagCount - 1, 0) * 8 + (remaining > 0 ? 34 : 0);
};

const getStreakIcon = (assets: RenderAssets, streak: number) =>
  streak > 0
    ? assets.streakIconDataUri
    : (assets.streakInactiveIconDataUri ?? assets.streakIconDataUri);

const renderImage = (params: {
  extra?: string;
  height: number;
  href?: string | null;
  width: number;
  x: number;
  y: number;
}) => {
  const { extra = "", height, href, width, x, y } = params;

  if (!href) {
    return "";
  }

  return `<image href="${href}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" ${extra} />`;
};

const renderAvatar = (params: {
  assets: RenderAssets;
  fallbackName: string;
  palette: Palette;
  size: number;
  variant: string;
  x: number;
  y: number;
}) => {
  const { assets, fallbackName, palette, size, variant, x, y } = params;
  const clipId = `avatar-${variant}-${fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const radius = size / 2;
  const centerX = x + radius;
  const centerY = y + radius;
  const initial = escapeXml(
    fallbackName.trim().slice(0, 1).toUpperCase() || "D",
  );

  if (!assets.avatarDataUri) {
    return {
      defs: "",
      markup: `
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${palette.surface}" stroke="${palette.border}" stroke-width="2" />
        <text x="${centerX}" y="${centerY + 12}" text-anchor="middle" font-size="28" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${initial}</text>
      `,
    };
  }

  return {
    defs: `
      <clipPath id="${clipId}">
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" />
      </clipPath>
    `,
    markup: `
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${palette.surface}" stroke="${palette.border}" stroke-width="2" />
      ${renderImage({
        href: assets.avatarDataUri,
        x,
        y,
        width: size,
        height: size,
        extra: `clip-path="url(#${clipId})"`,
      })}
    `,
  };
};

const renderTitleLockup = (params: {
  align: "left" | "right";
  assets: RenderAssets;
  dimensions: { width: number };
  palette: Palette;
  title: string;
  x: number;
  y: number;
}) => {
  const { align, assets, dimensions, palette, title, x, y } = params;
  const iconSize = 24;
  const gap = 8;

  if (align === "right") {
    const iconX = dimensions.width - 20 - iconSize;
    const textX = iconX - gap;

    return `
      <text x="${textX}" y="${y + 17}" text-anchor="end" font-size="10.5" font-weight="800" fill="${palette.muted}" font-family="${FONT_FAMILY}">${escapeXml(title)}</text>
      ${renderImage({ href: assets.duoIconDataUri, x: iconX, y, width: iconSize, height: iconSize })}
    `;
  }

  return `
    ${renderImage({ href: assets.duoIconDataUri, x, y, width: iconSize, height: iconSize })}
    <text x="${x + iconSize + gap}" y="${y + 17}" font-size="11" font-weight="800" fill="${palette.muted}" font-family="${FONT_FAMILY}">${escapeXml(title)}</text>
  `;
};

const renderMetricCard = (params: {
  detail?: string;
  height?: number;
  icon?: string | null;
  label: string;
  palette: Palette;
  suffix?: string;
  value: string;
  width: number;
  x: number;
  y: number;
}) => {
  const {
    detail,
    height = 56,
    icon,
    label,
    palette,
    suffix,
    value,
    width,
    x,
    y,
  } = params;
  const hasDetail = Boolean(detail);
  const textX = icon ? x + 44 : x + 16;
  const iconY = y + (hasDetail ? 14 : height > 56 ? 16 : 14);
  const valueY = y + (hasDetail ? 40 : height > 56 ? 43 : 41);
  const detailY = y + height - 10;

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${METRIC_CARD_RADIUS}" fill="${palette.chip}" stroke="${palette.chipBorder}" stroke-width="2" />
      ${renderImage({ href: icon, x: x + 14, y: iconY, width: 20, height: 24 })}
      <text x="${textX}" y="${y + 18}" font-size="11" font-weight="800" fill="${palette.muted}" font-family="${FONT_FAMILY}" letter-spacing="0.45">${escapeXml(label)}</text>
      <text x="${textX}" y="${valueY}" font-size="21" font-weight="800" fill="${palette.chipText}" font-family="${FONT_FAMILY}">${escapeXml(value)}${
        suffix
          ? ` <tspan font-size="14" font-weight="800">${escapeXml(suffix)}</tspan>`
          : ""
      }</text>
      ${
        detail
          ? `<text x="${textX}" y="${detailY}" font-size="10.5" font-weight="700" fill="${palette.muted}" font-family="${FONT_FAMILY}">${escapeXml(detail)}</text>`
          : ""
      }
    </g>
  `;
};

const getFlagDataUri = (assets: RenderAssets, languageCode: string) => {
  const countryCode = getLanguageFlagCode(languageCode);

  if (!countryCode) {
    return null;
  }

  return assets.flagDataUris?.[countryCode] ?? null;
};

const renderFlag = (params: {
  assets: RenderAssets;
  languageCode: string;
  x: number;
  y: number;
}) => {
  const { assets, languageCode, x, y } = params;
  const flagDataUri = getFlagDataUri(assets, languageCode);
  const clipId = `flag-${languageCode}-${x}-${y}`;

  if (!flagDataUri) {
    return {
      defs: "",
      markup: `
        <rect x="${x}" y="${y}" width="28" height="22" rx="${FLAG_RADIUS}" fill="#FFFFFF" opacity="0.18" />
        <text x="${x + 14}" y="${y + 15}" text-anchor="middle" font-size="9" font-weight="800" fill="#FFFFFF" font-family="${FONT_FAMILY}">${escapeXml(languageCode.toUpperCase())}</text>
      `,
    } satisfies SvgFragment;
  }

  return {
    defs: `
      <clipPath id="${clipId}">
        <rect x="${x + 2}" y="${y + 3}" width="24" height="16" rx="${FLAG_RADIUS}" />
      </clipPath>
    `,
    markup: `
      <rect x="${x}" y="${y}" width="28" height="22" rx="${FLAG_RADIUS}" fill="#FFFFFF" opacity="0.18" />
      ${renderImage({
        href: flagDataUri,
        x: x + 2,
        y: y + 3,
        width: 24,
        height: 16,
        extra: `clip-path="url(#${clipId})"`,
      })}
    `,
  } satisfies SvgFragment;
};

const renderFlagSummary = (params: {
  count: number;
  palette: Palette;
  x: number;
  y: number;
}) => {
  const { count, palette, x, y } = params;

  return `
    <g>
      <rect x="${x}" y="${y}" width="26" height="22" rx="${FLAG_RADIUS}" fill="${palette.surface}" stroke="${palette.border}" stroke-width="2" />
      <text x="${x + 13}" y="${y + 15}" text-anchor="middle" font-size="11" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">+${count}</text>
    </g>
  `;
};

const renderFlagStrip = (params: {
  assets: RenderAssets;
  codes: string[];
  palette: Palette;
  remaining: number;
  startX: number;
  y: number;
}) => {
  const { assets, codes, palette, remaining, startX, y } = params;
  const gap = 8;

  const flags = codes.map((code, index) =>
    renderFlag({
      assets,
      languageCode: code,
      x: startX + index * (28 + gap),
      y,
    }),
  );
  const summaryX = startX + codes.length * (28 + gap);

  return {
    defs: flags.map((flag) => flag.defs).join("\n"),
    markup: `${flags.map((flag) => flag.markup).join("\n")}${
      remaining > 0
        ? renderFlagSummary({ count: remaining, palette, x: summaryX, y })
        : ""
    }`,
  } satisfies SvgFragment;
};

const renderDefaultCard = (params: {
  assets: RenderAssets;
  palette: Palette;
  stats: UserStats;
  title: string;
}) => {
  const { assets, palette, stats, title } = params;
  const dimensions = CARD_DIMENSIONS.default;
  const streakCardX = 20;
  const metricCardWidth = 282;
  const metricCardY = 130;
  const xpCardX = 318;
  const flagCodes = stats.topLanguages
    .slice(0, 3)
    .map((language) => language.code);
  const remaining = Math.max(0, stats.courses.length - flagCodes.length);
  const flagStripWidth = getFlagStripWidth(flagCodes.length, remaining);
  const flagStartX = Math.round(xpCardX + (metricCardWidth - flagStripWidth) / 2);
  const avatar = renderAvatar({
    assets,
    fallbackName: stats.name,
    palette,
    size: 64,
    variant: "default",
    x: 28,
    y: 24,
  });
  const streakIcon = getStreakIcon(assets, stats.streak);
  const streakSinceLabel = getStreakSinceLabel(stats);
  const flags = renderFlagStrip({
    assets,
    codes: flagCodes,
    palette,
    remaining,
    startX: flagStartX,
    y: 92,
  });

  return {
    dimensions,
    palette,
    defs: `${avatar.defs}${flags.defs}`,
    body: `
      ${avatar.markup}
      ${renderTitleLockup({ align: "right", assets, dimensions, palette, title, x: 0, y: 18 })}
      <text x="110" y="56" font-size="24" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(stats.name)}</text>
      <text x="110" y="78" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${escapeXml(stats.username)}</text>

      ${flags.markup}

      ${renderMetricCard({
        detail: streakSinceLabel,
        height: 66,
        icon: streakIcon,
        label: "STREAK",
        palette,
        value: formatPlainNumber(stats.streak),
        width: metricCardWidth,
        x: streakCardX,
        y: metricCardY,
      })}
      ${renderMetricCard({
        height: 66,
        icon: assets.xpIconDataUri,
        label: "XP",
        palette,
        suffix: "XP",
        value: formatCompactNumber(stats.totalXp),
        width: metricCardWidth,
        x: xpCardX,
        y: metricCardY,
      })}
    `,
  } satisfies RenderResult;
};

const renderCompactCard = (params: {
  assets: RenderAssets;
  palette: Palette;
  stats: UserStats;
  title: string;
}) => {
  const { assets, palette, stats, title } = params;
  const dimensions = CARD_DIMENSIONS.compact;
  const xpCardX = 264;
  const xpCardWidth = 212;
  const flagCodes = stats.topLanguages
    .slice(0, 3)
    .map((language) => language.code);
  const remaining = Math.max(0, stats.courses.length - flagCodes.length);
  const flagStripWidth = getFlagStripWidth(flagCodes.length, remaining);
  const flagStartX = Math.round(xpCardX + (xpCardWidth - flagStripWidth) / 2);
  const avatar = renderAvatar({
    assets,
    fallbackName: stats.name,
    palette,
    size: 56,
    variant: "compact",
    x: 24,
    y: 22,
  });
  const streakIcon = getStreakIcon(assets, stats.streak);
  const flags = renderFlagStrip({
    assets,
    codes: flagCodes,
    palette,
    remaining,
    startX: flagStartX,
    y: 88,
  });

  return {
    dimensions,
    palette,
    defs: `${avatar.defs}${flags.defs}`,
    body: `
      ${avatar.markup}
      ${renderTitleLockup({ align: "right", assets, dimensions, palette, title, x: 0, y: 16 })}
      <text x="92" y="52" font-size="22" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(stats.name)}</text>
      <text x="92" y="72" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${escapeXml(stats.username)}</text>

      ${flags.markup}

      ${renderMetricCard({
        icon: streakIcon,
        label: "STREAK",
        palette,
        value: formatPlainNumber(stats.streak),
        width: 212,
        x: 24,
        y: 116,
      })}
      ${renderMetricCard({
        icon: assets.xpIconDataUri,
        label: "XP",
        palette,
        suffix: "XP",
        value: formatCompactNumber(stats.totalXp),
        width: 212,
        x: xpCardX,
        y: 116,
      })}
    `,
  } satisfies RenderResult;
};

const renderMinimalCard = (params: {
  assets: RenderAssets;
  palette: Palette;
  stats: UserStats;
  title: string;
}) => {
  const { assets, palette, stats, title } = params;
  const dimensions = CARD_DIMENSIONS.minimal;
  const streakIcon = getStreakIcon(assets, stats.streak);

  return {
    dimensions,
    palette,
    defs: "",
    body: `
      ${renderTitleLockup({ align: "right", assets, dimensions, palette, title, x: 0, y: 16 })}
      <text x="24" y="50" font-size="28" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(stats.name)}</text>
      <text x="24" y="72" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${escapeXml(stats.username)}</text>

      ${renderImage({ href: streakIcon, x: 24, y: 88, width: 16, height: 20 })}
      <text x="46" y="106" font-size="16" font-weight="700" fill="${palette.text}" font-family="${FONT_FAMILY}"><tspan font-size="22" font-weight="800">${formatPlainNumber(
        stats.streak,
      )}</tspan> streak</text>

      ${renderImage({ href: assets.xpIconDataUri, x: 258, y: 86, width: 18, height: 24 })}
      <text x="282" y="106" font-size="16" font-weight="700" fill="${palette.text}" font-family="${FONT_FAMILY}"><tspan font-size="22" font-weight="800">${formatCompactNumber(
        stats.totalXp,
      )}</tspan> XP</text>
    `,
  } satisfies RenderResult;
};

const renderBadgeCard = (params: {
  assets: RenderAssets;
  options: CardOptions;
  palette: Palette;
  stats: UserStats;
}) => {
  const { assets, options, palette, stats } = params;
  const showXp = options.metrics.includes("xp");
  const showStreak = options.metrics.includes("streak") || !showXp;
  const streakIcon = getStreakIcon(assets, stats.streak);
  const badgeHeight = CARD_DIMENSIONS.badges.height;
  const tileWidth = badgeHeight;
  const tileRadius = CARD_OUTER_RADIUS;
  const badgePalette = {
    ...palette,
    background: "#1F1F1F",
    border: "#1F1F1F",
    text: "#FFFFFF",
    muted: "#D7D7D7",
  };

  const streakValue = formatPlainNumber(stats.streak);
  const xpValue = formatCompactNumber(stats.totalXp);
  const leftPadding = 12;
  const rightPadding = 26;
  const iconGap = 8;
  const metricGap = 18;
  const streakIconSize = { width: 16, height: 20 };
  const xpIconSize = { width: 18, height: 24 };
  const streakTextWidth = streakValue.length * 10;
  const xpTextWidth = xpValue.length * 10;
  const width = Math.max(
    220,
    tileWidth +
      leftPadding +
      rightPadding +
      (showStreak
        ? streakIconSize.width + iconGap + streakTextWidth
        : 0) +
      (showXp
        ? metricGap + xpIconSize.width + iconGap + xpTextWidth
        : 0),
  );

  const duoSize = badgeHeight - 20;
  const duoOffset = Math.round((tileWidth - duoSize) / 2);
  const textY = 40;
  let cursorX = tileWidth + leftPadding;
  const parts = [
    `<path d="M${tileRadius} 0 H${tileWidth} V${badgeHeight} H${tileRadius} A${tileRadius} ${tileRadius} 0 0 1 0 ${badgeHeight - tileRadius} V${tileRadius} A${tileRadius} ${tileRadius} 0 0 1 ${tileRadius} 0 Z" fill="#58CC02" />`,
    renderImage({
      href: assets.duoIconDataUri,
      x: duoOffset,
      y: duoOffset,
      width: duoSize,
      height: duoSize,
    }),
  ];

  if (showStreak) {
    const iconY = Math.round((badgeHeight - streakIconSize.height) / 2);
    parts.push(
      renderImage({
        href: streakIcon,
        x: cursorX,
        y: iconY,
        width: streakIconSize.width,
        height: streakIconSize.height,
      }),
    );
    cursorX += streakIconSize.width + iconGap;
    parts.push(
      `<text x="${cursorX}" y="${textY}" font-size="20" font-weight="800" fill="${badgePalette.text}" font-family="${FONT_FAMILY}">${escapeXml(
        streakValue,
      )}</text>`,
    );
    cursorX += streakTextWidth;
  }

  if (showXp) {
    cursorX += metricGap;
    const iconY = Math.round((badgeHeight - xpIconSize.height) / 2);
    parts.push(
      renderImage({
        href: assets.xpIconDataUri,
        x: cursorX,
        y: iconY,
        width: xpIconSize.width,
        height: xpIconSize.height,
      }),
    );
    cursorX += xpIconSize.width + iconGap;
    parts.push(
      `<text x="${cursorX}" y="${textY}" font-size="20" font-weight="800" fill="${badgePalette.text}" font-family="${FONT_FAMILY}">${escapeXml(
        xpValue,
      )}</text>`,
    );
  }

  return {
    dimensions: { width, height: badgeHeight },
    palette: badgePalette,
    defs: "",
    body: parts.join("\n"),
  } satisfies RenderResult;
};

const getTitle = (options: CardOptions) =>
  options.title ?? "Duolingo Streak Tracker";

const renderVariant = (
  stats: UserStats,
  options: CardOptions,
  assets: RenderAssets,
) => {
  const palette = CARD_THEME_META[options.theme];
  const title = getTitle(options);

  if (options.variant === "badges") {
    return renderBadgeCard({ assets, options, palette, stats });
  }

  if (options.variant === "minimal") {
    return renderMinimalCard({ assets, palette, stats, title });
  }

  if (options.variant === "compact") {
    return renderCompactCard({ assets, palette, stats, title });
  }

  return renderDefaultCard({ assets, palette, stats, title });
};

export const renderUserCardSvg = (
  stats: UserStats,
  options: CardOptions,
  assets: RenderAssets = {},
) => {
  const { body, defs, dimensions, palette } = renderVariant(
    stats,
    options,
    assets,
  );

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}" role="img" aria-label="Duolingo statistics card for ${escapeXml(
    stats.username,
  )}">
  <defs>${defs}</defs>
  <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="${CARD_OUTER_RADIUS}" fill="${palette.background}" />
  <rect x="1" y="1" width="${dimensions.width - 2}" height="${dimensions.height - 2}" rx="${CARD_INNER_RADIUS}" fill="none" stroke="${palette.border}" />
  ${body}
</svg>
`.trim();
};

export const renderMissingUserSvg = (
  username: string,
  assets: RenderAssets = {},
) => {
  const safeUsername = escapeXml(username);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="176" viewBox="0 0 520 176" role="img" aria-label="Duolingo user not found">
  <rect x="0" y="0" width="520" height="176" rx="24" fill="#F7F7F7" />
  <rect x="1" y="1" width="518" height="174" rx="23" fill="none" stroke="#E5E5E5" />
  ${renderImage({ href: assets.errorIllustrationDataUri, x: 360, y: 14, width: 126, height: 126 })}
  <text x="28" y="48" font-size="13" font-weight="800" fill="#777777" font-family="${FONT_FAMILY}">PROFILE LOOKUP</text>
  <text x="28" y="86" font-size="30" font-weight="800" fill="#4B4B4B" font-family="${FONT_FAMILY}">User not found</text>
  <text x="28" y="114" font-size="15" fill="#777777" font-family="${FONT_FAMILY}">We could not load public stats for @${safeUsername}.</text>
</svg>
`.trim();
};
