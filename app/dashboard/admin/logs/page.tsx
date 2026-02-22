"use client";

import { useEffect, useState } from "react";

type Log = {
  id: number;
  admin: { name: string };
  user: { name: string };
  drink: { name: string };
  oldAmount: number;
  newAmount: number;
  type: string;
  createdAt: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const res = await fetch("/api/admin/logs");
    const data = await res.json();
    setLogs(data);
  }

  const filtered = logs.filter((log) =>
    log.user.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-bold">
        📜 Änderungsprotokoll
      </h1>

      <input
        placeholder="Benutzer filtern..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <div className="overflow-x-auto">
        <table className="w-full border mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Datum</th>
              <th className="border p-2">Admin</th>
              <th className="border p-2">Benutzer</th>
              <th className="border p-2">Getränk</th>
              <th className="border p-2">Von</th>
              <th className="border p-2">Auf</th>
              <th className="border p-2">Typ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id}>
                <td className="border p-2">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="border p-2">
                  {log.admin.name}
                </td>
                <td className="border p-2">
                  {log.user.name}
                </td>
                <td className="border p-2">
                  {log.drink.name}
                </td>
                <td className="border p-2">
                  {log.oldAmount}
                </td>
                <td className="border p-2">
                  {log.newAmount}
                </td>
                <td className="border p-2">
                  {log.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}