import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import IntroClient from "./IntroClient";

export default async function IntroPage() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.hasSeenIntro) {
    redirect("/dashboard");
  }

  return <IntroClient name={user.name} />;
}