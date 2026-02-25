"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
};

export default function KioskPage() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadUsers() {
      const res = await fetch("/api/kiosk/users");
      const data = await res.json();
      setUsers(data);
    }
    loadUsers();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 p-10">

      <h1 className="text-3xl font-bold mb-10 text-center">
        Benutzer auswählen
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => router.push(`/kiosk/login/${user.id}`)}
            className="
              bg-white dark:bg-gray-900
              rounded-3xl
              p-6
              shadow-lg
              text-lg
              font-medium
              hover:scale-105
              transition
            "
          >
            {user.name}
          </button>
        ))}
      </div>

    </main>
  );
}