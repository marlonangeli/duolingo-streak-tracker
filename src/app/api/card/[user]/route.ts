import {
  API_CORS_HEADERS,
  CARD_CACHE_CONTROL,
  STATS_CACHE_CONTROL,
} from "@/app/api/constants";
import { renderMissingUserSvg, renderUserCardSvg } from "@/lib/card/svg";
import { getUserStatsByUsername } from "@/lib/duolingo/client";
import { parseCardOptions } from "@/models/card";

export const runtime = "nodejs";

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

    const svg = renderUserCardSvg(userStats, options);

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
