import { NextResponse } from "next/server";
import {
  API_CORS_HEADERS,
  STATS_CACHE_CONTROL,
} from "@/app/api/constants";
import { getUserStatsByUsername } from "@/lib/duolingo/client";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ user: string }> }
) {
  const headers = {
    ...API_CORS_HEADERS,
    "Cache-Control": STATS_CACHE_CONTROL,
    "Content-Type": "application/json; charset=utf-8",
  };

  try {
    const { user } = await context.params;
    const userStats = await getUserStatsByUsername(user);

    if (!userStats) {
      return NextResponse.json(
        {
          error: "user_not_found",
          message: `No public Duolingo profile found for @${user}`,
        },
        { status: 404, headers }
      );
    }

    return NextResponse.json(userStats, { status: 200, headers });
  } catch {
    return NextResponse.json(
      {
        error: "upstream_unavailable",
        message: "Duolingo data is temporarily unavailable",
      },
      { status: 502, headers }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: API_CORS_HEADERS,
  });
}
