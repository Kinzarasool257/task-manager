import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

/**
 * Health Check Route
 */
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      database: "disconnected", 
      error: error.message 
    });
  }
});

/**
 * Kinde User Sync Route
 * Checks if user exists in DB by externalId; creates one if not.
 */
app.post("/api/users/sync", async (req, res) => {
  const { externalId, email, name } = req.body;

  if (!externalId || !email) {
    return res.status(400).json({ error: "externalId and email are required" });
  }

  try {
    const user = await prisma.user.upsert({
      where: { externalId },
      update: { email, name }, // Update details if email or name changed
      create: { externalId, email, name },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error("User Sync Error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DailyTM Backend running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
