export default function AnleitungPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📘 Anleitung
      </h1>

      <section className="space-y-2">
        <h2 className="font-semibold">
          Benutzer
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Getränk auswählen</li>
          <li>+ / – oder Anzahl eingeben</li>
          <li>Buchung bestätigen</li>
          <li>QR-Code scannen</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">
          Admin
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Lager verwalten</li>
          <li>Strichliste korrigieren</li>
          <li>QR-PDF generieren</li>
          <li>Reset durchführen</li>
        </ul>
      </section>
    </main>
  );
}