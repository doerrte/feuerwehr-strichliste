"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserIcon } from "@heroicons/react/24/solid";

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

    const interval = setInterval(loadUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>

      <h1 className="text-4xl font-bold text-center mb-12">
        Benutzer auswählen
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => router.push(`/kiosk/login/${user.id}`)}
            className="
              bg-feuerwehr-gray
              border-2 border-feuerwehr-red/30
              rounded-3xl
              p-8
              shadow-xl
              text-xl font-semibold
              hover:bg-feuerwehr-red
              hover:text-white
              hover:scale-105
              transition
            "
          >
            <div className="flex flex-col items-center gap-4">
              <UserIcon className="w-10 h-10" />
              {user.name}
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}