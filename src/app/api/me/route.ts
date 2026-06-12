import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Lightweight current-user lookup for client components (the nav header).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { role: user.role, username: user.username } });
}
