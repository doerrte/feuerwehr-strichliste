"use client";

import { useState } from "react";

type Props = {
  name: string;
  role: string;
  finishAction: () => void;
};

export default function IntroSlides({
  name,
  role,
  finishAction,
}: Props) {
  const slides = [
    {
      title: `Willkommen, ${name} 👋`,
      text: "Diese App hilft dir, deine Getränke einfach zu buchen.",
    },
    {
      title: "🥤 Getränke buchen",
      text: "Wähle ein Getränk, stelle die Anzahl ein und bestätige deine Buchung.",
    },
    {
      title: "📱 QR-Code nutzen",
      text: "Scanne den QR-Code am Getränk für eine schnelle Buchung.",
    },
    ...(role === "ADMIN"
      ? [
          {
            title: "🛠 Admin Funktionen",
            text: "Du kannst Lager verwalten, Mindestbestand setzen und Strichlisten korrigieren.",
          },
        ]
      : []),
    {
      title: "🚀 Los geht’s!",
      text: "Du bist bereit. Viel Spaß mit der App!",
    },
  ];

  const [current, setCurrent] = useState(0);

  const isLast = current === slides.length - 1;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white max-w-md w-full rounded-xl shadow p-6 space-y-6 text-center">

        <h1 className="text-xl font-bold">
          {slides[current].title}
        </h1>

        <p className="text-gray-600">
          {slides[current].text}
        </p>

        {/* Punkte */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === current
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between pt-4">

          {current > 0 ? (
            <button
              onClick={() =>
                setCurrent((c) => c - 1)
              }
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Zurück
            </button>
          ) : (
            <div />
          )}

          {!isLast ? (
            <button
              onClick={() =>
                setCurrent((c) => c + 1)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Weiter
            </button>
          ) : (
            <form action={finishAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Fertig
              </button>
            </form>
          )}

        </div>

      </div>
    </main>
  );
}