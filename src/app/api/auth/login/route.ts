import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie, verifyCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!verifyCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username);
    const response = NextResponse.json({ success: true });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
