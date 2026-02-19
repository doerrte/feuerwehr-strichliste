import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const MAX_CAPTCHA_ATTEMPTS = 5;
const BLOCK_TIME_SECONDS = 60;

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

    // 🔒 Aktive Sperre prüfen
    if (
      user.captchaBlockedUntil &&
      new Date(user.captchaBlockedUntil) > new Date()
    ) {
      const secondsLeft = Math.ceil(
        (new Date(user.captchaBlockedUntil).getTime() - Date.now()) / 1000
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

    // 🔐 Passwort prüfen
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

    // 🔥 CAPTCHA nur prüfen wenn bereits Versuche existieren
    if (user.failedCaptchaAttempts > 0) {

      if (!captchaValid) {

        const newAttempts = user.failedCaptchaAttempts + 1;

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
    }

    // ✅ Erfolgreicher Login → alles zurücksetzen
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
