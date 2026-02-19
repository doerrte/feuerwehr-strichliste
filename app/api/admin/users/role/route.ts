import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const auth = cookies().get("auth")?.value;
  if (!auth) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 }
    );
  }

  const session = JSON.parse(auth);

  if (session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Keine Berechtigung" },
      { status: 403 }
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
    },
  });

  return NextResponse.json(users);
}
