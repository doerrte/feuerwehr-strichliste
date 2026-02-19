import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookie = cookies().get("admin");

  if (cookie?.value === "true") {
    return NextResponse.json({ isAdmin: true });
  }

  return NextResponse.json({ isAdmin: false }, { status: 401 });
}
