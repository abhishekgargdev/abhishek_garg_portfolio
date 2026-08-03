import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export const runtime = "nodejs";

type SetupBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    await connectDB();

    const existingCount = await Admin.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        { error: "Admin already configured" },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as SetupBody;
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await Admin.create({ email, passwordHash });

    return NextResponse.json(
      { message: "Admin account created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[auth/setup] Failed to create admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 },
    );
  }
}
