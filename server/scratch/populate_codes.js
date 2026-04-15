import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const workspaces = await prisma.workspace.findMany({
    where: { inviteCode: null }
  });

  console.log(`Found ${workspaces.length} workspaces without invite codes.`);

  for (const ws of workspaces) {
    const code = randomUUID();
    await prisma.workspace.update({
      where: { id: ws.id },
      data: { inviteCode: code }
    });
    console.log(`Generated invite code for ${ws.name}: ${code}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
