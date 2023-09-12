import { NextResponse } from "next/server";
import { API_BASE_URL, API_QUERY_PARAMETERS } from "@/app/api/constants";

export const runtime = "edge";

export async function GET(
  request: Request,
  context: { params: { user: string } }
) {
  const headers = { "Content-Type": "application/json" };

  const user = context.params.user;

  const response = await fetch(API_BASE_URL + user + API_QUERY_PARAMETERS, {
    headers: {
      accept: "application/json; charset=UTF-8",
      "User-Agent":
        "DuolingoStreakTracker/1.0.0 Dalvik/2.1.0 (Linux; U; Android 7.1.2; SM-G955U Build/NRD90M)",
    },
    method: "GET",
  });

  const body = await response.json();

  return NextResponse.json(body, { headers });
}
