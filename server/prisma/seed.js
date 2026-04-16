import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding guest user...");

  const guestUser = await prisma.user.upsert({
    where: { id: "cm1234567890guest" },
    update: {},
    create: {
      id: "cm1234567890guest",
      email: "guest@dailytm.app",
      externalId: "guest_external_id",
      name: "Guest User",
      preferences: {
        role: "Guest",
        industry: "DailyTM",
        country: "World",
        bio: "This is a guest account for exploring the DailyTM Task Manager."
      }
    },
  });

  console.log("Guest user ensured:", guestUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
