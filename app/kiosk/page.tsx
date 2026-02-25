"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 p-8 md:p-14">

      {/* Header */}
      <div className="text-center mb-12 space-y-4">

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
            <Image
              src="/icons/feuerwehr.png"
              alt="Feuerwehr"
              width={50}
              height={50}
              priority
            />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold">
          Benutzer auswählen
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          Bitte wähle dein Profil aus
        </p>
      </div>

      {/* User Grid */}
      <div className="
        grid
        grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        gap-6 md:gap-8
      ">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => router.push(`/kiosk/login/${user.id}`)}
            className="
              group
              bg-white dark:bg-gray-900
              rounded-3xl
              p-8
              shadow-lg
              border border-gray-200 dark:border-gray-800
              text-xl font-semibold
              hover:scale-105
              hover:shadow-2xl
              transition-all duration-300
            "
          >
            <div className="flex flex-col items-center gap-4">

              {/* Avatar Circle */}
              <div className="
                w-16 h-16
                rounded-full
                bg-red-600
                text-white
                flex items-center justify-center
                text-2xl
                shadow-md
              ">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <span className="text-center">
                {user.name}
              </span>

            </div>
          </button>
        ))}
      </div>

    </main>
  );
}