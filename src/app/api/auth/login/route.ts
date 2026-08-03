import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  signToken,
} from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export const runtime = "nodejs";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as LoginBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    await connectDB();

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = await signToken({
      sub: admin._id.toString(),
      email: admin.email,
    });

    const response = NextResponse.json({
      message: "Logged in successfully",
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    console.error("[auth/login] Failed to log in:", error);
    return NextResponse.json(
      { error: "Unable to log in right now" },
      { status: 500 },
    );
  }
}
