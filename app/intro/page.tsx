import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import IntroSlides from "./IntroSlides";

export default async function IntroPage() {
  const cookieStore = cookies();
  const userId = Number(
    cookieStore.get("userId")?.value
  );

  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) redirect("/login");

  async function finishIntro() {
    "use server";

    await prisma.user.update({
      where: { id: userId },
      data: { hasSeenIntro: true },
    });

    redirect("/dashboard");
  }

  return (
    <IntroSlides
      name={user.name}
      role={user.role}
      finishAction={finishIntro}
    />
  );
}