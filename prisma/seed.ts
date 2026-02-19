import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("1234", 10);
  const userHash = await bcrypt.hash("1234", 10);

  // 🔐 Admin-User
  await prisma.user.upsert({
    where: { phone: "01701234567" },
    update: {
      passwordHash: adminHash,
      role: "ADMIN",
    },
    create: {
      name: "Admin",
      phone: "01701234567",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  // 👤 Test-User (KEIN Admin)
  await prisma.user.upsert({
    where: { phone: "01709876543" },
    update: {
      passwordHash: userHash,
      role: "USER",
    },
    create: {
      name: "Testuser",
      phone: "01709876543",
      passwordHash: userHash,
      role: "USER",
    },
  });

  console.log("✅ Admin-User & Test-User bereit");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });