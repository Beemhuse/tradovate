// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Set it in your environment before running the seed."
  );
}

const adapter = new PrismaPg({ connectionString });

// PrismaClientOptions typings may not include `adapter`, cast to any to satisfy TS.
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "brightawah94@gmail.com";
  console.log("Seeding admin whitelist...");

  const existing = await prisma.adminWhitelist.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`✓ Admin email ${adminEmail} already in whitelist`);
  } else {
    await prisma.adminWhitelist.create({
      data: { email: adminEmail },
    });
    console.log(`✓ Added ${adminEmail} to admin whitelist`);
  }

  console.log("\nAdmin whitelist seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding admin whitelist:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // ensure process exits after disconnect
    process.exit(0);
  });
