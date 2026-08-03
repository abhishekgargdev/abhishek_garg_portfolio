import { NextResponse } from "next/server";
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(0),
    maxAge: 0,
  });

  return response;
}
