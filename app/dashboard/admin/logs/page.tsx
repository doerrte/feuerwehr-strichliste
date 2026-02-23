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

  function getChangeColor(log: Log) {
    if (log.newAmount > log.oldAmount)
      return "text-green-600";
    if (log.newAmount < log.oldAmount)
      return "text-red-600";
    return "text-gray-500";
  }

  function getTypeBadge(type: string) {
    switch (type) {
      case "RESET":
        return "bg-red-100 text-red-700";
      case "ADMIN_EDIT":
        return "bg-blue-100 text-blue-700";
      case "BOOKING":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div className="space-y-8">

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          📜 Änderungsprotokoll
        </h1>
        <p className="text-sm text-gray-500">
          Alle Änderungen im Überblick
        </p>
      </div>

      <input
        placeholder="Benutzer filtern..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-3 rounded-2xl border bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl outline-none"
      />

      <div className="space-y-4">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg border space-y-3"
          >
            <div className="flex justify-between items-start">

              <div className="space-y-1">
                <div className="font-medium">
                  {log.user.name}
                </div>

                <div className="text-sm text-gray-500">
                  {log.drink.name}
                </div>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${getTypeBadge(
                  log.type
                )}`}
              >
                {log.type}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">

              <div className="text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </div>

              <div className={`font-semibold ${getChangeColor(log)}`}>
                {log.oldAmount} → {log.newAmount}
              </div>
            </div>

            <div className="text-xs text-gray-400">
              geändert von {log.admin.name}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}