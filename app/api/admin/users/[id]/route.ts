import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  return !!cookies().get("userId")?.value;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(params.id) },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      active: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Nicht gefunden" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}
