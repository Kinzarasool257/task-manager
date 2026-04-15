import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("--- Users ---");
  const users = await prisma.user.findMany();
  console.log(JSON.stringify(users, null, 2));

  console.log("\n--- Workspaces ---");
  const workspaces = await prisma.workspace.findMany();
  console.log(JSON.stringify(workspaces, null, 2));

  console.log("\n--- Members ---");
  const members = await prisma.member.findMany();
  console.log(JSON.stringify(members, null, 2));

  console.log("\n--- Projects ---");
  const projects = await prisma.project.findMany();
  console.log(JSON.stringify(projects, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
