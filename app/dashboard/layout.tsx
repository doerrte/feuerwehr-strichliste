import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      name: true,
      role: true,
      active: true,
    },
  });

  if (!user || !user.active) {
    redirect("/login");
  }

  return (
    <div className="relative w-full max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen flex flex-col bg-white dark:bg-gray-900 shadow-xl">

      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <h1 className="text-sm sm:text-base font-semibold tracking-wide">
          Feuerwehr Bedburg <br />
          Einheit 5 Strichliste
        </h1>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {children}
      </main>

      <Navbar role={user.role} />
    </div>
  );
}