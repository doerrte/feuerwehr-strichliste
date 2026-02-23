import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const userId = Number(cookieStore.get("userId")?.value);

  if (!userId) {
    return NextResponse.json(
      { error: "Nicht eingeloggt" },
      { status: 401 }
    );
  }

  const { phone, oldPassword, newPassword } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Benutzer nicht gefunden" },
      { status: 404 }
    );
  }

  const updateData: any = {};

  // 📱 Telefonnummer ändern
  if (phone && phone !== user.phone) {
    updateData.phone = phone;
  }

  // 🔐 Passwort ändern
  if (newPassword) {
    if (!oldPassword) {
      return NextResponse.json(
        { error: "Altes Passwort erforderlich" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Altes Passwort falsch" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);
    updateData.passwordHash = hash;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}