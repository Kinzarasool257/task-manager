import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Starting Database Cleanup...");
  
  try {
    const projects = await prisma.project.findMany({
      include: { tasks: true }
    });

    const groups = {};
    projects.forEach(p => {
      const key = `${p.workspaceId}:${p.name.toLowerCase().trim()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    for (const key in groups) {
      const dups = groups[key];
      if (dups.length > 1) {
        console.log(`Found ${dups.length} duplicates for project: ${dups[0].name}`);
        
        // Keep the one with the most tasks, or the first one
        dups.sort((a, b) => b.tasks.length - a.tasks.length);
        const [keep, ...remove] = dups;

        console.log(`Keeping project ID: ${keep.id} (Tasks: ${keep.tasks.length})`);

        for (const target of remove) {
          console.log(`Removing project ID: ${target.id} (Tasks: ${target.tasks.length})`);
          
          // Move tasks to the kept project
          if (target.tasks.length > 0) {
            await prisma.task.updateMany({
              where: { projectId: target.id },
              data: { projectId: keep.id }
            });
            console.log(`  Moved ${target.tasks.length} tasks to ${keep.id}`);
          }

          // Delete the duplicate project
          await prisma.project.delete({
            where: { id: target.id }
          });
        }
      }
    }

    console.log("Merging duplicate tasks...");
    const allTasks = await prisma.task.findMany();
    const taskGroups = {};
    allTasks.forEach(t => {
      const key = `${t.projectId}:${t.title.toLowerCase().trim()}`;
      if (!taskGroups[key]) taskGroups[key] = [];
      taskGroups[key].push(t);
    });

    for (const key in taskGroups) {
      const dups = taskGroups[key];
      if (dups.length > 1) {
        console.log(`Found ${dups.length} duplicate tasks for: ${dups[0].title}`);
        // Keep the newest one
        dups.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const [keep, ...remove] = dups;
        
        for (const target of remove) {
          console.log(`  Deleting duplicate task ID: ${target.id}`);
          await prisma.task.delete({ where: { id: target.id } });
        }
      }
    }

    console.log("Cleanup complete!");
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
