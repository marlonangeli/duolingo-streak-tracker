import {
  API_CORS_HEADERS,
  CARD_CACHE_CONTROL,
  STATS_CACHE_CONTROL,
} from "@/app/api/constants";
import { renderMissingUserSvg, renderUserCardSvg } from "@/lib/card/svg";
import { getUserStatsByUsername } from "@/lib/duolingo/client";
import { getLanguageFlagCode } from "@/lib/language-flag-map";
import { parseCardOptions } from "@/models/card";

export const runtime = "nodejs";

const toDataUri = (mimeType: string, bytes: ArrayBuffer | ArrayBufferView) => {
  const buffer =
    bytes instanceof ArrayBuffer
      ? Buffer.from(bytes)
      : Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const getResponseMimeType = (response: Response, fallbackMimeType: string) => {
  const headerMimeType = response.headers.get("content-type")?.split(";")[0].trim();

  return headerMimeType && headerMimeType.includes("/")
    ? headerMimeType
    : fallbackMimeType;
};

const buildFetchedAssetDataUri = async (
  assetUrl: string | URL,
  fallbackMimeType: string,
) => {
  try {
    const response = await fetch(assetUrl, {
      method: "GET",
      next: {
        revalidate: 60 * 60,
      },
    });

    if (!response.ok) {
      return null;
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    return toDataUri(
      getResponseMimeType(response, fallbackMimeType),
      bytes,
    );
  } catch {
    return null;
  }
};

const buildAvatarDataUri = async (avatarUrl: string | null) => {
  if (!avatarUrl) {
    return null;
  }

  return buildFetchedAssetDataUri(avatarUrl, "image/jpeg");
};

const buildFlagDataUris = async (
  requestUrl: string,
  languageCodes: string[],
) => {
  const uniqueCountryCodes = Array.from(
    new Set(
      languageCodes
        .map((languageCode) => getLanguageFlagCode(languageCode))
        .filter((countryCode): countryCode is string => Boolean(countryCode)),
    ),
  );

  const pairs = await Promise.all(
    uniqueCountryCodes.map(async (countryCode) => {
      const flagDataUri = await buildFetchedAssetDataUri(
        new URL(`/flags/${countryCode}.svg`, requestUrl),
        "image/svg+xml",
      );

      if (!flagDataUri) {
        return [countryCode, ""] as const;
      }

      return [countryCode, flagDataUri] as const;
    }),
  );

  return Object.fromEntries(pairs.filter(([, value]) => value.length > 0));
};

const buildSharedCardAssets = async (requestUrl: string) => {
  const [
    duoIconDataUri,
    errorIllustrationDataUri,
    streakIconDataUri,
    streakInactiveIconDataUri,
    xpIconDataUri,
  ] = await Promise.all([
    buildFetchedAssetDataUri(new URL("/icon.svg", requestUrl), "image/svg+xml"),
    buildFetchedAssetDataUri(
      new URL("/brand/characters/duo-error.svg", requestUrl),
      "image/svg+xml",
    ),
    buildFetchedAssetDataUri(
      new URL("/brand/icons/streak.svg", requestUrl),
      "image/svg+xml",
    ),
    buildFetchedAssetDataUri(
      new URL("/brand/icons/streak-inactive.svg", requestUrl),
      "image/svg+xml",
    ),
    buildFetchedAssetDataUri(
      new URL("/brand/icons/xp.svg", requestUrl),
      "image/svg+xml",
    ),
  ]);

  return {
    duoIconDataUri,
    errorIllustrationDataUri,
    streakIconDataUri,
    streakInactiveIconDataUri,
    xpIconDataUri,
  };
};

export async function GET(
  request: Request,
  context: { params: Promise<{ user: string }> },
) {
  const { user } = await context.params;

  const searchParams = new URL(request.url).searchParams;
  const options = parseCardOptions(searchParams);
  const sharedAssets = await buildSharedCardAssets(request.url);

  try {
    const userStats = await getUserStatsByUsername(user);

    if (!userStats) {
      return new Response(renderMissingUserSvg(user, sharedAssets), {
        status: 404,
        headers: {
          ...API_CORS_HEADERS,
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": STATS_CACHE_CONTROL,
        },
      });
    }

    const [avatarDataUri, flagDataUris] = await Promise.all([
      buildAvatarDataUri(userStats.avatarUrl),
      buildFlagDataUris(
        request.url,
        userStats.topLanguages.map((language) => language.code),
      ),
    ]);

    const svg = renderUserCardSvg(userStats, options, {
      ...sharedAssets,
      avatarDataUri,
      flagDataUris,
    });

    return new Response(svg, {
      status: 200,
      headers: {
        ...API_CORS_HEADERS,
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": CARD_CACHE_CONTROL,
      },
    });
  } catch {
    return new Response(renderMissingUserSvg(user, sharedAssets), {
      status: 502,
      headers: {
        ...API_CORS_HEADERS,
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": STATS_CACHE_CONTROL,
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: API_CORS_HEADERS,
  });
}
