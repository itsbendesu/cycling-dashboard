import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "velotron";
const COOKIE_NAME = "velotron-auth";
// 90 days
const MAX_AGE = 60 * 60 * 24 * 90;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password } = body;

  if (password !== SITE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  // Create a simple token — hash of password + a secret
  const token = Buffer.from(`${SITE_PASSWORD}:${Date.now()}`).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
