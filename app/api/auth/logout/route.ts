import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get("redirect") || "/login";

  const response = NextResponse.redirect(
    new URL(redirectTo, req.url)
  );

  response.cookies.set("userId", "", { maxAge: 0 });

  return response;
}