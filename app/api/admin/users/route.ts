import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const userId = Number(cookies().get("userId")?.value);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

/* =========================
   GET – Alle Benutzer
========================= */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      active: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}

/* =========================
   POST – Neuen Benutzer anlegen
========================= */
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  try {
    const { name, phone, password, role } = await req.json();

    if (!name || !phone || !password || !role) {
      return NextResponse.json(
        { error: "Fehlende Daten" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Benutzer existiert bereits" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash: hash,
        role,
        active: true,
      },
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("CREATE USER ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}