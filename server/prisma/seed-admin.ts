// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// PrismaClientOptions typings may not include `adapter`, cast to any to satisfy TS.
const prisma = new PrismaClient({});


async function main() {
  const adminEmails = [
    "admin@tradovatefutures.com",
    "inspire.ig5702@gmail.com",
    "brightawah94@gmail.com"
  ];

  console.log("🌱 Seeding admin whitelist...");

  await prisma.adminWhitelist.createMany({
    data: adminEmails.map(email => ({ email })),
    skipDuplicates: true, // 🔥 important
  });

  console.log("✅ Admin whitelist seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
