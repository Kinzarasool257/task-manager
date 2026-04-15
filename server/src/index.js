import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from Root .env (two levels up from server/src)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createRouteHandler } from "uploadthing/express";
import crypto from "node:crypto";
import { uploadRouter } from "./uploadthing.js";



const app = express();

const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;



app.use(cors());

// --- Uploadthing ---
app.use(
  "/api/uploadthing",
  (req, res, next) => {
    // Diagnostic logger to catch 500 errors
    next();
  },
  createRouteHandler({
    router: uploadRouter,
  })
);

app.use(express.json());



/**

 * Health Route

 * Performs a raw query to confirm database connectivity.

 */

app.get("/health", async (req, res) => {

  try {

    await prisma.$queryRaw`SELECT 1`;

    res.json({

      status: "ok",

      database: "connected",

      message: "DailyTM API is healthy",

      timestamp: new Date().toISOString()

    });

  } catch (error) {

    console.error("Health Check Failed:", error);

    res.status(500).json({

      status: "error",

      database: "disconnected",

      error: error.message

    });

  }

});



/**

 * User Sync Route

 * Upserts user data from Kinde based on externalId.

 */

app.post("/api/users/sync", async (req, res) => {

  const { externalId, email, name, image } = req.body;



  if (!externalId || !email) {

    return res.status(400).json({ error: "externalId and email are required" });

  }



  try {
    const { externalId, email, name, image, preferences } = req.body;
    
    // Strict Identity Sync: Match only by externalId from Kinde
    let user = await prisma.user.findUnique({
      where: { externalId }
    });

    if (user) {
      // Update existing user record
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          externalId, 
          email, 
          name, 
          image,
          preferences: preferences ? { ...(user.preferences || {}), ...preferences } : undefined
        }
      });
    } else {
      // Create new user record
      user = await prisma.user.create({
        data: { 
          externalId, 
          email, 
          name, 
          image,
          preferences: preferences || {}
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "User synced successfully",
      user
    });
  } catch (error) {
    console.error("User Sync Error:", error);
    res.status(500).json({ error: "Internal server error during user sync" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Fetch User Error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**

 * Update User Preferences

 */

app.patch("/api/users/:id/preferences", async (req, res) => {

  const { id } = req.params;

  const { preferences } = req.body;

  try {

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        preferences: { ...(user.preferences || {}), ...preferences } 
      },
    });

    res.json(updatedUser);

  } catch (error) {

    console.error("Update Preferences Error:", error);

    res.status(500).json({ error: "Failed to update preferences" });

  }

});



/**

 * Get User by ID (including preferences)

 */

app.get("/api/users/:id", async (req, res) => {

  const { id } = req.params;

  try {

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);

  } catch (error) {

    console.error("Fetch User Error:", error);

    res.status(500).json({ error: "Failed to fetch user" });

  }

});



/**

 * Get Workspaces for a User

 */

app.get("/api/workspaces/:userId", async (req, res) => {

  const { userId } = req.params;



  try {

    const workspaces = await prisma.workspace.findMany({

      where: {

        members: {

          some: {

            userId: userId

          }

        }

      },

      include: {

        members: true

      }

    });



    res.json(workspaces);

  } catch (error) {

    console.error("Fetch Workspaces Error:", error);

    res.status(500).json({ error: "Failed to fetch workspaces" });

  }

});



/**

 * Create Workspace

 * Uses transaction to create Workspace + Admin Member

 */

app.post("/api/workspaces", async (req, res) => {

  const { name, ownerId } = req.body;



  if (!name || !ownerId) {

    return res.status(400).json({ error: "Name and ownerId are required" });

  }



  try {

    // 0. Verify User exists

    const userExists = await prisma.user.findUnique({ where: { id: ownerId } });

    if (!userExists) {

      console.error("Workspace Creation Failed: User not found", { ownerId });

      return res.status(404).json({ error: "User not found. Try re-syncing your profile." });

    }



    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Workspace
      const workspace = await tx.workspace.create({ 
        data: { name, ownerId, inviteCode: crypto.randomUUID() } 
      });

      // 2. Create Member record for the owner
      await tx.member.create({
        data: {
          userId: ownerId,
          workspaceId: workspace.id,
          role: "ADMIN",
        },
      });

      return workspace;
    });



    res.status(201).json({

      success: true,

      workspace: result

    });

  } catch (error) {

    console.error("Create Workspace Error:", {

      message: error.message,

      stack: error.stack,

      payload: { name, ownerId }

    });

    res.status(500).json({

      error: "Failed to create workspace",

      details: error.message

    });

  }

});

app.patch("/api/workspaces/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, plan } = req.body;
  try {
    const workspace = await prisma.workspace.update({
      where: { id },
      data: { 
        name: name || undefined, 
        description: description !== undefined ? description : undefined, 
        plan: plan || undefined 
      },
    });
    res.json(workspace);
  } catch (error) {
    console.error("Update Workspace Error:", error);
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

app.delete("/api/workspaces/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.workspace.delete({ where: { id } });
    res.json({ success: true, message: "Workspace deleted" });
  } catch (error) {
    console.error("Delete Workspace Error:", error);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
});

// --- Members ---

app.get("/api/workspaces/:id/members", async (req, res) => {
  const { id } = req.params;
  try {
    const members = await prisma.member.findMany({
      where: { workspaceId: id },
      include: { 
        user: true,
        projects: { select: { id: true } },
        _count: { select: { projects: true } }
      }
    });
    res.json(members);
  } catch (error) {
    console.error("Fetch Members Error:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

app.post("/api/workspaces/:id/members", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    // 1. Ensure user exists (Upsert placeholder if not found)
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { 
        email, 
        externalId: `invited-${Date.now()}`, 
        name: email.split("@")[0] 
      }
    });

    // 2. Check if member already exists to prevent P2002 Unique Constraint error
    const existing = await prisma.member.findUnique({
      where: {
        userId_workspaceId: { userId: user.id, workspaceId: id }
      }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    // 3. Add to workspace
    const member = await prisma.member.create({
      data: {
        userId: user.id,
        workspaceId: id,
        role: "MEMBER"
      },
      include: { user: true }
    });

    try {
      const workspaceInfo = await prisma.workspace.findUnique({ where: { id } });
      let inviterName = "A team member";
      if (workspaceInfo?.ownerId) {
        const owner = await prisma.user.findUnique({ where: { id: workspaceInfo.ownerId } });
        if (owner?.name) inviterName = owner.name;
      }
      
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "INVITE",
          icon: "invite",
          sender: inviterName,
          title: `has invited you to join ${workspaceInfo?.name || "a Workspace"}`,
          body: `You have been added as a member. Check out the dashboard to begin your new productivity journey!`
        }
      });
    } catch (notifErr) {
      console.error("Failed to generate notification", notifErr);
    }

    res.status(201).json(member);
  } catch (error) {
    console.error("Invite Member Error:", error);
    res.status(500).json({ error: "Failed to invite member." });
  }
});

app.delete("/api/members/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.member.delete({ where: { id } });
    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("Remove Member Error:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
});



// --- Projects ---

app.get("/api/projects/:workspaceId", async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: { 
        tasks: true,
        _count: { select: { members: true } }
      }
    });
    res.json(projects);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.get("/api/projects/by-id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { 
        tasks: true,
        members: { include: { user: true } }
      }
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    console.error("Fetch Project by ID Error:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

app.post("/api/projects", async (req, res) => {
  const { name, description, workspaceId } = req.body;
  if (!name || !workspaceId) {
    return res.status(400).json({ error: "Name and workspaceId are required" });
  }
  try {
    const project = await prisma.project.create({
      data: { name, workspaceId },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

app.patch("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { 
        name: name || undefined, 
        description: description !== undefined ? description : undefined 
      },
    });
    res.json(project);
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({ where: { id } });
    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

app.post("/api/projects/:projectId/members", async (req, res) => {
  const { projectId } = req.params;
  const { memberId } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: memberId }
        }
      },
      include: { members: true }
    });
    res.json(project);
  } catch (error) {
    console.error("Assign Member Error:", error);
    res.status(500).json({ error: "Failed to assign member to project" });
  }
});

app.delete("/api/projects/:projectId/members/:memberId", async (req, res) => {
  const { projectId, memberId } = req.params;
  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: memberId }
        }
      },
      include: { members: true }
    });
    res.json(project);
  } catch (error) {
    console.error("Unassign Member Error:", error);
    res.status(500).json({ error: "Failed to unassign member" });
  }
});

// --- Tasks ---

app.post("/api/tasks", async (req, res) => {
  const { title, description, projectId, status, priority, assignee, startDate, dueDate } = req.body;
  if (!title || !projectId) {
    return res.status(400).json({ error: "Title and projectId are required" });
  }
  try {
    const task = await prisma.task.create({
      data: { 
        title, 
        description, 
        projectId, 
        status: status || undefined,
        priority: priority || "MEDIUM",
        assignee,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined
      },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { 
    status, title, description, priority, assignee, 
    startDate, dueDate, documentation, comments, attachments 
  } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        status: status || undefined,
        title: title || undefined,
        description: description || undefined,
        priority: priority || undefined,
        assignee: assignee || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        documentation: documentation || undefined,
        comments: comments ? (Array.isArray(comments) ? comments : JSON.parse(comments)) : undefined,
        attachments: attachments ? (Array.isArray(attachments) ? attachments : JSON.parse(attachments)) : undefined
      },
    });
    res.json(task);
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// --- Notifications ---

app.get("/api/users/:userId/notifications", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.patch("/api/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    console.error("Update Notification Error:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  if (!process.env.UPLOADTHING_TOKEN) {
    console.warn('\x1b[33m%s\x1b[0m', '[WARNING]: UPLOADTHING_TOKEN is missing from .env. File uploads will fail.');
  }
});



// Graceful shutdown

process.on("SIGINT", async () => {

  await prisma.$disconnect();

  process.exit(0);

});

// --- Invitation Routes ---

/**
 * Get Public Workspace Info by Invite Code
 */
app.get("/api/workspace-invite/:inviteCode", async (req, res) => {
  const { inviteCode } = req.params;
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true
      }
    });

    if (!workspace) return res.status(404).json({ error: "Invalid or expired invite link." });

    const owner = await prisma.user.findUnique({
      where: { id: workspace.ownerId },
      select: { name: true }
    });

    res.json({ ...workspace, inviterName: owner?.name || "A team member" });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching invite info." });
  }
});

/**
 * Join Workspace by Invite Code
 */
app.post("/api/workspace-invite/:inviteCode/join", async (req, res) => {
  const { inviteCode } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID is required." });

  try {
    const workspace = await prisma.workspace.findUnique({ where: { inviteCode } });
    if (!workspace) return res.status(404).json({ error: "Invalid invite code." });

    const existing = await prisma.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: workspace.id } }
    });
    if (existing) return res.status(200).json({ message: "Already a member.", workspaceId: workspace.id });

    await prisma.member.create({ data: { userId, workspaceId: workspace.id, role: "MEMBER" } });
    res.status(201).json({ message: "Joined successfully", workspaceId: workspace.id });
  } catch (err) {
    console.error("Join Error:", err);
    res.status(500).json({ error: "Failed to join workspace." });
  }
});

/**
 * Refresh/Reset Invite Code
 */
app.patch("/api/workspaces/:id/reset-invite", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.workspace.update({
      where: { id },
      data: { inviteCode: crypto.randomUUID() }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to reset invite code." });
  }
});
