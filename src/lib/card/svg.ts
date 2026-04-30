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
  xpIconDataUri?: string | null;
};

type Palette = (typeof CARD_THEME_META)[CardTheme];

type RenderResult = {
  body: string;
  defs: string;
  dimensions: { height: number; width: number };
  palette: Palette;
};

export const CARD_DIMENSIONS: Record<
  CardVariant,
  { height: number; width: number }
> = {
  default: { width: 680, height: 232 },
  compact: { width: 540, height: 192 },
  minimal: { width: 460, height: 126 },
  badges: { width: 300, height: 64 },
};

const FONT_FAMILY = "Nunito, Inter, Segoe UI, sans-serif";

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
  icon?: string | null;
  label: string;
  palette: Palette;
  suffix?: string;
  value: string;
  width: number;
  x: number;
  y: number;
}) => {
  const { icon, label, palette, suffix, value, width, x, y } = params;
  const textX = icon ? x + 44 : x + 16;

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="56" rx="18" fill="${palette.chip}" stroke="${palette.chipBorder}" stroke-width="2" />
      ${renderImage({ href: icon, x: x + 14, y: y + 14, width: 20, height: 24 })}
      <text x="${textX}" y="${y + 18}" font-size="11" font-weight="800" fill="${palette.muted}" font-family="${FONT_FAMILY}" letter-spacing="0.45">${escapeXml(label)}</text>
      <text x="${textX}" y="${y + 41}" font-size="21" font-weight="800" fill="${palette.chipText}" font-family="${FONT_FAMILY}">${escapeXml(value)}${
        suffix
          ? ` <tspan font-size="14" font-weight="800">${escapeXml(suffix)}</tspan>`
          : ""
      }</text>
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

  return `
    <rect x="${x}" y="${y}" width="28" height="22" rx="7" fill="#FFFFFF" opacity="0.18" />
    ${renderImage({ href: flagDataUri, x: x + 2, y: y + 3, width: 24, height: 16 })}
  `;
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
      <rect x="${x}" y="${y}" width="26" height="22" rx="7" fill="${palette.surface}" stroke="${palette.border}" stroke-width="2" />
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

  const flags = codes
    .map((code, index) =>
      renderFlag({
        assets,
        languageCode: code,
        x: startX + index * (28 + gap),
        y,
      }),
    )
    .join("\n");

  const summaryX = startX + codes.length * (28 + gap);

  return `${flags}${remaining > 0 ? renderFlagSummary({ count: remaining, palette, x: summaryX, y }) : ""}`;
};

const renderDefaultCard = (params: {
  assets: RenderAssets;
  palette: Palette;
  stats: UserStats;
  title: string;
}) => {
  const { assets, palette, stats, title } = params;
  const dimensions = CARD_DIMENSIONS.default;
  const avatar = renderAvatar({
    assets,
    fallbackName: stats.name,
    palette,
    size: 72,
    variant: "default",
    x: 28,
    y: 28,
  });

  const flagCodes = stats.topLanguages
    .slice(0, 3)
    .map((language) => language.code);
  const remaining = Math.max(0, stats.courses.length - flagCodes.length);

  return {
    dimensions,
    palette,
    defs: avatar.defs,
    body: `
      ${avatar.markup}
      ${renderTitleLockup({ align: "left", assets, dimensions, palette, title, x: 118, y: 20 })}
      <text x="118" y="72" font-size="28" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(stats.name)}</text>
      <text x="118" y="96" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${escapeXml(stats.username)}</text>

      ${renderMetricCard({
        icon: assets.streakIconDataUri,
        label: "STREAK",
        palette,
        value: stats.streak.toLocaleString("en-US"),
        width: 196,
        x: 24,
        y: 126,
      })}
      ${renderMetricCard({
        icon: assets.xpIconDataUri,
        label: "XP",
        palette,
        suffix: "XP",
        value: formatCompactNumber(stats.totalXp),
        width: 196,
        x: 242,
        y: 126,
      })}
      ${renderMetricCard({
        label: "LANGUAGES",
        palette,
        suffix: stats.courses.length === 1 ? "language" : "languages",
        value: stats.courses.length.toLocaleString("en-US"),
        width: 216,
        x: 460,
        y: 126,
      })}

      ${renderFlagStrip({ assets, codes: flagCodes, palette, remaining, startX: 24, y: 198 })}
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
  const avatar = renderAvatar({
    assets,
    fallbackName: stats.name,
    palette,
    size: 64,
    variant: "compact",
    x: 24,
    y: 26,
  });

  const flagCodes = stats.topLanguages
    .slice(0, 3)
    .map((language) => language.code);
  const remaining = Math.max(0, stats.courses.length - flagCodes.length);

  return {
    dimensions,
    palette,
    defs: avatar.defs,
    body: `
      ${avatar.markup}
      ${renderTitleLockup({ align: "left", assets, dimensions, palette, title, x: 102, y: 18 })}
      <text x="102" y="66" font-size="26" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(stats.name)}</text>
      <text x="102" y="88" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${escapeXml(stats.username)}</text>

      ${renderFlagStrip({ assets, codes: flagCodes, palette, remaining, startX: 102, y: 98 })}

      ${renderMetricCard({
        icon: assets.streakIconDataUri,
        label: "STREAK",
        palette,
        value: stats.streak.toLocaleString("en-US"),
        width: 236,
        x: 24,
        y: 126,
      })}
      ${renderMetricCard({
        icon: assets.xpIconDataUri,
        label: "XP",
        palette,
        suffix: "XP",
        value: formatCompactNumber(stats.totalXp),
        width: 236,
        x: 280,
        y: 126,
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

  return {
    dimensions,
    palette,
    defs: "",
    body: `
      ${renderTitleLockup({ align: "right", assets, dimensions, palette, title, x: 0, y: 16 })}
      <text x="24" y="50" font-size="28" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(stats.name)}</text>
      <text x="24" y="72" font-size="14" fill="${palette.muted}" font-family="${FONT_FAMILY}">@${escapeXml(stats.username)}</text>

      ${renderImage({ href: assets.streakIconDataUri, x: 24, y: 88, width: 16, height: 20 })}
      <text x="46" y="106" font-size="16" font-weight="700" fill="${palette.text}" font-family="${FONT_FAMILY}"><tspan font-size="22" font-weight="800">${stats.streak.toLocaleString(
        "en-US",
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

  const streakValue = stats.streak.toLocaleString("en-US");
  const xpValue = `${formatCompactNumber(stats.totalXp)} XP`;
  const width = Math.max(
    186,
    Math.min(
      320,
      72 +
        (showStreak ? streakValue.length * 10 + 36 : 0) +
        (showXp ? xpValue.length * 8 + 54 : 0),
    ),
  );

  let cursorX = 46;
  const parts = [
    // TODO: Duolingo image should be bigger to match entire height of the frame, should fill the gap on the left and remove the extra padding on the right
    renderImage({
      href: assets.duoIconDataUri,
      x: 14,
      y: 14,
      width: 24,
      height: 24,
    }),
    // TODO: remove this separator
    // `<text x="${cursorX}" y="39" font-size="15" font-weight="800" fill="${palette.muted}" font-family="${FONT_FAMILY}">|</text>`,
  ];
  cursorX += 14;

  if (showStreak) {
    parts.push(
      renderImage({
        href: assets.streakIconDataUri,
        x: cursorX,
        y: 20,
        width: 14,
        height: 18,
      }),
    );
    cursorX += 20;
    parts.push(
      `<text x="${cursorX}" y="39" font-size="20" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(
        streakValue,
      )}</text>`,
    );
    cursorX += Math.max(34, streakValue.length * 10);
  }

  if (showXp) {
    parts
      .push // TODO: can remove this separator
      // `<text x="${cursorX}" y="39" font-size="14" font-weight="800" fill="${palette.muted}" font-family="${FONT_FAMILY}">-</text>`,
      ();
    cursorX += 14;
    parts.push(
      renderImage({
        href: assets.xpIconDataUri,
        x: cursorX,
        y: 18,
        width: 16,
        height: 22,
      }),
    );
    cursorX += 22;
    parts.push(
      `<text x="${cursorX}" y="39" font-size="20" font-weight="800" fill="${palette.text}" font-family="${FONT_FAMILY}">${escapeXml(
        xpValue,
      )}</text>`,
    );
  }

  return {
    dimensions: { width, height: CARD_DIMENSIONS.badges.height },
    palette,
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
  <rect x="0" y="0" width="${dimensions.width}" height="${dimensions.height}" rx="18" fill="${palette.background}" />
  <rect x="1" y="1" width="${dimensions.width - 2}" height="${dimensions.height - 2}" rx="17" fill="none" stroke="${palette.border}" />
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
