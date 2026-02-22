import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { createSignature } from "@/lib/qrSignature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const drinkId = Number(params.id);

  const drink = await prisma.drink.findUnique({
    where: { id: drinkId },
  });

  if (!drink) {
    return NextResponse.json(
      { error: "Nicht gefunden" },
      { status: 404 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const signature = createSignature(drinkId);

  const url =
    `${baseUrl}/scan/${drinkId}?sig=${signature}`;

  const qr = await QRCode.toDataURL(url);

  return NextResponse.json({ qr });
}