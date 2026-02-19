import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const auth = cookies().get("auth");
  if (!auth) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const { role } = JSON.parse(auth.value);
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const userId = Number(body.userId);
  const drinkId = Number(body.drinkId);

  if (!userId || !drinkId) {
    return NextResponse.json(
      { error: "userId oder drinkId fehlt" },
      { status: 400 }
    );
  }

  await prisma.count.updateMany({
    where: { userId, drinkId },
    data: { amount: 0 },
  });

  return NextResponse.json({ success: true });
}
