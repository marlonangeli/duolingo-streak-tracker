import { NextResponse } from "next/server";
import { API_BASE_URL, API_QUERY_PARAMETERS } from "@/app/api/constants";
import { User } from "@/models/user";

export const runtime = "edge";

export async function GET(
  request: Request,
  context: { params: { user: string } }
) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };

  const user = context.params.user;

  const response = await fetch(API_BASE_URL + user + API_QUERY_PARAMETERS, {
    headers: {
      accept: "application/json; charset=UTF-8",
      "User-Agent":
        "DuolingoStreakTracker/1.0.0 Dalvik/2.1.0 (Linux; U; Android 7.1.2; SM-G955U Build/NRD90M)",
    },
    method: "GET",
    cache: "no-cache",
  });

  const body = await response.json();

  if (body.users.length === 0) {
    // return ErrorResponse user notfound
    return NextResponse.json(
      { error: "user not found" },
      { headers, status: 404 }
    );
  }

  const userData: User = body.users[0];

  return NextResponse.json(userData, { headers, status: 200 });
}
