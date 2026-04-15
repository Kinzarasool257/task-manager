import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['kizarasool298@gmail.com', 'kinzarasool14@gmail.com']
      }
    },
    select: {
      id: true,
      email: true,
      externalId: true
    }
  });
  console.log("Found Users:", JSON.stringify(users, null, 2));

  for (const user of users) {
    const memberships = await prisma.member.findMany({
      where: { userId: user.id },
      include: { workspace: true }
    });
    console.log(`Memberships for ${user.email} (ID: ${user.id}):`, JSON.stringify(memberships.map(m => m.workspace.name), null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
