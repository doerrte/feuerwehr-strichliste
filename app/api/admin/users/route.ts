import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

function isAdmin() {
  const userId = cookies().get("userId")?.value;
  return !!userId; // Middleware schützt Admin-Bereich
}

// 🔥 GET – alle Benutzer
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

// 🔥 POST – neuen Benutzer anlegen
export async function POST(req: Request) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, phone, password, role } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "Fehlende Daten" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role: role === "ADMIN" ? "ADMIN" : "USER",
        active: true,
      },
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("USER CREATE ERROR:", error);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
