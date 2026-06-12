import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "owner@fonce.app";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";

  // The single owner / VIP / admin account that sees all income + analytics.
  await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      name: "FONCÉ Owner",
      username: "fonce-admin",
    },
  });

  // A demo creator so you can browse a storefront right away.
  const demoEmail = "creator@demo.app";
  await db.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      passwordHash: await bcrypt.hash("demo1234", 10),
      role: "CREATOR",
      name: "Demo Creator",
      username: "demo",
      bio: "Curated finds. Tap a product to shop.",
    },
  });

  console.log("Seeded:");
  console.log(`  Admin  -> ${adminEmail} / ${adminPassword}`);
  console.log(`  Creator-> ${demoEmail} / demo1234  (storefront: /demo)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
