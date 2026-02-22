import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { name },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(
    password,
    user.password
  );

  if (!valid) {
    return NextResponse.json(
      { error: "Falsches Passwort" },
      { status: 401 }
    );
  }

  const cookieStore = cookies();

  cookieStore.set("userId", String(user.id), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  // 🔥 Intro-Weiterleitung
  if (!user.hasSeenIntro) {
    return NextResponse.json({
      redirect: "/intro",
    });
  }

  return NextResponse.json({
    redirect: "/dashboard",
  });
}