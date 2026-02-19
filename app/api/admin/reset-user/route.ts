import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function isAdmin() {
  const auth = cookies().get("auth");
  if (!auth) return false;
  try {
    return JSON.parse(auth.value).role === "ADMIN";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();

  await prisma.count.updateMany({
    where: { userId },
    data: { amount: 0 },
  });

  return NextResponse.json({ ok: true });
}
