import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const MAX_CAPTCHA_ATTEMPTS = 5;      // 🔥 5 freie Versuche
const BLOCK_TIME_SECONDS = 60;       // 🔥 60 Sek Sperre

export async function POST(req: Request) {
  try {
    const { phone, password, captchaValid } = await req.json();

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 401 }
      );
    }

    // 🔒 Prüfen ob aktuell gesperrt
    if (
      user.captchaBlockedUntil &&
      new Date(user.captchaBlockedUntil) > new Date()
    ) {
      const secondsLeft = Math.ceil(
        (new Date(user.captchaBlockedUntil).getTime() -
          Date.now()) /
          1000
      );

      return NextResponse.json(
        {
          error: `Zu viele Versuche. Bitte ${secondsLeft} Sekunden warten.`,
          blocked: true,
          secondsLeft,
        },
        { status: 403 }
      );
    }

    // 🔥 CAPTCHA FEHLER
    if (!captchaValid) {

      const newAttempts = user.failedCaptchaAttempts + 1;

      // 🔥 ERST AB DEM 6. VERSUCH SPERREN
      if (newAttempts > MAX_CAPTCHA_ATTEMPTS) {

        const blockUntil = new Date(
          Date.now() + BLOCK_TIME_SECONDS * 1000
        );

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedCaptchaAttempts: newAttempts,
            captchaBlockedUntil: blockUntil,
          },
        });

        return NextResponse.json(
          {
            error: `Zu viele Captcha-Fehler. ${BLOCK_TIME_SECONDS} Sekunden gesperrt.`,
            blocked: true,
            secondsLeft: BLOCK_TIME_SECONDS,
          },
          { status: 403 }
        );
      }

      // 🔥 Noch unter 6 → nur erhöhen
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedCaptchaAttempts: newAttempts,
        },
      });

      return NextResponse.json(
        {
          error: `Captcha falsch (${newAttempts}/${MAX_CAPTCHA_ATTEMPTS})`,
          attempts: newAttempts,
        },
        { status: 400 }
      );
    }

    // 🔑 Passwort prüfen
    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Falsches Passwort" },
        { status: 401 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Benutzer deaktiviert" },
        { status: 403 }
      );
    }

    // ✅ Erfolgreicher Login → Zähler zurücksetzen
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedCaptchaAttempts: 0,
        captchaBlockedUntil: null,
      },
    });

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
    });

    response.cookies.set("userId", String(user.id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return response;

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    );
  }
}
