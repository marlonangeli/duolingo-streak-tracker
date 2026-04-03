import {
  API_CORS_HEADERS,
  CARD_CACHE_CONTROL,
  STATS_CACHE_CONTROL,
} from "@/app/api/constants";
import { renderMissingUserSvg, renderUserCardSvg } from "@/lib/card/svg";
import { getUserStatsByUsername } from "@/lib/duolingo/client";
import { getLanguageFlagCode } from "@/lib/language-flag-map";
import { parseCardOptions } from "@/models/card";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const toDataUri = (mimeType: string, bytes: ArrayBuffer | ArrayBufferView) => {
  const buffer =
    bytes instanceof ArrayBuffer
      ? Buffer.from(bytes)
      : Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const buildAvatarDataUri = async (avatarUrl: string | null) => {
  if (!avatarUrl) {
    return null;
  }

  try {
    const response = await fetch(avatarUrl, {
      method: "GET",
      next: {
        revalidate: 60 * 60,
      },
    });

    if (!response.ok) {
      return null;
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const headerMimeType = response.headers
      .get("content-type")
      ?.split(";")[0]
      .trim();
    const mimeType =
      headerMimeType && headerMimeType.includes("/")
        ? headerMimeType
        : "image/jpeg";

    return toDataUri(mimeType, bytes);
  } catch {
    return null;
  }
};

const buildFlagDataUris = async (languageCodes: string[]) => {
  const uniqueCountryCodes = Array.from(
    new Set(
      languageCodes
        .map((languageCode) => getLanguageFlagCode(languageCode))
        .filter((countryCode): countryCode is string => Boolean(countryCode))
    )
  );

  const pairs = await Promise.all(
    uniqueCountryCodes.map(async (countryCode) => {
      const filePath = path.join(process.cwd(), "public", "flags", `${countryCode}.svg`);

      try {
        const bytes = await readFile(filePath);
        return [countryCode, toDataUri("image/svg+xml", bytes)] as const;
      } catch {
        return [countryCode, ""] as const;
      }
    })
  );

  return Object.fromEntries(pairs.filter(([, value]) => value.length > 0));
};

export async function GET(
  request: Request,
  context: { params: Promise<{ user: string }> }
) {
  const { user } = await context.params;

  const searchParams = new URL(request.url).searchParams;
  const options = parseCardOptions(searchParams);

  try {
    const userStats = await getUserStatsByUsername(user);

    if (!userStats) {
      return new Response(renderMissingUserSvg(user), {
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
      buildFlagDataUris(userStats.topLanguages.map((language) => language.code)),
    ]);

    const svg = renderUserCardSvg(userStats, options, {
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
    return new Response(renderMissingUserSvg(user), {
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
